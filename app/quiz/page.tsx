"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { QUIZ_QUESTIONS, QuizQuestion } from "@/lib/quiz-data";
import { Loader2, X, Play, Users, LayoutGrid, Timer } from "lucide-react";
import Image from "next/image";

type Member = {
  id: string; // or code
  first_name: string;
  last_name: string;
  family: string;
  photo_url: string;
};

type GameState = "setup" | "playing" | "finished";

export default function QuizPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [gameState, setGameState] = useState<GameState>("setup");

  // Setup State
  const [selectedPlayers, setSelectedPlayers] = useState<Member[]>([]);

  // Playing State
  const [turnIndex, setTurnIndex] = useState(0);
  const [takenQuestions, setTakenQuestions] = useState<number[]>([]);
  const [activeQuestion, setActiveQuestion] = useState<QuizQuestion | null>(null);

  // Modal State
  const [timeLeft, setTimeLeft] = useState(10);
  const [isRevealed, setIsRevealed] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("members")
        .select("code, first_name, last_name, family, photo_url");

      if (!error && data) {
        setMembers(data.map(d => ({ ...d, id: d.code })));
      }
      setIsLoading(false);
    };
    fetchMembers();
  }, []);

  // Timer Effect
  useEffect(() => {
    if (activeQuestion && !isRevealed) {
      if (timeLeft > 0) {
        timerRef.current = setTimeout(() => {
          setTimeLeft(prev => prev - 1);
        }, 1000);
      } else {
        setIsRevealed(true);
      }
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeQuestion, timeLeft, isRevealed]);

  const togglePlayerSelection = (member: Member) => {
    if (selectedPlayers.find(p => p.id === member.id)) {
      setSelectedPlayers(prev => prev.filter(p => p.id !== member.id));
    } else {
      if (selectedPlayers.length < 4) {
        setSelectedPlayers(prev => [...prev, member]);
      }
    }
  };

  const startQuiz = () => {
    if (selectedPlayers.length !== 4) return;
    // Shuffle players
    const shuffled = [...selectedPlayers].sort(() => 0.5 - Math.random());
    setSelectedPlayers(shuffled);
    setTurnIndex(0);
    setTakenQuestions([]);
    setGameState("playing");
  };

  const openQuestion = (questionCode: number) => {
    if (takenQuestions.includes(questionCode)) return;
    const q = QUIZ_QUESTIONS.find(qq => qq.id === questionCode);
    if (q) {
      setActiveQuestion(q);
      setTimeLeft(10);
      setIsRevealed(false);
    }
  };

  const closeQuestion = () => {
    if (!activeQuestion) return;
    setTakenQuestions(prev => [...prev, activeQuestion.id]);
    setActiveQuestion(null);
    if (timerRef.current) clearTimeout(timerRef.current);

    // Advance turn
    setTurnIndex(prev => (prev + 1) % 4);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-(--primary-gold)" />
      </div>
    );
  }

  return (
    <main className="min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-(--primary-gold)/30 bg-black/5 dark:bg-white/5 p-4 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-6 w-6 text-(--primary-gold)" />
          <h1 className="text-xl font-bold uppercase tracking-widest text-(--primary-gold)">Anniversary Quiz</h1>
        </div>
        {gameState === "playing" && (
          <div className="flex items-center gap-2 text-sm font-semibold tracking-wider">
            <span>Questions Taken:</span>
            <span className="text-(--primary-gold)">{takenQuestions.length} / 50</span>
          </div>
        )}
      </header>

      {/* --- SETUP SCREEN --- */}
      {gameState === "setup" && (
        <div className="flex-1 flex flex-col mx-auto w-full max-w-6xl p-6">
          <div className="mb-8 text-center space-y-3">
            <h2 className="text-3xl font-bold lg:text-5xl">Select 4 Players</h2>
            <p className="text-zinc-600 dark:text-zinc-400">Choose the participants for this round. They will be shuffled once the quiz starts.</p>
          </div>

          <div className="mb-6 flex items-center justify-between border border-(--primary-gold)/40 bg-(--primary-gold)/5 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Users className="text-(--primary-gold) h-5 w-5" />
              <span className="font-semibold">{selectedPlayers.length} / 4 Selected</span>
            </div>
            <button
              onClick={startQuiz}
              disabled={selectedPlayers.length !== 4}
              className="btn-primary px-6 py-2.5 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-transform active:scale-95"
            >
              <Play className="h-4 w-4" fill="currentColor" /> Start Quiz
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 overflow-y-auto pb-20">
            {members.map(member => {
              const isSelected = selectedPlayers.some(p => p.id === member.id);
              return (
                <div
                  key={member.id}
                  onClick={() => togglePlayerSelection(member)}
                  className={`relative cursor-pointer group rounded-2xl overflow-hidden border-2 transition-all duration-300 ${isSelected ? "border-(--primary-gold) shadow-[0_0_15px_rgba(234,179,8,0.3)] bg-(--primary-gold)/10" : "border-transparent bg-black/5 dark:bg-white/5 hover:border-(--primary-gold)/40"
                    }`}
                >
                  <div className="aspect-square w-full relative">
                    {member.photo_url ? (
                      <img src={member.photo_url} alt={member.first_name} className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                        <Users className="h-8 w-8 text-zinc-400" />
                      </div>
                    )}
                    {isSelected && (
                      <div className="absolute inset-0 bg-(--primary-gold)/20 backdrop-blur-[1px] grid place-items-center">
                        <div className="h-10 w-10 bg-(--primary-gold) rounded-full flex items-center justify-center text-black font-bold shadow-lg">✓</div>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-bold truncate">{member.first_name} {member.last_name}</p>
                    <p className="text-xs text-zinc-500 truncate">{member.family}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* --- PLAYING SCREEN --- */}
      {gameState === "playing" && (
        <div className="flex-1 flex flex-col relative w-full h-full">

          {/* Active Player Banner */}
          <div className="w-full bg-black/5 dark:bg-white/5 border-b border-(--primary-gold)/20 py-4 px-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-full bg-linear-to-l from-(--primary-gold)/20 to-transparent pointer-events-none" />
            <div className="max-w-6xl mx-auto flex items-center gap-6">
              <div className="relative">
                <div className="absolute -inset-1 bg-linear-to-r from-(--primary-gold) to-yellow-600 rounded-full blur-[6px] opacity-70 animate-pulse" />
                <div className="relative h-20 w-20 rounded-full border-2 border-(--primary-gold) overflow-hidden shadow-xl bg-zinc-900">
                  {selectedPlayers[turnIndex].photo_url ? (
                    <img src={selectedPlayers[turnIndex].photo_url} alt="Current Player" className="object-cover" />
                  ) : (
                    <Users className="h-full w-full p-4 text-zinc-500" />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-(--primary-gold) mb-1">
                  CURRENT TURN
                </p>
                <h2 className="text-3xl font-bold tracking-tight">
                  {selectedPlayers[turnIndex].first_name}&apos;s Turn
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 font-medium">
                  {selectedPlayers[turnIndex].family}
                </p>
              </div>

              {/* Upcoming players preview */}
              <div className="hidden md:flex gap-3 items-center ml-auto border-l border-(--primary-gold)/20 pl-6">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mr-2">Up Next:</span>
                {[1, 2, 3].map(offset => {
                  const idx = (turnIndex + offset) % 4;
                  const p = selectedPlayers[idx];
                  return (
                    <div key={idx} className="relative h-10 w-10 rounded-full border border-zinc-400 dark:border-zinc-700 overflow-hidden opacity-60">
                      {p.photo_url ? <img src={p.photo_url} alt={p.first_name} className="object-cover" /> : <div className="bg-zinc-800 w-full h-full" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Grid Area */}
          <div className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-8">
            <div className="grid grid-cols-5 md:grid-cols-10 gap-3 md:gap-4">
              {QUIZ_QUESTIONS.map((q) => {
                const isTaken = takenQuestions.includes(q.id);
                return (
                  <button
                    key={q.id}
                    onClick={() => openQuestion(q.id)}
                    disabled={isTaken}
                    className={`
                      relative aspect-square rounded-xl flex items-center justify-center text-xl md:text-2xl font-bold shadow-sm transition-all duration-300
                      ${isTaken
                        ? "bg-zinc-200 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-700 shadow-inner scale-95 opacity-50 cursor-not-allowed border border-transparent border-dashed"
                        : "bg-white dark:bg-zinc-800 border-2 border-(--primary-gold)/50 text-(--primary-gold) hover:bg-(--primary-gold) hover:text-black hover:scale-105 active:scale-95 cursor-pointer shadow-[0_4px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
                      }
                    `}
                  >
                    {isTaken && <div className="absolute inset-0 bg-black/5 dark:bg-white/5 rounded-xl pointer-events-none" />}
                    {q.id}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- QUESTION MODAL --- */}
      {activeQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-4xl bg-zinc-50 dark:bg-zinc-900 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-(--primary-gold)/30 overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col max-h-[90vh]">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-(--primary-gold)/20 bg-black/5 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-(--primary-gold)/20 flex items-center justify-center text-(--primary-gold) font-bold">
                  {activeQuestion.id}
                </div>
                <h3 className="text-xl font-bold">Question {activeQuestion.id}</h3>
              </div>

              <button
                onClick={closeQuestion}
                disabled={!isRevealed}
                className={`p-2 rounded-full transition-colors ${isRevealed ? "hover:bg-red-500/20 text-red-500 cursor-pointer" : "opacity-30 cursor-not-allowed"}`}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 md:p-12 flex flex-col relative items-center justify-center min-h-[400px]">

              {/* Question */}
              <div className="text-center mb-16">
                <span className="text-xs uppercase tracking-[0.3em] text-(--primary-gold) font-semibold">The Question</span>
                <p className="mt-4 text-3xl md:text-5xl font-bold leading-tight max-w-3xl">
                  {activeQuestion.question}
                </p>
              </div>

              {/* Timer & Answer Box */}
              <div className="w-full max-w-2xl relative">

                {/* Timer Floating Badge */}
                {!isRevealed && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-red-500 text-white px-6 py-2 rounded-full font-bold shadow-lg animate-pulse">
                    <Timer className="h-5 w-5" />
                    <span>Revealing in {timeLeft}s</span>
                  </div>
                )}

                {/* Answer Container */}
                <div className="w-full rounded-2xl border-2 border-(--primary-gold) bg-(--primary-gold)/5 p-8 relative overflow-hidden">
                  <span className="absolute top-4 left-6 text-xs uppercase tracking-[0.2em] text-(--primary-gold) font-semibold">The Answer</span>

                  <div className="mt-6 flex items-center justify-center min-h-[100px]">
                    <p className={`text-2xl md:text-3xl font-bold text-center transition-all duration-1000 ${isRevealed ? "blur-none opacity-100" : "blur-xl opacity-40 select-none"}`}>
                      {activeQuestion.answer}
                    </p>
                  </div>
                </div>

              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-(--primary-gold)/20 bg-black/5 dark:bg-white/5 flex justify-end">
              <button
                onClick={closeQuestion}
                className={`px-8 py-3 rounded-xl font-bold tracking-wide transition-all duration-300 ${isRevealed
                  ? "bg-(--primary-gold) text-black hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                  : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                  }`}
                disabled={!isRevealed}
              >
                {isRevealed ? "Close & Next Turn" : "Wait for reveal..."}
              </button>
            </div>

          </div>
        </div>
      )}

    </main>
  );
}
