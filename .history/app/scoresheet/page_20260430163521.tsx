"use client";

import { useState, useEffect, useMemo } from "react";
import { Trophy, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const FAMILIES = ["Dominion", "Light", "Power", "Virtue"];

const CATEGORIES = {
  "Sports Arena": [
    "Football",
    "Volleyball",
    "Badminton",
    "Table Tennis (Male)",
    "Table Tennis (Female)",
    "100m (Male)",
    "100m (Female)",
    "200m (Male)",
    "200m (Female)",
    "400m (Male)",
    "400m (Female)",
    "4 × 100m Relay (Male)",
    "4 × 100m Relay (Female)",
    "Sack Race (Junior Male)",
    "Sack Race (Junior Female)",
    "Egg Race (Junior Male)",
    "Egg Race (Junior Female)",
    "Filling the Basket (Junior Male)",
    "Filling the Basket (Junior Female)",
    "Chess",
    "Scrabble",
    "Ludo",
  ],
  // "Choral Competitions": [
  //   "Composition Competition",
  //   "Solo",
  //   "Duet",
  //   "Quartet",
  //   "Singing Competition",
  // ],
  "Extracurricular Competitions": ["Debate", "Essay Writing", "Pageantry"],
};

type ScoresType = Record<string, Record<string, Record<string, number>>>;

export default function ScoresheetPage() {
  const [scores, setScores] = useState<ScoresType>({});
  const [isClient, setIsClient] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    setIsClient(true);
    const auth = localStorage.getItem("virgins-auth");
    if (!auth) {
      router.push("/login");
      return;
    }
    setIsAuth(true);

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
          // Initialize with zeros if no data found
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

    // Subscribe to realtime updates
    const channel = supabase
      .channel("public:scoresheet")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "scoresheet",
          filter: "id=eq.current",
        },
        (payload) => {
          if (payload.new && payload.new.data) {
            setScores(payload.new.data);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router, supabase]);

  const getFamilyTotal = (family: string) => {
    let total = 0;
    Object.values(scores).forEach((categoryScores) => {
      Object.values(categoryScores).forEach((eventScores) => {
        total += eventScores[family] || 0;
      });
    });
    return total;
  };

  if (!isClient || !isAuth) return null;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-(--primary-gold)" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 px-4 py-14 pb-20">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-(--primary-gold) mb-2 flex items-center gap-2">
            <Trophy className="h-3.5 w-3.5" />
            Live Leaderboard
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-[-0.03em] leading-none">
            Overall Scoresheet
          </h1>
        </header>

        {/* Grand Totals */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {FAMILIES.map((family) => {
            const total = getFamilyTotal(family);
            return (
              <div
                key={family}
                className="bg-white dark:bg-zinc-900 border border-(--primary-gold)/30 rounded-2xl p-6 text-center shadow-[0_4px_20px_-10px_rgba(143,107,42,0.1)] relative overflow-hidden group"
              >
                <div className="absolute -right-4 -top-4 opacity-[0.03] dark:opacity-[0.02] pointer-events-none transition-transform duration-500 group-hover:scale-110">
                  <Trophy className="h-32 w-32" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2 relative z-10">
                  {family}
                </h3>
                <p className="text-5xl font-black text-(--primary-gold) tracking-tighter relative z-10">
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
                <h2 className="text-lg font-black uppercase tracking-tight text-zinc-800 dark:text-zinc-200">
                  {category}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap min-w-[600px]">
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
                            <div className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-center font-black text-(--primary-gold)">
                              {scores[category]?.[event]?.[family] || 0}
                            </div>
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
      </div>
    </main>
  );
}
