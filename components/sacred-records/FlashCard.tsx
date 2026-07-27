"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { READ_POINTS } from "@/lib/sacred-records-game";

interface FlashCardProps {
  title: string;
  category: string;
  content: string;
  onComplete: () => void;
  onClose: () => void;
  isCompleted: boolean;
  isCompleting?: boolean;
  canStartRecall?: boolean;
  questionCount?: number;
}

export default function FlashCard({
  title,
  category,
  content,
  onComplete,
  onClose,
  isCompleted,
  isCompleting = false,
  canStartRecall = true,
  questionCount = 0,
}: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6 animate-in fade-in duration-200">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative flex max-h-[min(92dvh,100%)] w-full max-w-md flex-col px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:max-h-none sm:px-0 sm:pb-0 sm:pt-0">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full bg-black/40 p-2 text-white transition-colors hover:bg-black/60 sm:-top-12 sm:right-0 sm:bg-white/20 sm:hover:bg-white/40"
          aria-label="Close"
        >
          <X size={22} />
        </button>

        <div className="perspective-1000 h-[min(78dvh,560px)] min-h-[280px] w-full sm:h-[70vh] sm:min-h-[350px] sm:max-h-[550px]">
          <motion.div
            className="relative h-full w-full transition-all duration-300 preserve-3d"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div
              className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center rounded-3xl border-4 border-(--primary-gold)/40 bg-white p-6 text-center shadow-2xl backface-hidden dark:bg-zinc-900 sm:p-8"
              onClick={() => setIsFlipped(true)}
            >
              <div className="mb-3 max-w-full truncate rounded-full bg-(--primary-gold)/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-(--primary-gold)">
                {category}
              </div>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-zinc-500">
                Knowledge Bubble
              </h3>
              <p className="px-1 text-lg font-bold leading-snug text-zinc-900 dark:text-zinc-100 sm:text-xl sm:leading-relaxed">
                {title}
              </p>
              <p className="mt-8 text-xs font-semibold text-zinc-400 sm:mt-12">
                Tap to reveal the record
              </p>
            </div>

            <div className="absolute inset-0 flex rotate-y-180 flex-col rounded-3xl border-4 border-(--primary-gold)/35 bg-white p-4 shadow-2xl backface-hidden dark:bg-zinc-900 sm:p-8">
              <div className="mb-3 flex shrink-0 items-center justify-center sm:mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--primary-gold)/10 text-(--primary-gold) sm:h-12 sm:w-12">
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
              </div>
              <h3 className="mb-2 shrink-0 text-center text-xs font-bold uppercase tracking-widest text-(--primary-gold) sm:mb-3 sm:text-sm">
                Daily Insight
              </h3>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1 [-webkit-overflow-scrolling:touch] custom-scrollbar">
                <p className="text-left text-[15px] font-medium leading-relaxed text-zinc-800 dark:text-zinc-200 sm:text-base">
                  {content}
                </p>
              </div>

              <div className="mt-4 shrink-0 sm:mt-6">
                {!isCompleted ? (
                  <>
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      disabled={isCompleting || !canStartRecall}
                      onClick={(e) => {
                        e.stopPropagation();
                        onComplete();
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-(--primary-gold) py-3.5 text-sm font-black text-white shadow-lg shadow-(--primary-gold)/25 transition-all hover:bg-(--primary-gold-hover) active:scale-95 disabled:opacity-60"
                    >
                      {isCompleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Done reading · +{READ_POINTS.toFixed(2)} pts
                          <ArrowRight size={16} />
                        </>
                      )}
                    </motion.button>
                    {!canStartRecall && (
                      <p className="mt-2 text-center text-[11px] font-medium text-amber-600 dark:text-amber-400">
                        Need at least 3 questions in the pool ({questionCount}{" "}
                        ready).
                      </p>
                    )}
                  </>
                ) : (
                  <button
                    onClick={onClose}
                    className="w-full rounded-xl border border-zinc-200 bg-white py-3.5 text-sm font-bold text-zinc-600 transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        <AnimatePresence>
          {!isFlipped && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-3 hidden text-center text-sm font-medium text-white/60 sm:mt-6 sm:block"
            >
              Tap the card once you are ready.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
