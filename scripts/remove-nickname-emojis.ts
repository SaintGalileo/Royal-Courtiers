import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";
import { listNicknameEmojiCleanups } from "../lib/strip-emojis";

type MemberRow = {
  id: string;
  first_name: string;
  nick_name: string;
};

function loadEnvFile(): void {
  const envPath = join(process.cwd(), ".env");
  const content = readFileSync(envPath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

async function main() {
  loadEnvFile();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const apply = process.argv.includes("--apply");

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env",
    );
  }

  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from("members")
    .select("id, first_name, nick_name")
    .order("nick_name");

  if (error) {
    throw new Error(`Failed to load members: ${error.message}`);
  }

  const members = (data ?? []) as MemberRow[];
  const changes = listNicknameEmojiCleanups(members);

  if (changes.length === 0) {
    console.log("No nicknames with emojis found.");
    return;
  }

  console.log(
    apply
      ? `Applying ${changes.length} nickname update(s)...`
      : `Dry run — ${changes.length} nickname(s) would be updated. Pass --apply to write changes.`,
  );
  console.log("");

  for (const change of changes) {
    const fallbackNote = change.usedFirstNameFallback
      ? " (fell back to first name)"
      : "";
    console.log(`  ${change.before} → ${change.after}${fallbackNote}`);
  }

  if (!apply) {
    console.log("\nNo changes written. Re-run with --apply to update Supabase.");
    return;
  }

  let updated = 0;
  let failed = 0;

  for (const change of changes) {
    const { error: updateError } = await supabase
      .from("members")
      .update({ nick_name: change.after })
      .eq("id", change.id);

    if (updateError) {
      failed++;
      console.error(`Failed to update ${change.before}: ${updateError.message}`);
      continue;
    }
    updated++;
  }

  console.log(`\nDone. Updated ${updated}, failed ${failed}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
