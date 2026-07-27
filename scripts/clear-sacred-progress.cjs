const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

const env = Object.fromEntries(
  fs
    .readFileSync(".env", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      let v = l.slice(i + 1).trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      return [l.slice(0, i).trim(), v];
    }),
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing Supabase env");
  process.exit(1);
}

const supabase = createClient(url, key);

(async () => {
  const { count: before, error: e0 } = await supabase
    .from("user_progress")
    .select("*", { count: "exact", head: true });

  if (e0) {
    console.error("Count failed:", e0.message);
    process.exit(1);
  }

  console.log("Rows before:", before);

  const { error, count } = await supabase
    .from("user_progress")
    .delete({ count: "exact" })
    .gte("day_number", 0);

  if (error) {
    console.error("Delete failed:", error.message);
    process.exit(1);
  }

  console.log("Deleted rows:", count);

  const { count: after } = await supabase
    .from("user_progress")
    .select("*", { count: "exact", head: true });

  console.log("Rows after:", after);
})();
