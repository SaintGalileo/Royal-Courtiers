"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  getSacredRecords, 
  getUserProgress, 
  completeDay, 
  calculateStreak,
  SacredRecord,
  UserProgress 
} from "@/services/sacred-records";
import StatsHeader from "@/components/sacred-records/StatsHeader";
import ProgressPath from "@/components/sacred-records/ProgressPath";
import FlashCard from "@/components/sacred-records/FlashCard";
import { Loader2 } from "lucide-react";

export default function SacredRecordsPage() {
  const [user, setUser] = useState<{ id: string; firstName: string } | null>(null);
  const [records, setRecords] = useState<SacredRecord[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<SacredRecord | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    // Auth Check
    const authStr = localStorage.getItem("virgins-auth");
    if (!authStr) {
      router.push("/login");
      return;
    }
    try {
      const auth = JSON.parse(authStr);
      setUser(auth);
    } catch {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (!user) return;

    async function loadData() {
      setIsLoading(true);
      try {
        const [recordsData, progressData] = await Promise.all([
          getSacredRecords(),
          getUserProgress(user!.id)
        ]);
        setRecords(recordsData);
        setProgress(progressData);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load records. Make sure the database tables exist.");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [user]);

  const streak = useMemo(() => calculateStreak(progress), [progress]);
  const totalPoints = useMemo(() => progress.reduce((sum, p) => sum + p.points_earned, 0), [progress]);
  const completedCount = useMemo(() => progress.filter(p => p.completed).length, [progress]);

  const handleComplete = async () => {
    if (!user || !selectedRecord || isCompleting) return;
    
    setIsCompleting(true);
    const points = 50; // Points per day
    
    try {
      await completeDay(user.id, selectedRecord.day_number, points);
      
      // Update local state
      setProgress(prev => {
        const existing = prev.find(p => p.day_number === selectedRecord.day_number);
        if (existing) return prev;
        return [...prev, {
          day_number: selectedRecord.day_number,
          completed: true,
          points_earned: points,
          completed_at: new Date().toISOString()
        }];
      });
      
      toast.success(`Day ${selectedRecord.day_number} Complete! +${points} Points`);
      setSelectedRecord(null);
    } catch (err: any) {
      console.error("Detailed progress save error:", err);
      toast.error(`Failed to save: ${err.message || "Unknown error"}`);
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="h-10 w-10 animate-spin text-(--primary-gold)" />
        <p className="animate-pulse text-sm font-bold text-zinc-500 uppercase tracking-widest">Unveiling Records...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-20">
      <StatsHeader 
        streak={streak}
        points={totalPoints}
        totalDays={records.length}
        completedDays={completedCount}
      />

      <div className="mx-auto max-w-2xl px-4 pt-12">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 sm:text-4xl">Sacred Records</h1>
          <p className="mt-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">Your daily soul progression path.</p>
        </div>

        {records.length > 0 ? (
          <ProgressPath 
            records={records}
            userProgress={progress}
            onNodeClick={(record) => setSelectedRecord(record)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center border-4 border-dashed border-zinc-200 rounded-3xl dark:border-zinc-800">
            <p className="text-zinc-500">The sacred records are empty. Initialise them in the database to begin your journey.</p>
          </div>
        )}
      </div>

      {/* FlashCard Overlay */}
      {selectedRecord && (
        <FlashCard 
          title={selectedRecord.title}
          category={selectedRecord.category}
          content={selectedRecord.content}
          isCompleted={progress.some(p => p.day_number === selectedRecord.day_number && p.completed)}
          onComplete={handleComplete}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </main>
  );
}
