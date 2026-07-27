export const READ_POINTS = 2;
export const QUESTION_TIME_MS = 10_000;
export const QUESTIONS_PER_ROUND = 3;
export const MAX_DAY_POINTS = 5;

/** Matches homepage event countdown — August 10, 2026. */
export const EVENT_DATE = new Date("2026-08-10T00:00:00");

/** Day 1 unlocks when the countdown shows ≤14 days remaining. */
export const SACRED_RECORDS_START_DAYS = 14;

function startOfLocalDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** Whole calendar days from `now` until the event (matches “14 days to go” all day today). */
export function getCalendarDaysUntilEvent(now: Date = new Date()): number {
  const diff =
    startOfLocalDay(EVENT_DATE).getTime() - startOfLocalDay(now).getTime();
  if (diff <= 0) return 0;
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

/** @deprecated Prefer getCalendarDaysUntilEvent for unlock scheduling. */
export function getCountdownDays(now: Date = new Date()): number {
  const distance = EVENT_DATE.getTime() - now.getTime();
  if (distance <= 0) return 0;
  return Math.floor(distance / (1000 * 60 * 60 * 24));
}

/** Calendar-unlocked day count: 1 on the first unlock date, 2 the next day, … */
export function getMaxCalendarDay(
  now: Date = new Date(),
  totalRecords?: number,
): number {
  const daysUntil = getCalendarDaysUntilEvent(now);
  if (daysUntil > SACRED_RECORDS_START_DAYS) return 0;
  const unlocked = SACRED_RECORDS_START_DAYS + 1 - daysUntil;
  if (totalRecords != null) return Math.min(unlocked, totalRecords);
  return unlocked;
}

/** Calendar date when a given day bubble first becomes available. */
export function getDayUnlockDate(dayNumber: number): Date {
  const d = startOfLocalDay(EVENT_DATE);
  d.setDate(d.getDate() - (SACRED_RECORDS_START_DAYS + 1 - dayNumber));
  return d;
}

function formatUnlockDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/** Why a bubble is locked, or null if it should be playable. */
export function getDayLockMessage(
  dayNumber: number,
  maxCalendarDay: number,
  prevDayCompleted: boolean,
): string | null {
  if (maxCalendarDay === 0) {
    return `Sacred Records haven't started yet. Day 1 opens on ${formatUnlockDate(getDayUnlockDate(1))}, when the countdown reaches 14 days to go.`;
  }

  if (dayNumber > maxCalendarDay) {
    return `Not available yet — unlocks on ${formatUnlockDate(getDayUnlockDate(dayNumber))}. One new bubble opens each day as we count down to the event.`;
  }

  if (!prevDayCompleted) {
    return `Complete Day ${dayNumber - 1} first. Work through earlier bubbles in order to catch up to today's bubble.`;
  }

  return null;
}

/** Families on the Sacred Records leaderboard (includes Seraphs). */
export const SACRED_RECORDS_FAMILIES = [
  "Dominion",
  "Light",
  "Power",
  "Virtue",
  "Seraphs",
] as const;

export type SacredRecordsFamily = (typeof SACRED_RECORDS_FAMILIES)[number];

export const SACRED_RECORD_CATEGORIES = [
  "THE FOUNDATION (1954-2001)",
  "THE FAMILY LOVE BUILT (1991-PRESENT)",
  "ADMINISTRATION & ACCOMPLISMENTS",
] as const;

export type SacredRecordCategory =
  (typeof SACRED_RECORD_CATEGORIES)[number];

export type CorrectOption = "a" | "b";

/** Timed score for one question: correct → remaining/10000, else 0. */
export function scoreTimedAnswer(
  correct: boolean,
  remainingMs: number,
): number {
  if (!correct) return 0;
  const clamped = Math.max(0, Math.min(QUESTION_TIME_MS, remainingMs));
  return Math.round((clamped / QUESTION_TIME_MS) * 100) / 100;
}

export function roundPoints(value: number): number {
  return Math.round(value * 100) / 100;
}

export function pickRandomQuestions<T>(pool: T[], count: number): T[] {
  if (pool.length <= count) return [...pool];
  const copy = [...pool];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}
