import { createClient } from "@supabase/supabase-js";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import {
  applyLegacySizeEstimatesToRosters,
  DEFAULT_CHEST_BUFFER_INCHES,
  formatEstimateReport,
} from "../lib/estimate-legacy-shirt-sizes";
import {
  collectNations,
  DEFAULT_EXPORT_COLUMNS,
  resolveAllFamilyRosters,
  SHIRT_SIZE_TYPE_OPTIONS,
  type MemberSeed,
} from "../lib/t-shirts";

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

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env",
    );
  }

  const writeSession = process.argv.includes("--write-session");
  const supabase = createClient(url, key);

  const { data, error } = await supabase
    .from("members")
    .select(
      "id, first_name, nick_name, date_of_birth, shirt_size, shirt_chest_inches, nation_of_residence, gender, family",
    );

  if (error) {
    throw new Error(`Failed to load members: ${error.message}`);
  }

  const members = (data ?? []) as MemberSeed[];
  const baseRosters = resolveAllFamilyRosters(members);
  const result = applyLegacySizeEstimatesToRosters(baseRosters, members, {
    chestBufferInches: DEFAULT_CHEST_BUFFER_INCHES,
  });

  console.log(formatEstimateReport(result));

  if (writeSession) {
    const outputDir = join(process.cwd(), "data");
    mkdirSync(outputDir, { recursive: true });
    const session = {
      rosters: result.rosters,
      selectedNations: collectNations(result.rosters),
      selectedShirtSizeTypes: [...SHIRT_SIZE_TYPE_OPTIONS],
      exportColumns: [...DEFAULT_EXPORT_COLUMNS],
    };
    const outputPath = join(outputDir, "estimated-t-shirts-session.json");
    writeFileSync(outputPath, JSON.stringify(session, null, 2), "utf8");
    console.log(`\nWrote session file: ${outputPath}`);
    console.log(
      "Import this in Admin → Anniversary T-Shirts using “Import session file”, or use “Estimate legacy sizes” in the browser.",
    );
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
