"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { SacredRecordQuestionPublic } from "@/services/sacred-records";
import {
  QUESTION_TIME_MS,
  type CorrectOption,
} from "@/lib/sacred-records-game";

export type RecallAnswer = {
  id: string;
  choice: CorrectOption;
  remainingMs: number;
};

interface RecallChallengeProps {
  questions: SacredRecordQuestionPublic[];
  onFinish: (answers: RecallAnswer[]) => void;
  isSaving?: boolean;
}

export default function RecallChallenge({
  questions,
  onFinish,
  isSaving = false,
}: RecallChallengeProps) {
  const [index, setIndex] = useState(0);
  const [remainingMs, setRemainingMs] = useState(QUESTION_TIME_MS);
  const [locked, setLocked] = useState(false);
  const answersRef = useRef<RecallAnswer[]>([]);
  const remainingRef = useRef(QUESTION_TIME_MS);
  const finishedRef = useRef(false);
  const answeredRef = useRef(false);

  const question = questions[index];
  const livePoint = Math.round((remainingMs / QUESTION_TIME_MS) * 100) / 100;
  const progress = remainingMs / QUESTION_TIME_MS;

  const advance = useCallback(
    (answer: RecallAnswer) => {
      if (finishedRef.current) return;
      answersRef.current = [...answersRef.current, answer];

      if (answersRef.current.length >= questions.length) {
        finishedRef.current = true;
        onFinish(answersRef.current);
        return;
      }

      answeredRef.current = false;
      setIndex((i) => i + 1);
      setRemainingMs(QUESTION_TIME_MS);
      remainingRef.current = QUESTION_TIME_MS;
      setLocked(false);
    },
    [onFinish, questions.length],
  );

  useEffect(() => {
    if (locked || !question) return;

    const started = performance.now();
    const startRemaining = remainingRef.current;

    const id = window.setInterval(() => {
      if (answeredRef.current) return;
      const elapsed = performance.now() - started;
      const next = Math.max(0, startRemaining - elapsed);
      remainingRef.current = next;
      setRemainingMs(next);

      if (next <= 0) {
        answeredRef.current = true;
        setLocked(true);
        advance({
          id: question.id,
          choice: "a",
          remainingMs: 0,
        });
      }
    }, 50);

    return () => window.clearInterval(id);
  }, [index, locked, question, advance]);

  const handleChoice = (choice: CorrectOption) => {
    if (locked || answeredRef.current || !question) return;
    answeredRef.current = true;
    setLocked(true);
    advance({
      id: question.id,
      choice,
      remainingMs: remainingRef.current,
    });
  };

  const forfeitRemaining = () => {
    if (finishedRef.current || isSaving) return;
    const answeredIds = new Set(answersRef.current.map((a) => a.id));
    const remaining = questions
      .filter((q) => !answeredIds.has(q.id))
      .map((q) => ({
        id: q.id,
        choice: "a" as const,
        remainingMs: 0,
      }));
    finishedRef.current = true;
    onFinish([...answersRef.current, ...remaining]);
  };

  if (!question) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:items-center sm:p-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative max-h-[min(90dvh,100%)] w-full max-w-md overflow-y-auto overscroll-contain">
        <button
          onClick={() => {
            if (isSaving) return;
            forfeitRemaining();
          }}
          disabled={isSaving}
          className="absolute right-2 top-2 z-20 rounded-full bg-black/40 p-2 text-white transition-colors hover:bg-black/60 disabled:opacity-50 sm:-top-12 sm:right-0 sm:bg-white/20 sm:hover:bg-white/40"
          aria-label="Close and forfeit remaining"
        >
          <X size={22} />
        </button>

        <div className="rounded-3xl border-4 border-(--primary-gold)/40 bg-white p-4 shadow-2xl dark:bg-zinc-900 sm:p-8">
          <div className="mb-4 flex items-center justify-between gap-3 pr-10 sm:mb-6 sm:pr-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Recall {index + 1}/{questions.length}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Point
              </span>
              <span className="font-mono text-lg font-black text-(--primary-gold)">
                {livePoint.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center sm:mb-6 sm:h-20 sm:w-20">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-zinc-100 dark:text-zinc-800"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${progress * 100}, 100`}
                className="text-(--primary-gold) transition-[stroke-dasharray] duration-75"
              />
            </svg>
            <span className="text-xl font-black text-zinc-900 dark:text-zinc-100">
              {Math.ceil(remainingMs / 1000)}
            </span>
          </div>

          <p className="mb-5 text-center text-base font-bold leading-snug text-zinc-900 dark:text-zinc-100 sm:mb-8 sm:text-lg">
            {question.prompt}
          </p>

          <div className="grid gap-2.5 sm:gap-3">
            {(["a", "b"] as const).map((key) => (
              <motion.button
                key={key}
                type="button"
                whileTap={{ scale: 0.98 }}
                disabled={locked}
                onClick={() => handleChoice(key)}
                className="rounded-2xl border-2 border-zinc-200 bg-zinc-50 px-3 py-3.5 text-left text-sm font-bold text-zinc-800 transition-colors hover:border-(--primary-gold)/50 hover:bg-(--primary-gold)/5 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 sm:px-4 sm:py-4"
              >
                <span className="mr-2 text-(--primary-gold)">
                  {key.toUpperCase()}.
                </span>
                {key === "a" ? question.option_a : question.option_b}
              </motion.button>
            ))}
          </div>

          <p className="mt-3 text-center text-[11px] font-medium text-zinc-400 sm:mt-4">
            Faster correct answers earn more. Wrong or time up = 0.00
          </p>
        </div>
      </div>
    </div>
  );
}
