"use client";

import { useState, useEffect, useMemo } from "react";
import { Trophy, RefreshCw, Save, Loader2, AlertTriangle, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const FAMILIES = ["Dominion", "Light", "Power", "Virtue"];

const CATEGORIES = {
  "Sports Arena": [
    "Football",
    "Volleyball",
    "Badminton",
    "Table Tennis",
    "Track Events (4 x 100m Relay)",
    "Sack Race (Junior)",
    "Egg Race (Junior)",
    "Filling the Basket (Junior)",
    "Chess",
    "Scrabble",
    "Ludo",
  ],
  "Choral Competitions": ["Solo", "Duet", "Quartet", "Keyboard Competition"],
  "Extracurricular Competitions": ["Debate", "Essay Writing", "Pageantry"],
};

type ScoresType = Record<string, Record<string, Record<string, number>>>;

export default function AdminScoresheetPage() {
  const [scores, setScores] = useState<ScoresType>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function fetchScores() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("scoresheet")
          .select("data")
          .eq("id", "current")
          .maybeSingle();

        if (data && !error) {
          setScores(data.data);
        } else {
          // Initialize if not found
          const initial: ScoresType = {};
          Object.entries(CATEGORIES).forEach(([cat, events]) => {
            initial[cat] = {};
            events.forEach((ev) => {
              initial[cat][ev] = {};
              FAMILIES.forEach((fam) => {
                initial[cat][ev][fam] = 0;
              });
            });
          });
          setScores(initial);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchScores();
  }, [supabase]);

  const handleScoreChange = (
    category: string,
    event: string,
    family: string,
    value: string,
  ) => {
    const numValue = parseInt(value, 10) || 0;
    setScores((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [event]: {
          ...prev[category]?.[event],
          [family]: numValue,
        },
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.from("scoresheet").upsert(
        { id: "current", data: scores, updated_at: new Date().toISOString() },
        { onConflict: "id" }
      );

      if (error) {
        console.error(error);
        toast.error("Failed to save scores. Ensure the 'scoresheet' table exists.");
      } else {
        toast.success("Scoresheet updated successfully!");
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("An unexpected error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const getFamilyTotal = (family: string) => {
    let total = 0;
    Object.values(scores).forEach((categoryScores) => {
      Object.values(categoryScores).forEach((eventScores) => {
        total += eventScores[family] || 0;
      });
    });
    return total;
  };

  const resetScores = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    const initial: ScoresType = {};
    Object.entries(CATEGORIES).forEach(([cat, events]) => {
      initial[cat] = {};
      events.forEach((ev) => {
        initial[cat][ev] = {};
        FAMILIES.forEach((fam) => {
          initial[cat][ev][fam] = 0;
        });
      });
    });
    setScores(initial);
    setShowResetConfirm(false);
    toast.success("Scores reset to zero. Click Save to persist changes.");
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-(--primary-gold)" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Official Scoresheet</h1>
          <p className="mt-1 text-sm text-zinc-500">Update scores for all families and competitions.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={resetScores}
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 transition-all hover:bg-red-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-red-400"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-xl bg-(--primary-gold) px-6 py-2.5 text-sm font-black text-white shadow-lg shadow-(--primary-gold)/20 transition-all hover:bg-(--primary-gold-hover) active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={18} />}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </header>

      {/* Grand Totals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {FAMILIES.map((family) => {
          const total = getFamilyTotal(family);
          return (
            <div
              key={family}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 text-center shadow-xs relative overflow-hidden group"
            >
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-1">
                {family}
              </h3>
              <p className="text-4xl font-black text-(--primary-gold) tracking-tighter">
                {total}
              </p>
            </div>
          );
        })}
      </div>

      {/* Categories */}
      <div className="space-y-12">
        {Object.entries(CATEGORIES).map(([category, events]) => (
          <section
            key={category}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm"
          >
            <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
              <h2 className="text-sm font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                {category}
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-zinc-50 dark:bg-zinc-950/50 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest w-1/3">
                      Event
                    </th>
                    {FAMILIES.map((family) => (
                      <th
                        key={family}
                        className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest text-center"
                      >
                        {family}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                  {events.map((event) => (
                    <tr
                      key={event}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-zinc-700 dark:text-zinc-300">
                        {event}
                      </td>
                      {FAMILIES.map((family) => (
                        <td key={family} className="px-6 py-3">
                          <input
                            type="number"
                            min="0"
                            value={scores[category]?.[event]?.[family] ?? 0}
                            onChange={(e) =>
                              handleScoreChange(
                                category,
                                event,
                                family,
                                e.target.value,
                              )
                            }
                            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-center font-black text-(--primary-gold) outline-none focus:ring-2 focus:ring-(--primary-gold)/50 appearance-none transition-all"
                            placeholder="0"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>

      {/* Custom Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md" 
            onClick={() => setShowResetConfirm(false)}
          />
          <div className="relative w-full max-w-md scale-in-center overflow-hidden rounded-3xl border border-zinc-200 bg-white p-8 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-900/20">
                <AlertTriangle size={32} />
              </div>
              
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Reset All Scores?</h2>
              <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                This will set all family scores to zero across all competitions. 
                <span className="block mt-1 font-semibold text-red-500">This action cannot be undone once saved.</span>
              </p>

              <div className="mt-8 flex w-full gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 rounded-xl border border-zinc-200 py-3 text-sm font-bold text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReset}
                  className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition-all hover:bg-red-600 active:scale-95"
                >
                  Yes, Reset All
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowResetConfirm(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
