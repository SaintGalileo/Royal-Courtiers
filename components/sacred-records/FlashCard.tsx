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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative w-full max-w-md">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/40"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <div className="perspective-1000 h-[70vh] min-h-[350px] max-h-[550px] w-full">
          <motion.div
            className="relative h-full w-full transition-all duration-300 preserve-3d"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div
              className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center rounded-3xl border-4 border-(--primary-gold)/40 bg-white p-8 text-center shadow-2xl backface-hidden dark:bg-zinc-900"
              onClick={() => setIsFlipped(true)}
            >
              <div className="mb-4 inline-flex rounded-full bg-(--primary-gold)/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-(--primary-gold)">
                {category}
              </div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-zinc-500">
                Knowledge Bubble
              </h3>
              <p className="text-xl font-bold leading-relaxed text-zinc-900 dark:text-zinc-100">
                {title}
              </p>
              <p className="mt-12 text-xs font-semibold text-zinc-400">
                Tap to reveal the record
              </p>
            </div>

            <div className="absolute inset-0 flex rotate-y-180 flex-col rounded-3xl border-4 border-(--primary-gold)/35 bg-white p-6 shadow-2xl backface-hidden dark:bg-zinc-900 sm:p-8">
              <div className="mb-4 flex shrink-0 items-center justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-(--primary-gold)/10 text-(--primary-gold)">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              </div>
              <h3 className="mb-3 shrink-0 text-center text-sm font-bold uppercase tracking-widest text-(--primary-gold)">
                Daily Insight
              </h3>
              <div className="min-h-0 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                <p className="text-left text-base font-medium leading-relaxed text-zinc-800 dark:text-zinc-200">
                  {content}
                </p>
              </div>

              <div className="mt-6 shrink-0">
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
              className="mt-6 text-center text-sm font-medium text-white/60"
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
