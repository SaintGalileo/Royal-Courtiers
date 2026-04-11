"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, ArrowRight } from "lucide-react";

interface FlashCardProps {
  question: string;
  answer: string;
  onComplete: () => void;
  onClose: () => void;
  isCompleted: boolean;
}

export default function FlashCard({
  question,
  answer,
  onComplete,
  onClose,
  isCompleted,
}: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute -top-12 right-0 rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/40"
        >
          <X size={24} />
        </button>

        {/* 3D Card Container */}
        <div className="perspective-1000 h-[450px] w-full">
          <motion.div
            className="relative h-full w-full transition-all duration-300 preserve-3d"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Front Side */}
            <div 
              className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border-4 border-(--primary-gold)/30 bg-white p-8 text-center shadow-2xl backface-hidden dark:bg-zinc-900"
              onClick={() => setIsFlipped(true)}
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-(--primary-gold)/10 text-(--primary-gold)">
                <span className="text-xl font-black">?</span>
              </div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4">Question</h3>
              <p className="text-xl font-bold leading-relaxed text-zinc-900 dark:text-zinc-100">
                {question}
              </p>
              <p className="mt-12 text-xs font-semibold text-zinc-400">Click card to reveal answer</p>
            </div>

            {/* Back Side */}
            <div 
              className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border-4 border-green-500/30 bg-white p-8 text-center shadow-2xl backface-hidden rotate-y-180 dark:bg-zinc-900"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-green-600 mb-4">Revelation</h3>
              <div className="max-h-[220px] overflow-y-auto scrollbar-hide">
                <p className="text-lg font-medium leading-relaxed text-zinc-800 dark:text-zinc-200">
                  {answer}
                </p>
              </div>

              {!isCompleted && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onComplete();
                  }}
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3.5 text-sm font-black text-white shadow-lg shadow-green-600/20 transition-all hover:bg-green-700 active:scale-95"
                >
                  Mark as Completed
                  <ArrowRight size={16} />
                </motion.button>
              )}
              
              {isCompleted && (
                <button
                  onClick={onClose}
                  className="mt-8 w-full rounded-xl border border-zinc-200 bg-white py-3.5 text-sm font-bold text-zinc-600 transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400"
                >
                  Close
                </button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Tooltip or Hint */}
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
