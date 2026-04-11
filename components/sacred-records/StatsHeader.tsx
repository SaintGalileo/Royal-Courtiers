"use client";

import { Flame, Star, Trophy } from "lucide-react";
import { motion } from "framer-motion";

interface StatsHeaderProps {
  streak: number;
  points: number;
  totalDays: number;
  completedDays: number;
}

export default function StatsHeader({
  streak,
  points,
  totalDays,
  completedDays,
}: StatsHeaderProps) {
  const progressPercent = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;

  return (
    <div className="sticky top-0 z-30 w-full border-b border-zinc-200 bg-white/80 p-4 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
        {/* Streak */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
            <Flame className="h-6 w-6 text-orange-500 fill-orange-500" />
          </div>
          <div className="hidden sm:block">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 uppercase">Streak</p>
            <p className="text-sm font-black text-orange-600 dark:text-orange-400">{streak} Days</p>
          </div>
          <p className="text-lg font-black text-orange-600 dark:text-orange-400 sm:hidden">{streak}</p>
        </motion.div>

        {/* Progress Bar (Center) */}
        <div className="flex-1 max-w-[200px] sm:max-w-xs">
          <div className="mb-1.5 flex items-center justify-between px-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Progress</span>
            <span className="text-[10px] font-bold text-(--primary-gold)">{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-linear-to-r from-(--primary-gold) to-yellow-500 shadow-[0_0_8px_rgba(212,175,55,0.4)]"
            />
          </div>
        </div>

        {/* Points */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
            <Star className="h-6 w-6 text-yellow-600 fill-yellow-600" />
          </div>
          <div className="hidden sm:block">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 uppercase">Points</p>
            <p className="text-sm font-black text-yellow-700 dark:text-yellow-500">{points.toLocaleString()}</p>
          </div>
          <p className="text-lg font-black text-yellow-700 dark:text-yellow-500 sm:hidden">{points}</p>
        </motion.div>
      </div>
    </div>
  );
}
