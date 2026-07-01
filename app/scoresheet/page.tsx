"use client";

import { useState, useEffect, useMemo } from "react";
import { Trophy, Loader2, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  FAMILIES,
  CATEGORIES,
  CONDUCT_STARTING_POINTS,
  type ScoresheetData,
  countFamilyIncidents,
  createEmptyScoresheetData,
  getConductScore,
  getFamilyTotal,
  getFamilyIncidentLines,
  parseScoresheetData,
} from "@/lib/scoresheet";

export default function ScoresheetPage() {
  const [scoresheet, setScoresheet] = useState<ScoresheetData>(
    createEmptyScoresheetData(),
  );
  const [isClient, setIsClient] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedConduct, setExpandedConduct] = useState<string | null>(null);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const { scores, penalties, familyPenalties } = scoresheet;

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
          setScoresheet(parseScoresheetData(data.data));
        } else {
          setScoresheet(createEmptyScoresheetData());
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchScores();

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
            setScoresheet(parseScoresheetData(payload.new.data));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router, supabase]);

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
            const total = getFamilyTotal(
              scores,
              penalties,
              familyPenalties,
              family,
            );
            const conduct = getConductScore(
              penalties,
              familyPenalties,
              family,
            );
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
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-2 relative z-10">
                  Conduct: {conduct}/{CONDUCT_STARTING_POINTS}
                </p>
              </div>
            );
          })}
        </div>

        {/* Conduct & Discipline */}
        <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm mb-12">
          <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
            <h2 className="text-lg font-black uppercase tracking-tight text-zinc-800 dark:text-zinc-200">
              Conduct &amp; Discipline
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Each family starts with {CONDUCT_STARTING_POINTS} points.
              Penalties are deducted per recorded incident.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap min-w-[600px]">
              <thead className="bg-zinc-50 dark:bg-zinc-950/50 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest w-1/3">
                    Family
                  </th>
                  <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest text-center">
                    Net Score
                  </th>
                  <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest text-center hidden sm:table-cell">
                    Incidents
                  </th>
                  <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest text-center hidden md:table-cell">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {FAMILIES.map((family) => {
                  const conduct = getConductScore(
                    penalties,
                    familyPenalties,
                    family,
                  );
                  const incidentCount = countFamilyIncidents(
                    penalties,
                    familyPenalties,
                    family,
                  );
                  const isExpanded = expandedConduct === family;

                  return (
                    <tr
                      key={family}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-zinc-700 dark:text-zinc-300">
                        {family}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className="font-black text-(--primary-gold)">
                          {conduct}
                        </span>
                        <span className="text-zinc-400 text-xs">
                          {" "}
                          / {CONDUCT_STARTING_POINTS}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center hidden sm:table-cell">
                        <span className="text-zinc-600 dark:text-zinc-400 font-bold">
                          {incidentCount}
                        </span>
                      </td>
                      <td className="px-6 py-3 hidden md:table-cell">
                        {incidentCount === 0 ? (
                          <span className="text-zinc-400 text-xs">—</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedConduct(
                                isExpanded ? null : family,
                              )
                            }
                            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                          >
                            {isExpanded ? "Hide" : "Show"}
                            <ChevronDown
                              className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                            />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {expandedConduct && (
            <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-950/30">
              <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2">
                {expandedConduct} — incident log
              </p>
              <ul className="space-y-1">
                {(() => {
                  const lines = getFamilyIncidentLines(
                    penalties,
                    familyPenalties,
                    expandedConduct,
                  );
                  if (lines.length === 0) {
                    return (
                      <li className="text-xs text-zinc-500">No incidents.</li>
                    );
                  }
                  return lines.map((line, i) => (
                    <li
                      key={i}
                      className="text-xs text-zinc-600 dark:text-zinc-400"
                    >
                      {line}
                    </li>
                  ));
                })()}
              </ul>
            </div>
          )}
        </section>

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
