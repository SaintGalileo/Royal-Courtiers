"use client";

import { useState, useEffect } from "react";
import { Clock, Shield, AlertCircle } from "lucide-react";
import { FaComments, FaPenFancy } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ExtracurricularTab = "Debate" | "Essay Writing";

interface EventMatch {
  id: string;
  type: ExtracurricularTab;
  round: string;
  date: string;
  time: string;
  isFinal?: boolean;
  teamA?: string;
  teamB?: string;
  participants?: string;
  isGraded?: boolean;
}

const extracurricularTabs: ExtracurricularTab[] = ["Debate", "Essay Writing"];

const MOCK_MATCHES: EventMatch[] = [
  // Debate (Matchup)
  {
    id: "e1-debate",
    type: "Debate",
    date: "Aug 15",
    round: "Preliminary 1",
    teamA: "Family A",
    teamB: "Family B",
    time: "10:00 AM",
  },
  {
    id: "e2-debate",
    type: "Debate",
    date: "Aug 15",
    round: "Preliminary 2",
    teamA: "Family C",
    teamB: "Family D",
    time: "11:00 AM",
  },
  {
    id: "e-3rd-debate",
    type: "Debate",
    date: "Aug 16",
    round: "3rd Place Match",
    teamA: "Runner Up 1",
    teamB: "Runner Up 2",
    time: "01:00 PM",
  },
  {
    id: "e-final-debate",
    type: "Debate",
    date: "Aug 16",
    round: "Grand Final",
    teamA: "Winner 1",
    teamB: "Winner 2",
    time: "02:00 PM",
    isFinal: true,
  },
  // Essay Writing (Graded)
  {
    id: "e1-essay",
    type: "Essay Writing",
    date: "Aug 15",
    round: "Writing Session",
    participants: "All Families",
    time: "10:00 AM",
    isGraded: true,
  },
  {
    id: "e-final-essay",
    type: "Essay Writing",
    date: "Aug 16",
    round: "Results & Awards",
    participants: "All Families",
    time: "02:00 PM",
    isFinal: true,
    isGraded: true,
  },
];

const ExtracurricularIcon = ({ tab }: { tab: ExtracurricularTab }) => {
  const cls = "h-3.5 w-3.5 shrink-0";
  if (tab === "Debate") return <FaComments className={cls} />;
  if (tab === "Essay Writing") return <FaPenFancy className={cls} />;
  return <FaComments className={cls} />;
};

export default function ExtracurricularPage() {
  const [activeTab, setActiveTab] = useState<ExtracurricularTab>("Debate");
  const [isClient, setIsClient] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const auth = localStorage.getItem("virgins-auth");
    if (!auth) {
      router.push("/login");
      return;
    }
    setIsAuth(true);
  }, [router]);

  const filteredMatches = MOCK_MATCHES.filter((m) => m.type === activeTab);
  const day1Matches = filteredMatches.filter((m) => m.date === "Aug 15");
  const day2Matches = filteredMatches.filter((m) => m.date === "Aug 16");

  if (!isClient || !isAuth) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-20">
      <main className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-400 dark:text-zinc-500 mb-2">
            Official Schedule
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-[-0.03em] leading-none">
            Extracurriculars
          </h1>
          <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-2 font-medium">
            Morning Session &amp; Grand Finals
          </p>
        </header>

        {/* Extracurricular Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {extracurricularTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold
                transition-all border whitespace-nowrap
                ${
                  activeTab === tab
                    ? "bg-(--primary-gold) text-white border-(--primary-gold) shadow-sm"
                    : "bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                }
              `}
            >
              <ExtracurricularIcon tab={tab} />
              {tab}
            </button>
          ))}
        </div>

        {/* Draw Notice */}
        {activeTab === "Debate" && (
          <div className="mb-8 flex items-start gap-3 px-4 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <AlertCircle className="h-4 w-4 text-(--primary-gold) shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
              The Draw will be confirmed after the Event Meeting with the Family
              Heads.
            </p>
          </div>
        )}

        <div className="space-y-10">
          {/* Day 1 */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
                Aug 15 · Morning
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
                Aug 16 · Finals
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

        <footer className="mt-16 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-300 dark:text-zinc-700">
          Official Event Schedule · Subject to change
        </footer>
      </main>
    </div>
  );
}

function MatchCard({ match }: { match: EventMatch }) {
  if (match.isGraded) {
    return (
      <div
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
          <span
            className={`text-[10px] font-black uppercase tracking-[0.16em] ${match.isFinal ? "text-(--primary-gold)" : "text-zinc-400 dark:text-zinc-500"}`}
          >
            {match.round}
          </span>
        </div>

        {/* Participants + time */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <SimpleShield />
            <span className="font-black text-sm text-zinc-700 dark:text-zinc-200 uppercase tracking-tight">
              {match.participants}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Clock className="h-3 w-3 text-(--primary-gold)" />
            <span className="text-xs font-black text-(--primary-gold)">
              {match.time}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
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
        <span
          className={`text-[10px] font-black uppercase tracking-[0.16em] ${match.isFinal ? "text-(--primary-gold)" : "text-zinc-400 dark:text-zinc-500"}`}
        >
          {match.round}
        </span>
      </div>

      {/* Teams + time */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <SimpleShield />
          <span className="font-black text-sm text-zinc-700 dark:text-zinc-200 uppercase tracking-tight">
            {match.teamA}
          </span>
        </div>

        <div className="flex flex-col items-center shrink-0">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-(--primary-gold)" />
            <span className="text-xs font-black text-(--primary-gold)">
              {match.time}
            </span>
          </div>
          <span className="text-[9px] font-black text-zinc-300 dark:text-zinc-600 tracking-[0.14em] mt-0.5">
            VS
          </span>
        </div>

        <div className="flex items-center gap-3 flex-1 justify-end">
          <span className="font-black text-sm text-zinc-700 dark:text-zinc-200 uppercase tracking-tight text-right">
            {match.teamB}
          </span>
          <SimpleShield />
        </div>
      </div>
    </div>
  );
}

function SimpleShield() {
  return (
    <div className="h-10 w-10 shrink-0 flex items-center justify-center bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl relative">
      <Shield className="h-5 w-5 text-zinc-200 dark:text-zinc-700" />
      <span className="absolute text-xs font-black text-zinc-300 dark:text-zinc-600">
        ?
      </span>
    </div>
  );
}
