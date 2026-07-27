import { createClient } from "@/lib/supabase/client";
import type { CorrectOption } from "@/lib/sacred-records-game";
import { MAX_DAY_POINTS } from "@/lib/sacred-records-game";

export type SacredRecord = {
  id: string;
  day_number: number;
  title: string;
  category: string;
  content: string;
};

export type SacredRecordQuestion = {
  id: string;
  record_id: string;
  prompt: string;
  option_a: string;
  option_b: string;
  correct_option: CorrectOption;
  created_at?: string;
};

/** Safe for client quiz UI — no correct_option. */
export type SacredRecordQuestionPublic = {
  id: string;
  record_id: string;
  prompt: string;
  option_a: string;
  option_b: string;
};

export type UserProgress = {
  day_number: number;
  completed: boolean;
  points_earned: number;
  completed_at: string | null;
  quiz_scores?: {
    questionIds: string[];
    perQuestion: number[];
    readPoints: number;
    quizPoints: number;
    finalized_at: string;
  } | null;
};

export type LeaderboardEntry = {
  userId: string;
  firstName: string;
  lastName: string;
  family: string;
  photoUrl: string | null;
  totalPoints: number;
  completedDays: number;
};

export async function getSacredRecords() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sacred_records")
    .select("*")
    .order("day_number", { ascending: true });

  if (error) throw error;

  const records = (data ?? []) as SacredRecord[];

  if (records.some((record) => record.day_number >= 100_000)) {
    await reorderSacredRecords(
      sortSacredRecords(records).map((record) => record.id),
    );
    const { data: healed, error: healError } = await supabase
      .from("sacred_records")
      .select("*")
      .order("day_number", { ascending: true });
    if (healError) throw healError;
    return (healed ?? []) as SacredRecord[];
  }

  return records;
}

export async function getUserProgress(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;
  return (data ?? []) as UserProgress[];
}

export async function completeDay(
  userId: string,
  dayNumber: number,
  points: number,
) {
  const supabase = createClient();

  const { error: upsertError } = await supabase.from("user_progress").upsert(
    {
      user_id: userId,
      day_number: dayNumber,
      completed: true,
      points_earned: points,
      completed_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id, day_number",
    },
  );

  if (upsertError) {
    console.error("Supabase upsert error:", upsertError);
    throw upsertError;
  }

  return { success: true };
}

export function calculateStreak(progress: UserProgress[]) {
  if (!progress || progress.length === 0) return 0;

  const completedDates = progress
    .filter((p) => p.completed && p.completed_at)
    .map((p) => new Date(p.completed_at!).toDateString());

  if (completedDates.length === 0) return 0;

  const uniqueDates = Array.from(new Set(completedDates))
    .map((d) => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime());

  let streak = 0;
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const firstDate = uniqueDates[0];
  const diffDays = Math.floor(
    (currentDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays > 1) return 0;

  for (let i = 0; i < uniqueDates.length; i++) {
    streak++;
  }

  return streak;
}

export async function createSacredRecord(data: Omit<SacredRecord, "id">) {
  const supabase = createClient();
  const { data: record, error } = await supabase
    .from("sacred_records")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return record as SacredRecord;
}

export async function updateSacredRecord(
  id: string,
  data: Partial<Omit<SacredRecord, "id">>,
) {
  const supabase = createClient();
  const { data: record, error } = await supabase
    .from("sacred_records")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return record as SacredRecord;
}

export async function deleteSacredRecord(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("sacred_records").delete().eq("id", id);

  if (error) throw error;
  return { success: true };
}

export function sortSacredRecords(records: SacredRecord[]): SacredRecord[] {
  return [...records].sort((a, b) => a.day_number - b.day_number);
}

export function getNextDayNumber(records: SacredRecord[]): number {
  if (records.length === 0) return 1;
  return Math.max(...records.map((record) => record.day_number)) + 1;
}

export async function reorderSacredRecords(orderedIds: string[]) {
  const supabase = createClient();
  const tempOffset = 100_000;

  for (let index = 0; index < orderedIds.length; index++) {
    const { error } = await supabase
      .from("sacred_records")
      .update({ day_number: tempOffset + index })
      .eq("id", orderedIds[index]);

    if (error) throw error;
  }

  for (let index = 0; index < orderedIds.length; index++) {
    const { error } = await supabase
      .from("sacred_records")
      .update({ day_number: index + 1 })
      .eq("id", orderedIds[index]);

    if (error) throw error;
  }

  return { success: true };
}

/* ── Questions ───────────────────────────────────────────── */

export async function getQuestionsForRecord(recordId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sacred_record_questions")
    .select("*")
    .eq("record_id", recordId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as SacredRecordQuestion[];
}

export async function getQuestionCountsByRecord(): Promise<
  Record<string, number>
> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sacred_record_questions")
    .select("record_id");

  if (error) throw error;

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const id = row.record_id as string;
    counts[id] = (counts[id] ?? 0) + 1;
  }
  return counts;
}

export async function getPublicQuestionsForRecord(recordId: string) {
  const questions = await getQuestionsForRecord(recordId);
  return questions.map(
    ({ id, record_id, prompt, option_a, option_b }): SacredRecordQuestionPublic => ({
      id,
      record_id,
      prompt,
      option_a,
      option_b,
    }),
  );
}

export async function createQuestion(
  data: Omit<SacredRecordQuestion, "id" | "created_at">,
) {
  const supabase = createClient();
  const { data: question, error } = await supabase
    .from("sacred_record_questions")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return question as SacredRecordQuestion;
}

export async function updateQuestion(
  id: string,
  data: Partial<
    Omit<SacredRecordQuestion, "id" | "record_id" | "created_at">
  >,
) {
  const supabase = createClient();
  const { data: question, error } = await supabase
    .from("sacred_record_questions")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return question as SacredRecordQuestion;
}

export async function deleteQuestion(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("sacred_record_questions")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return { success: true };
}

/* ── Leaderboard ─────────────────────────────────────────── */

export async function getSacredRecordsLeaderboard(): Promise<
  LeaderboardEntry[]
> {
  const supabase = createClient();

  const { data: progressRows, error: progressError } = await supabase
    .from("user_progress")
    .select("user_id, points_earned, completed")
    .eq("completed", true);

  if (progressError) throw progressError;

  const totals = new Map<
    string,
    { totalPoints: number; completedDays: number }
  >();

  for (const row of progressRows ?? []) {
    const userId = row.user_id as string;
    const existing = totals.get(userId) ?? {
      totalPoints: 0,
      completedDays: 0,
    };
    existing.totalPoints += Math.min(
      Number(row.points_earned) || 0,
      MAX_DAY_POINTS,
    );
    existing.completedDays += 1;
    totals.set(userId, existing);
  }

  if (totals.size === 0) return [];

  const userIds = Array.from(totals.keys());
  const { data: members, error: membersError } = await supabase
    .from("members")
    .select("id, first_name, last_name, family, photo_url")
    .in("id", userIds);

  if (membersError) throw membersError;

  const entries: LeaderboardEntry[] = (members ?? []).map((member) => {
    const stats = totals.get(member.id)!;
    return {
      userId: member.id,
      firstName: member.first_name,
      lastName: member.last_name,
      family: member.family,
      photoUrl: member.photo_url,
      totalPoints: Math.round(stats.totalPoints * 100) / 100,
      completedDays: stats.completedDays,
    };
  });

  return entries.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    return b.completedDays - a.completedDays;
  });
}
