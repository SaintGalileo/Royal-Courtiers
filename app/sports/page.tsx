"use client";

import { useState, useEffect } from "react";
import { Clock, ChevronRight, Shield, AlertCircle } from "lucide-react";
import {
  FaFutbol,
  FaRunning,
  FaTableTennis,
  FaVolleyballBall,
  FaChild,
  FaEgg,
  FaShoppingBasket,
  FaChess,
  FaFont,
  FaDice,
} from "react-icons/fa";
import { GiShuttlecock } from "react-icons/gi";
import GlobalNavbar from "@/components/GlobalNavbar";
import GlobalFooter from "@/components/GlobalFooter";
import Link from "next/link";
import { useRouter } from "next/navigation";

type SportTab =
  | "Football"
  | "Volleyball"
  | "Badminton"
  | "Table Tennis"
  | "Track Events"
  | "Sack Race (Junior)"
  | "Egg Race (Junior)"
  | "Filling the Basket (Junior)"
  | "Chess"
  | "Scrabble"
  | "Ludo";

interface Match {
  id: string;
  type: SportTab;
  round: string;
  date: string;
  time: string;
  isFinal?: boolean;
  teamA?: string;
  teamB?: string;
  participants?: string;
  isGraded?: boolean;
}

const sports: SportTab[] = [
  "Football",
  "Volleyball",
  "Badminton",
  "Table Tennis",
  "Track Events",
  "Sack Race (Junior)",
  "Egg Race (Junior)",
  "Filling the Basket (Junior)",
  "Chess",
  "Scrabble",
  "Ludo",
];

const MOCK_MATCHES: Match[] = sports.flatMap((tab, i): Match[] => {
  const isGraded = [
    "Track Events",
    "Sack Race (Junior)",
    "Egg Race (Junior)",
    "Filling the Basket (Junior)",
  ].includes(tab);

  if (isGraded) {
    return [
      {
        id: `s1-${i}`,
        type: tab,
        date: "Aug 11",
        round: "Performance Session",
        participants: "All Families",
        time: "10:00 AM",
        isGraded: true,
      },
      {
        id: `s-final-${i}`,
        type: tab,
        date: "Aug 12",
        round: "Results & Awards",
        participants: "All Families",
        time: "02:00 PM",
        isFinal: true,
        isGraded: true,
      },
    ];
  } else {
    return [
      {
        id: `s1-${i}`,
        type: tab,
        date: "Aug 11",
        round: "Semi-Final 1",
        teamA: "TBD",
        teamB: "TBD",
        time: "08:30 AM",
      },
      {
        id: `s2-${i}`,
        type: tab,
        date: "Aug 11",
        round: "Semi-Final 2",
        teamA: "TBD",
        teamB: "TBD",
        time: "09:00 AM",
      },
      {
        id: `s-3rd-${i}`,
        type: tab,
        date: "Aug 12",
        round: "3rd Place Match",
        teamA: "Runner Up 1",
        teamB: "Runner Up 2",
        time: "01:00 PM",
      },
      {
        id: `s-final-${i}`,
        type: tab,
        date: "Aug 12",
        round: "Grand Final",
        teamA: "Winner SF1",
        teamB: "Winner SF2",
        time: "10:30 AM",
        isFinal: true,
      },
    ];
  }
});

const SportIcon = ({ sport }: { sport: SportTab }) => {
  const cls = "h-3.5 w-3.5 shrink-0";
  if (sport === "Football") return <FaFutbol className={cls} />;
  if (sport === "Volleyball") return <FaVolleyballBall className={cls} />;
  if (sport === "Badminton")
    return <GiShuttlecock className={`${cls} rotate-210`} />;
  if (sport === "Table Tennis") return <FaTableTennis className={cls} />;
  if (sport === "Track Events") return <FaRunning className={cls} />;
  if (sport === "Sack Race (Junior)") return <FaChild className={cls} />;
  if (sport === "Egg Race (Junior)") return <FaEgg className={cls} />;
  if (sport === "Filling the Basket (Junior)")
    return <FaShoppingBasket className={cls} />;
  if (sport === "Chess") return <FaChess className={cls} />;
  if (sport === "Scrabble") return <FaFont className={cls} />;
  if (sport === "Ludo") return <FaDice className={cls} />;
  return <FaFutbol className={cls} />;
};

export default function SportsPage() {
  const [activeTab, setActiveTab] = useState<SportTab>("Football");
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
  const day1Matches = filteredMatches.filter((m) => m.date === "Aug 11");
  const day2Matches = filteredMatches.filter((m) => m.date === "Aug 12");

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
            Sports Arena
          </h1>
          <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-2 font-medium">
            Morning Session &amp; Grand Finals
          </p>
        </header>

        {/* Sport Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {sports.map((sport) => (
            <button
              key={sport}
              onClick={() => setActiveTab(sport)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold
                transition-all border whitespace-nowrap
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
        {![
          "Track Events",
          "Sack Race (Junior)",
          "Egg Race (Junior)",
          "Filling the Basket (Junior)",
        ].includes(activeTab) && (
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

        <footer className="mt-16 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-300 dark:text-zinc-700">
          Official Event Schedule · Subject to change
        </footer>
      </main>
    </div>
  );
}

function MatchCard({ match }: { match: Match }) {
  if (match.isGraded) {
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
          <span
            className={`text-[10px] font-black uppercase tracking-[0.16em] ${match.isFinal ? "text-(--primary-gold)" : "text-zinc-400 dark:text-zinc-500"}`}
          >
            {match.round}
          </span>
          <span className="flex items-center gap-1 text-[10px] font-black text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-400 dark:group-hover:text-zinc-500 transition-colors uppercase tracking-widest">
            Details <ChevronRight className="h-3 w-3" />
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
      </Link>
    );
  }

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
        <span
          className={`text-[10px] font-black uppercase tracking-[0.16em] ${match.isFinal ? "text-(--primary-gold)" : "text-zinc-400 dark:text-zinc-500"}`}
        >
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
          <span className="font-black text-sm text-zinc-700 dark:text-zinc-200 uppercase tracking-tight">
            {match.teamA}
          </span>
        </div>

        {/* Time */}
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

        {/* Team B */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          <span className="font-black text-sm text-zinc-700 dark:text-zinc-200 uppercase tracking-tight text-right">
            {match.teamB}
          </span>
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
      <span className="absolute text-xs font-black text-zinc-300 dark:text-zinc-600">
        ?
      </span>
    </div>
  );
}
