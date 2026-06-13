import type { SupabaseClient } from "@supabase/supabase-js";

type SaveMemberShirtSizeOptions = {
  memberId?: string;
  memberCode?: string;
};

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Unknown error";
}

export function formatShirtSizeSaveError(message: string): string {
  if (
    message.includes("shirt_chest_inches") ||
    message.includes("PGRST204") ||
    message.includes("schema cache")
  ) {
    return `${message} Run supabase-migration-shirt-chest.sql in the Supabase SQL Editor, then reload the API schema if needed.`;
  }
  return message;
}

export async function saveMemberShirtSize(
  supabase: SupabaseClient,
  chest: number,
  label: string,
  { memberId, memberCode }: SaveMemberShirtSizeOptions,
) {
  if (!memberId && !memberCode) {
    throw new Error("Missing member identity for shirt size update.");
  }

  let query = supabase
    .from("members")
    .update({
      shirt_chest_inches: chest,
      shirt_size: label,
    });

  if (memberId) {
    query = query.eq("id", memberId);
  } else if (memberCode) {
    query = query.ilike("code", memberCode.trim());
  }

  const { data, error } = await query.select("*").maybeSingle();

  if (error) {
    throw new Error(formatShirtSizeSaveError(error.message));
  }

  if (!data) {
    throw new Error(
      "No member record was updated. Please log out and log back in, then try again.",
    );
  }

  return data;
}
