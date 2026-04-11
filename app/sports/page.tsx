"use client";

import { useState, useEffect } from "react";
import { Clock, ChevronRight, Shield, AlertCircle } from "lucide-react";
import { FaFutbol, FaRunning, FaTableTennis } from "react-icons/fa";
import { GiShuttlecock } from "react-icons/gi";
import GlobalNavbar from "@/components/GlobalNavbar";
import GlobalFooter from "@/components/GlobalFooter";
import Link from "next/link";

type SportTab = "Football" | "Race" | "Table Tennis" | "Badminton";

interface Match {
  id: string;
  type: SportTab;
  round: string;
  date: string;
  teamA: string;
  teamB: string;
  time: string;
  isFinal?: boolean;
}

const sports: SportTab[] = ["Football", "Race", "Table Tennis", "Badminton"];

const MOCK_MATCHES: Match[] = [
  { id: "f1", type: "Football", date: "Aug 11", round: "Semi-Final 1", teamA: "TBD", teamB: "TBD", time: "08:30 AM" },
  { id: "f2", type: "Football", date: "Aug 11", round: "Semi-Final 2", teamA: "TBD", teamB: "TBD", time: "09:00 AM" },
  { id: "f-final", type: "Football", date: "Aug 12", round: "Grand Final", teamA: "Winner SF1", teamB: "Winner SF2", time: "10:30 AM", isFinal: true },
];

const SportIcon = ({ sport }: { sport: SportTab }) => {
  const cls = "h-3.5 w-3.5 shrink-0";
  if (sport === "Football") return <FaFutbol className={cls} />;
  if (sport === "Race") return <FaRunning className={cls} />;
  if (sport === "Table Tennis") return <FaTableTennis className={cls} />;
  return <GiShuttlecock className={cls} />;
};

export default function SportsPage() {
  const [activeTab, setActiveTab] = useState<SportTab>("Football");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const filteredMatches = MOCK_MATCHES.filter(m => m.type === activeTab);
  const day1Matches = filteredMatches.filter(m => m.date === "Aug 11");
  const day2Matches = filteredMatches.filter(m => m.date === "Aug 12");

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-20">
      <main className="max-w-2xl mx-auto px-4 py-12">

        {/* Header */}
        <header className="mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-400 dark:text-zinc-500 mb-2">
            Official Schedule
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-[-0.03em] uppercase leading-none">
            Sports Arena
          </h1>
          <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-2 font-medium">
            Morning Session &amp; Grand Finals
          </p>
        </header>

        {/* Sport Tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1 no-scrollbar">
          {sports.map((sport) => (
            <button
              key={sport}
              onClick={() => setActiveTab(sport)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold
                transition-all border whitespace-nowrap shrink-0
                ${activeTab === sport
                  ? "bg-(--primary-gold) text-white border-(--primary-gold) shadow-sm"
                  : "bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                }
              `}
            >
              <SportIcon sport={sport} />
              {sport}
            </button>
          ))}
        </div>

        {/* Draw Notice */}
        <div className="mb-8 flex items-start gap-3 px-4 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <AlertCircle className="h-4 w-4 text-(--primary-gold) shrink-0 mt-0.5" />
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
            The Draw will be confirmed after the Event Meeting with the Family Heads.
          </p>
        </div>

        {/* Match Feed — Football gets full cards, others get a placeholder */}
        {activeTab === "Football" ? (
          <div className="space-y-10">

            {/* Day 1 */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
                  Aug 11 · Morning
                </span>
                <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-1" />
              </div>
              <div className="grid gap-3">
                {day1Matches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </section>

            {/* Day 2 — Finals */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-(--primary-gold)">
                  Aug 12 · Finals
                </span>
                <div className="h-px bg-(--primary-gold)/20 flex-1" />
              </div>
              <div className="grid gap-3">
                {day2Matches.length > 0 ? (
                  day2Matches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))
                ) : (
                  <p className="py-8 text-center text-sm text-zinc-400 italic border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                    Finals bracket to be updated soon.
                  </p>
                )}
              </div>
            </section>

          </div>
        ) : (
          /* Race / Table Tennis / Badminton — Coming Soon placeholder */
          <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-10 text-center">
            <div className="flex justify-center mb-5">
              <div className="h-14 w-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
                <SportIcon sport={activeTab} />
              </div>
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight mb-2">{activeTab}</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mb-4">
              Tuesday · Starting from 1:00 PM
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700">
              <AlertCircle className="h-3.5 w-3.5 text-(--primary-gold)" />
              <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                Schedule will be uploaded soon
              </span>
            </div>
          </div>
        )}

        <footer className="mt-16 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-300 dark:text-zinc-700">
          Official Event Schedule · Subject to change
        </footer>

      </main>
    </div>
  );
}

function MatchCard({ match }: { match: Match }) {
  return (
    <Link
      href={`/sports/${match.id}`}
      className={`
        group block bg-white dark:bg-zinc-900
        border border-zinc-200 dark:border-zinc-800
        rounded-2xl px-6 py-5
        hover:border-zinc-300 dark:hover:border-zinc-700
        hover:shadow-sm
        transition-all duration-200
        ${match.isFinal ? "border-(--primary-gold)/30 dark:border-(--primary-gold)/20" : ""}
      `}
    >
      {/* Round label */}
      <div className="flex items-center justify-between mb-4">
        <span className={`text-[10px] font-black uppercase tracking-[0.16em] ${match.isFinal ? "text-(--primary-gold)" : "text-zinc-400 dark:text-zinc-500"}`}>
          {match.round}
        </span>
        <span className="flex items-center gap-1 text-[10px] font-black text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-400 dark:group-hover:text-zinc-500 transition-colors uppercase tracking-widest">
          Details <ChevronRight className="h-3 w-3" />
        </span>
      </div>

      {/* Teams + time */}
      <div className="flex items-center justify-between gap-4">
        {/* Team A */}
        <div className="flex items-center gap-3 flex-1">
          <SimpleShield />
          <span className="font-black text-sm text-zinc-700 dark:text-zinc-200 uppercase tracking-tight">{match.teamA}</span>
        </div>

        {/* Time */}
        <div className="flex flex-col items-center shrink-0">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-(--primary-gold)" />
            <span className="text-xs font-black text-(--primary-gold)">{match.time}</span>
          </div>
          <span className="text-[9px] font-black text-zinc-300 dark:text-zinc-600 tracking-[0.14em] mt-0.5">VS</span>
        </div>

        {/* Team B */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          <span className="font-black text-sm text-zinc-700 dark:text-zinc-200 uppercase tracking-tight text-right">{match.teamB}</span>
          <SimpleShield />
        </div>
      </div>
    </Link>
  );
}

function SimpleShield() {
  return (
    <div className="h-10 w-10 shrink-0 flex items-center justify-center bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl relative">
      <Shield className="h-5 w-5 text-zinc-200 dark:text-zinc-700" />
      <span className="absolute text-xs font-black text-zinc-300 dark:text-zinc-600">?</span>
    </div>
  );
}