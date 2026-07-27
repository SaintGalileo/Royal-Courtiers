"use client";

import { BookOpen, Sparkles, Trophy, Zap } from "lucide-react";

const SEEN_KEY_PREFIX = "sacred-records-explainer-seen";

export function sacredExplainerKey(userId: string) {
  return `${SEEN_KEY_PREFIX}-${userId}`;
}

interface SacredRecordsExplainerProps {
  userName?: string;
  maxCalendarDay: number;
  onDismiss: () => void;
}

export default function SacredRecordsExplainer({
  userName,
  maxCalendarDay,
  onDismiss,
}: SacredRecordsExplainerProps) {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-(--primary-gold)/40 bg-white p-6 shadow-2xl dark:bg-zinc-950 sm:p-7">
        <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-(--primary-gold)/10 blur-3xl" />

        <div className="relative space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--primary-gold)/10 text-(--primary-gold)">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                Sacred Records
              </h2>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {userName
                  ? `Welcome, ${userName}!`
                  : "Your daily knowledge path"}
              </p>
            </div>
          </div>

          <div className="space-y-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            <p>
              Each day unlocks a <strong>knowledge bubble</strong> tied to the
              event countdown. Read it, then face a quick{" "}
              <strong>recall challenge</strong> to earn points.
            </p>

            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <Zap className="mt-0.5 h-4 w-4 shrink-0 text-(--primary-gold)" />
                <span>
                  <strong>+2.00 pts</strong> for finishing the reading, then up
                  to <strong>3.00 pts</strong> across timed recall questions
                  (max <strong>5.00/day</strong>).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-(--primary-gold)" />
                <span>
                  One bubble unlocks per countdown day. Behind? Catch up by
                  completing earlier days until you reach today&apos;s bubble.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-(--primary-gold)" />
                <span>
                  Climb the <strong>family</strong> and <strong>general</strong>{" "}
                  leaderboards — top scorers earn seals, a crown and cash
                  prizes.
                </span>
              </li>
            </ul>

            {maxCalendarDay > 0 ? (
              <p className="rounded-xl bg-(--primary-gold)/10 px-3 py-2 text-xs font-semibold text-(--primary-gold)">
                Today&apos;s bubble: Day {maxCalendarDay} is available.
              </p>
            ) : (
              <p className="rounded-xl bg-zinc-100 px-3 py-2 text-xs font-semibold text-zinc-500 dark:bg-zinc-900">
                Bubbles unlock when the countdown reaches 14 days to go.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onDismiss}
            className="w-full rounded-xl bg-(--primary-gold) py-3 text-sm font-black text-white transition-opacity hover:opacity-90"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
