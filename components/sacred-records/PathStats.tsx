"use client";

import Link from "next/link";
import { Flame, Star, Trophy } from "lucide-react";

interface PathStatsProps {
  streak: number;
  totalDays: number;
  completedDays: number;
  points: number;
  isFamilyChamp?: boolean;
  isOverallChamp?: boolean;
}

export default function PathStats({
  streak,
  totalDays,
  completedDays,
  points,
  isFamilyChamp = false,
  isOverallChamp = false,
}: PathStatsProps) {
  const progressPercent = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;

  return (
    <div className="sticky top-3 z-20 mx-auto w-full max-w-2xl px-4 sm:px-6">
      <div className="relative">
        <div className="flex items-center gap-3 rounded-2xl border border-(--primary-gold)/20 bg-white/95 px-3 py-2.5 shadow-sm backdrop-blur-md dark:border-(--primary-gold)/15 dark:bg-zinc-950/95 sm:gap-4 sm:px-4">
          <div className="flex shrink-0 items-center gap-1.5">
            <Flame className="h-4 w-4 fill-orange-500 text-orange-500" />
            <span className="text-sm font-black text-orange-600 dark:text-orange-400">
              {streak}
            </span>
          </div>

          <div className="h-5 w-px shrink-0 bg-zinc-200 dark:bg-zinc-800" />

          <div className="min-w-0 flex-1">
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

          <div className="h-5 w-px shrink-0 bg-zinc-200 dark:bg-zinc-800" />

          <div className="relative flex shrink-0 items-center gap-1.5">
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

          <Link
            href="/sacred-records/leaderboard"
            prefetch
            className="relative z-30 ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-(--primary-gold) px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-opacity hover:opacity-90"
          >
            <Trophy className="h-3.5 w-3.5" />
            Leaderboard
          </Link>
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
