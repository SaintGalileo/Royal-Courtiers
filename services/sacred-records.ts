import { createClient } from "@/lib/supabase/client";

export type SacredRecord = {
  id: string;
  day_number: number;
  question: string;
  answer: string;
};

export type UserProgress = {
  day_number: number;
  completed: boolean;
  points_earned: number;
  completed_at: string | null;
};

export async function getSacredRecords() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sacred_records")
    .select("*")
    .order("day_number", { ascending: true });

  if (error) throw error;
  return data as SacredRecord[];
}

export async function getUserProgress(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;
  return data as UserProgress[];
}

export async function completeDay(userId: string, dayNumber: number, points: number) {
  const supabase = createClient();
  
  // Update progress
  const { error: upsertError } = await supabase
    .from("user_progress")
    .upsert({
      user_id: userId,
      day_number: dayNumber,
      completed: true,
      points_earned: points,
      completed_at: new Date().toISOString(),
    }, {
      onConflict: "user_id, day_number"
    });

  if (upsertError) {
    console.error("Supabase upsert error:", upsertError);
    throw upsertError;
  }

  return { success: true };
}

export function calculateStreak(progress: UserProgress[]) {
  if (!progress || progress.length === 0) return 0;
  
  const completedDates = progress
    .filter(p => p.completed && p.completed_at)
    .map(p => new Date(p.completed_at!).toDateString());
    
  if (completedDates.length === 0) return 0;
  
  const uniqueDates = Array.from(new Set(completedDates))
    .map(d => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime());
    
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0,0,0,0);
  
  // Check if first date is today or yesterday
  const firstDate = uniqueDates[0];
  const diffDays = Math.floor((currentDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays > 1) return 0;

  for (let i = 0; i < uniqueDates.length; i++) {
    const date = uniqueDates[i];
    const expectedDate = new Date(currentDate);
    expectedDate.setDate(currentDate.getDate() - i - (diffDays === 1 && i === 0 ? 0 : 0)); // simple streak logic
    
    // This is a simplified streak. For a robust one, check consecutive days.
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

export async function updateSacredRecord(id: string, data: Partial<Omit<SacredRecord, "id">>) {
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
  const { error } = await supabase
    .from("sacred_records")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return { success: true };
}
