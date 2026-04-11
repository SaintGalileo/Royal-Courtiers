"use client";

import { Check, Lock, Play } from "lucide-react";
import { motion } from "framer-motion";

export type DayState = "locked" | "active" | "completed";

interface DayNodeProps {
  dayNumber: number;
  state: DayState;
  onClick: () => void;
  offset: number; // For the snake path effect
}

export default function DayNode({
  dayNumber,
  state,
  onClick,
  offset,
}: DayNodeProps) {
  const isLocked = state === "locked";
  const isActive = state === "active";
  const isCompleted = state === "completed";

  return (
    <div 
      className="relative flex flex-col items-center"
      style={{ transform: `translateX(${offset}px)` }}
    >
      {/* Label above node */}
      <div className={`mb-3 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-all ${
        isActive 
          ? "border-(--primary-gold) bg-(--primary-gold) text-white shadow-[0_0_12px_rgba(212,175,55,0.4)]" 
          : "border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-400"
      }`}>
        Day {dayNumber}
      </div>

      {/* The Node Button */}
      <motion.button
        whileHover={!isLocked ? { scale: 1.1, y: -5 } : {}}
        whileTap={!isLocked ? { scale: 0.95 } : {}}
        onClick={isLocked ? undefined : onClick}
        disabled={isLocked}
        className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border-[3.5px] transition-all sm:h-20 sm:w-20 ${
          isCompleted
            ? "border-green-600 bg-green-500 text-white shadow-lg shadow-green-600/20 dark:border-green-700 dark:bg-green-600"
            : isActive
              ? "border-(--primary-gold) bg-white text-(--primary-gold) shadow-xl shadow-(--primary-gold)/20 dark:bg-zinc-900"
              : "cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-600"
        }`}
      >
        {isCompleted && <Check className="h-8 w-8 stroke-[3.5]" />}
        {isActive && (
          <div className="relative">
            <Play className="h-7 w-7 fill-(--primary-gold) stroke-(--primary-gold) ml-0.5" />
            <motion.div 
              initial={{ opacity: 1, scale: 1 }}
              animate={{ opacity: 0, scale: 1.5 }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 rounded-full bg-(--primary-gold)/40"
            />
          </div>
        )}
        {isLocked && <Lock className="h-6 w-6 opacity-60" />}
      </motion.button>

      {/* Bottom shadow for nodes */}
      <div className={`mt-2 h-2 w-12 rounded-full transition-all ${
        isActive 
          ? "bg-(--primary-gold)/10 blur-[4px] dark:bg-(--primary-gold)/20" 
          : "bg-zinc-100 dark:bg-zinc-800"
      }`} />
    </div>
  );
}
