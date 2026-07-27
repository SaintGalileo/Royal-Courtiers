"use client";

import { Check, Lock, Play } from "lucide-react";
import { motion } from "framer-motion";

export type DayState = "locked" | "active" | "completed";

interface DayNodeProps {
  dayNumber: number;
  state: DayState;
  onClick: () => void;
  onLockedClick?: () => void;
  offset: number;
}

export default function DayNode({
  dayNumber,
  state,
  onClick,
  onLockedClick,
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
      <div
        className={`mb-3 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-all ${
          isActive
            ? "border-(--primary-gold) bg-(--primary-gold) text-white shadow-[0_0_14px_rgba(212,175,55,0.45)]"
            : isCompleted
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-zinc-200 bg-zinc-50 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-500"
        }`}
      >
        Day {dayNumber}
      </div>

      <motion.button
        whileHover={!isLocked ? { scale: 1.1, y: -5 } : { scale: 1.04 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          if (isLocked) onLockedClick?.();
          else onClick();
        }}
        aria-label={
          isLocked
            ? `Day ${dayNumber} locked — tap for details`
            : isCompleted
              ? `Day ${dayNumber} completed — reopen`
              : `Play day ${dayNumber}`
        }
        className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border-[3.5px] transition-all sm:h-20 sm:w-20 ${
          isCompleted
            ? "border-emerald-600 bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 dark:border-emerald-700 dark:bg-emerald-600"
            : isActive
              ? "border-(--primary-gold) bg-white text-(--primary-gold) shadow-xl shadow-(--primary-gold)/30 ring-4 ring-(--primary-gold)/20 dark:bg-zinc-900"
              : "cursor-help border-zinc-200 bg-zinc-100 text-zinc-400 opacity-70 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-600"
        }`}
      >
        {isCompleted && <Check className="h-8 w-8 stroke-[3.5]" />}
        {isActive && (
          <div className="relative flex items-center justify-center">
            <Play className="ml-0.5 h-7 w-7 fill-(--primary-gold) stroke-(--primary-gold)" />
            <motion.div
              initial={{ opacity: 0.7, scale: 1 }}
              animate={{ opacity: 0, scale: 1.85 }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeOut" }}
              className="absolute inset-0 rounded-full bg-(--primary-gold)/50"
            />
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              className="pointer-events-none absolute -inset-1 rounded-2xl border-2 border-(--primary-gold)/40"
            />
          </div>
        )}
        {isLocked && <Lock className="h-6 w-6 opacity-50" />}
      </motion.button>

      <div
        className={`mt-2 h-2 w-12 rounded-full transition-all ${
          isActive
            ? "bg-(--primary-gold)/25 blur-[4px]"
            : isCompleted
              ? "bg-emerald-500/20 blur-[3px]"
              : "bg-zinc-100 dark:bg-zinc-800"
        }`}
      />
    </div>
  );
}
