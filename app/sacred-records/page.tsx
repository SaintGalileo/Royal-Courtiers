"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  getSacredRecords,
  getUserProgress,
  getPublicQuestionsForRecord,
  getSacredRecordsLeaderboard,
  getQuestionCountsByRecord,
  calculateStreak,
  SacredRecord,
  UserProgress,
  SacredRecordQuestionPublic,
} from "@/services/sacred-records";
import PathStats from "@/components/sacred-records/PathStats";
import ProgressPath from "@/components/sacred-records/ProgressPath";
import FlashCard from "@/components/sacred-records/FlashCard";
import RecallChallenge, {
  type RecallAnswer,
} from "@/components/sacred-records/RecallChallenge";
import SacredRecordsExplainer, {
  sacredExplainerKey,
} from "@/components/sacred-records/SacredRecordsExplainer";
import { Loader2, ScrollText, HelpCircle } from "lucide-react";
import {
  MAX_DAY_POINTS,
  QUESTIONS_PER_ROUND,
  getMaxCalendarDay,
  pickRandomQuestions,
} from "@/lib/sacred-records-game";

type AuthUser = {
  id: string;
  firstName: string;
  family?: string;
};

export default function SacredRecordsPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [records, setRecords] = useState<SacredRecord[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>(
    {},
  );
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<SacredRecord | null>(
    null,
  );
  const [recallQuestions, setRecallQuestions] = useState<
    SacredRecordQuestionPublic[] | null
  >(null);
  const [isStartingRecall, setIsStartingRecall] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFamilyChamp, setIsFamilyChamp] = useState(false);
  const [isOverallChamp, setIsOverallChamp] = useState(false);
  const [showExplainer, setShowExplainer] = useState(false);
  const [maxCalendarDay, setMaxCalendarDay] = useState(0);
  const pendingRecallRef = useRef<SacredRecord | null>(null);

  const router = useRouter();
  const effectsPaused = showExplainer || !!selectedRecord || !!recallQuestions;

  useEffect(() => {
    const authStr = localStorage.getItem("virgins-auth");
    if (!authStr) {
      router.push("/login");
      return;
    }
    try {
      const auth = JSON.parse(authStr);
      setUser({
        id: auth.id,
        firstName: auth.firstName,
        family: auth.family,
      });
    } catch {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (!user) return;

    async function loadData() {
      setIsLoading(true);
      try {
        const [recordsData, progressData, counts, board] = await Promise.all([
          getSacredRecords(),
          getUserProgress(user!.id),
          getQuestionCountsByRecord(),
          getSacredRecordsLeaderboard().catch(() => []),
        ]);
        setRecords(recordsData);
        setProgress(progressData);
        setQuestionCounts(counts);

        if (board.length > 0) {
          setIsOverallChamp(board[0]?.userId === user!.id);
          if (user!.family) {
            const familyTop = board.find((e) => e.family === user!.family);
            setIsFamilyChamp(familyTop?.userId === user!.id);
          }
        }
      } catch (err) {
        console.error(err);
        toast.error(
          "Failed to load records. Make sure the database tables exist.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [user]);

  useEffect(() => {
    if (!user || isLoading) return;
    if (!localStorage.getItem(sacredExplainerKey(user.id))) {
      setShowExplainer(true);
    }
  }, [user, isLoading]);

  useEffect(() => {
    const refresh = () =>
      setMaxCalendarDay(getMaxCalendarDay(new Date(), records.length));
    refresh();
    const id = window.setInterval(refresh, 60_000);
    return () => window.clearInterval(id);
  }, [records.length]);

  const dismissExplainer = () => {
    if (user) localStorage.setItem(sacredExplainerKey(user.id), "true");
    setShowExplainer(false);
  };

  const streak = useMemo(() => calculateStreak(progress), [progress]);
  const completedCount = useMemo(
    () => progress.filter((p) => p.completed).length,
    [progress],
  );
  const totalPoints = useMemo(
    () =>
      Math.round(
        progress.reduce(
          (sum, p) =>
            sum + Math.min(Number(p.points_earned) || 0, MAX_DAY_POINTS),
          0,
        ) * 100,
      ) / 100,
    [progress],
  );

  const selectedCompleted = selectedRecord
    ? progress.some(
        (p) => p.day_number === selectedRecord.day_number && p.completed,
      )
    : false;

  const handleStartRecall = useCallback(
    async (record: SacredRecord) => {
      if (!user || isStartingRecall) return;

      const alreadyDone = progress.some(
        (p) => p.day_number === record.day_number && p.completed,
      );
      if (alreadyDone) return;

      setIsStartingRecall(true);
      try {
        const pool = await getPublicQuestionsForRecord(record.id);
        if (pool.length < QUESTIONS_PER_ROUND) {
          toast.error("This record needs at least 3 recall questions.");
          return;
        }
        setSelectedRecord(record);
        setRecallQuestions(pickRandomQuestions(pool, QUESTIONS_PER_ROUND));
      } catch (err) {
        console.error(err);
        toast.error("Failed to start recall challenge.");
      } finally {
        setIsStartingRecall(false);
      }
    },
    [user, isStartingRecall, progress],
  );

  const handleDoneReading = () => {
    if (!selectedRecord || selectedCompleted) return;

    const record = selectedRecord;
    pendingRecallRef.current = record;
    setSelectedRecord(null);

    toast("Ready for the recall questions?", {
      description: "3 timed questions — faster answers earn more points.",
      duration: 12_000,
      action: {
        label: "Let's go!",
        onClick: () => {
          const pending = pendingRecallRef.current;
          pendingRecallRef.current = null;
          if (pending) void handleStartRecall(pending);
        },
      },
      cancel: {
        label: "Not yet",
        onClick: () => {
          pendingRecallRef.current = null;
        },
      },
    });
  };

  const handleRecallFinish = async (answers: RecallAnswer[]) => {
    if (!user || !selectedRecord || isSaving) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/sacred-records/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          dayNumber: selectedRecord.day_number,
          recordId: selectedRecord.id,
          answers,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save");
      }

      setProgress((prev) => {
        const without = prev.filter(
          (p) => p.day_number !== selectedRecord.day_number,
        );
        return [
          ...without,
          {
            day_number: selectedRecord.day_number,
            completed: true,
            points_earned: data.pointsEarned,
            completed_at: new Date().toISOString(),
          },
        ];
      });

      const displayDay =
        [...records]
          .sort((a, b) => a.day_number - b.day_number)
          .findIndex((r) => r.id === selectedRecord.id) + 1;

      toast.success(
        `Day ${displayDay} complete · +${Number(data.pointsEarned).toFixed(2)} pts`,
      );
      setRecallQuestions(null);
      setSelectedRecord(null);

      getSacredRecordsLeaderboard()
        .then((board) => {
          if (board.length === 0) return;
          setIsOverallChamp(board[0]?.userId === user.id);
          if (user.family) {
            const familyTop = board.find((e) => e.family === user.family);
            setIsFamilyChamp(familyTop?.userId === user.id);
          }
        })
        .catch(() => {});
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to save: ${message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-(--primary-gold)" />
        <p className="animate-pulse text-sm font-bold uppercase tracking-widest text-zinc-500">
          Unveiling Records...
        </p>
      </div>
    );
  }

  return (
    <main className="relative flex h-[calc(100vh-80px)] flex-col overflow-hidden">
      <button
        type="button"
        onClick={() => setShowExplainer(true)}
        className="absolute right-4 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-(--primary-gold)/25 bg-white/95 text-(--primary-gold) shadow-sm backdrop-blur-md transition-all hover:border-(--primary-gold)/50 hover:bg-(--primary-gold)/10 dark:border-(--primary-gold)/20 dark:bg-zinc-950/95"
        aria-label="How Sacred Records works"
        title="How it works"
      >
        <HelpCircle className="h-5 w-5" />
      </button>

      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(143,107,42,0.08),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.08),transparent_55%)]"
        aria-hidden
      />

      <div
        className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain"
        data-sacred-scroll
      >
        <PathStats
          streak={streak}
          totalDays={records.length}
          completedDays={completedCount}
          points={totalPoints}
          isFamilyChamp={isFamilyChamp}
          isOverallChamp={isOverallChamp}
        />

        <div className="mx-auto max-w-2xl px-4 pb-24 pt-2">
          {records.length > 0 ? (
            <ProgressPath
              records={records}
              userProgress={progress}
              maxCalendarDay={maxCalendarDay}
              effectsPaused={effectsPaused}
              onNodeClick={(record) => {
                pendingRecallRef.current = null;
                setSelectedRecord(record);
              }}
            />
          ) : (
            <div className="mt-8 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-(--primary-gold)/25 bg-(--primary-gold)/5 p-12 text-center">
              <ScrollText className="mb-4 h-8 w-8 text-(--primary-gold)/50" />
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                The sacred records are empty. Initialise them in the database to
                begin your journey.
              </p>
            </div>
          )}
        </div>
      </div>

      {showExplainer && (
        <SacredRecordsExplainer
          userName={user?.firstName}
          maxCalendarDay={maxCalendarDay}
          onDismiss={dismissExplainer}
        />
      )}

      {selectedRecord && !recallQuestions && (
        <FlashCard
          title={selectedRecord.title}
          category={selectedRecord.category}
          content={selectedRecord.content}
          isCompleted={selectedCompleted}
          onComplete={handleDoneReading}
          onClose={() => {
            pendingRecallRef.current = null;
            setSelectedRecord(null);
          }}
          isCompleting={isStartingRecall || isSaving}
          canStartRecall={
            (questionCounts[selectedRecord.id] ?? 0) >= QUESTIONS_PER_ROUND
          }
          questionCount={questionCounts[selectedRecord.id] ?? 0}
        />
      )}

      {recallQuestions && selectedRecord && (
        <RecallChallenge
          questions={recallQuestions}
          isSaving={isSaving}
          onFinish={handleRecallFinish}
        />
      )}
    </main>
  );
}
