"use client";

import Link from "next/link";
import { Flame, HelpCircle, Star, Trophy } from "lucide-react";

interface PathStatsProps {
  streak: number;
  totalDays: number;
  completedDays: number;
  points: number;
  isFamilyChamp?: boolean;
  isOverallChamp?: boolean;
  onHelpClick?: () => void;
}

export default function PathStats({
  streak,
  totalDays,
  completedDays,
  points,
  isFamilyChamp = false,
  isOverallChamp = false,
  onHelpClick,
}: PathStatsProps) {
  const progressPercent = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;

  return (
    <div className="sticky top-2 z-20 mx-auto w-full max-w-2xl px-3 sm:top-3 sm:px-6 lg:max-w-3xl xl:max-w-4xl">
      <div className="relative">
        <div className="rounded-2xl border border-(--primary-gold)/20 bg-white/95 px-3 py-2.5 shadow-sm backdrop-blur-md dark:border-(--primary-gold)/15 dark:bg-zinc-950/95 sm:px-4">
          {/* Top row: metrics + actions — progress stays out of the fight */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex shrink-0 items-center gap-1">
              <Flame className="h-4 w-4 fill-orange-500 text-orange-500" />
              <span className="text-sm font-black text-orange-600 dark:text-orange-400">
                {streak}
              </span>
            </div>

            <div className="h-4 w-px shrink-0 bg-zinc-200 dark:bg-zinc-800" />

            <div className="flex shrink-0 items-center gap-1">
              <Star className="h-4 w-4 fill-(--primary-gold) text-(--primary-gold)" />
              <span className="text-sm font-black tabular-nums text-(--primary-gold)">
                {points.toFixed(2)}
              </span>
              {isOverallChamp && (
                <span className="text-[10px]" title="Overall #1">
                  👑
                </span>
              )}
              {isFamilyChamp && !isOverallChamp && (
                <span title="Family #1">
                  <Trophy className="h-3 w-3 text-(--primary-gold)" />
                </span>
              )}
            </div>

            {/* Desktop-only progress — same divider rhythm as streak ↔ points */}
            <div className="hidden h-4 w-px shrink-0 bg-zinc-200 dark:bg-zinc-800 sm:block" />

            <div className="hidden min-w-0 flex-1 sm:block">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                  Progress
                </span>
                <span className="text-[10px] font-black text-(--primary-gold)">
                  {completedDays}/{totalDays}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-(--primary-gold) transition-[width] duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="hidden h-4 w-px shrink-0 bg-zinc-200 dark:bg-zinc-800 sm:block" />

            <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:ml-0">
              <Link
                href="/sacred-records/leaderboard"
                prefetch
                className="relative z-30 inline-flex h-8 items-center justify-center gap-1.5 rounded-xl bg-(--primary-gold) px-2.5 text-[10px] font-black uppercase tracking-widest text-white transition-opacity hover:opacity-90 sm:h-9 sm:px-3"
                aria-label="Leaderboard"
              >
                <Trophy className="h-3.5 w-3.5" />
                <span className="inline-block">Leaderboard</span>
              </Link>

              {onHelpClick && (
                <button
                  type="button"
                  onClick={onHelpClick}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-(--primary-gold)/30 text-(--primary-gold) transition-colors hover:bg-(--primary-gold)/10 sm:h-9 sm:w-9"
                  aria-label="How Sacred Records works"
                  title="How it works"
                >
                  <HelpCircle className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Mobile-only slim progress under the metrics */}
          <div className="mt-2 flex items-center gap-2 sm:hidden">
            <div className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-(--primary-gold) transition-[width] duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="shrink-0 text-[10px] font-black tabular-nums text-(--primary-gold)">
              {completedDays}/{totalDays}
            </span>
          </div>
        </div>

        {/* Invisible horizon marker — 0.5cm below header (no visual chrome) */}
        <div
          data-sacred-horizon
          className="pointer-events-none absolute left-0 h-0 w-full"
          style={{ top: "calc(100% + 0.5cm)" }}
          aria-hidden
        />
      </div>
    </div>
  );
}
