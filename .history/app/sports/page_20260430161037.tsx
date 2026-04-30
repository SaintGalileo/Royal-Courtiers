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
import { IoMaleSharp, IoFemaleSharp, IoMaleFemaleSharp } from "react-icons/io5";
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
  gender?: "male" | "female" | "mixed";
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

const MATCHES: Match[] = [
  // Football
  {
    id: "fb-sf1-1",
    type: "Football",
    round: "Semi-Final 1 (1st Leg)",
    date: "July 24",
    time: "04:00 PM",
    teamA: "TBD",
    teamB: "TBD",
  },
  {
    id: "fb-sf2-1",
    type: "Football",
    round: "Semi-Final 2 (1st Leg)",
    date: "July 25",
    time: "04:00 PM",
    teamA: "TBD",
    teamB: "TBD",
  },
  {
    id: "fb-sf1-2",
    type: "Football",
    round: "Semi-Final 1 (2nd Leg)",
    date: "Aug 3",
    time: "04:00 PM",
    teamA: "TBD",
    teamB: "TBD",
  },
  {
    id: "fb-sf2-2",
    type: "Football",
    round: "Semi-Final 2 (2nd Leg)",
    date: "Aug 4",
    time: "04:00 PM",
    teamA: "TBD",
    teamB: "TBD",
  },
  {
    id: "fb-3rd",
    type: "Football",
    round: "3rd Place Match",
    date: "Aug 8",
    time: "04:00 PM",
    teamA: "Runner Up 1",
    teamB: "Runner Up 2",
  },
  {
    id: "fb-final",
    type: "Football",
    round: "Grand Final",
    date: "Aug 12",
    time: "04:00 PM",
    teamA: "Winner SF1",
    teamB: "Winner SF2",
    isFinal: true,
  },

  // Volleyball (Mixed: 3 Male + 3 Female) - Aug 11 (Sports Day)
  {
    id: "vb-sf1",
    type: "Volleyball",
    round: "Semi-Final 1 · Mixed (3M + 3F)",
    date: "Aug 11",
    time: "",
    teamA: "TBD",
    teamB: "TBD",
    gender: "mixed",
  },
  {
    id: "vb-sf2",
    type: "Volleyball",
    round: "Semi-Final 2 · Mixed (3M + 3F)",
    date: "Aug 11",
    time: "",
    teamA: "TBD",
    teamB: "TBD",
    gender: "mixed",
  },
  {
    id: "vb-3rd",
    type: "Volleyball",
    round: "3rd Place Match · Mixed (3M + 3F)",
    date: "Aug 11",
    time: "",
    teamA: "Runner Up 1",
    teamB: "Runner Up 2",
    gender: "mixed",
  },
  {
    id: "vb-final",
    type: "Volleyball",
    round: "Grand Final · Mixed (3M + 3F)",
    date: "Aug 11",
    time: "",
    teamA: "Winner SF1",
    teamB: "Winner SF2",
    isFinal: true,
    gender: "mixed",
  },

  // Badminton (Mixed Doubles) - Aug 11 (Sports Day)
  {
    id: "bm-sf1",
    type: "Badminton",
    round: "Semi-Final 1 · Mixed Doubles",
    date: "Aug 11",
    time: "",
    teamA: "TBD",
    teamB: "TBD",
    gender: "mixed",
  },
  {
    id: "bm-sf2",
    type: "Badminton",
    round: "Semi-Final 2 · Mixed Doubles",
    date: "Aug 11",
    time: "",
    teamA: "TBD",
    teamB: "TBD",
    gender: "mixed",
  },
  {
    id: "bm-3rd",
    type: "Badminton",
    round: "3rd Place Match · Mixed Doubles",
    date: "Aug 11",
    time: "",
    teamA: "Runner Up 1",
    teamB: "Runner Up 2",
    gender: "mixed",
  },
  {
    id: "bm-final",
    type: "Badminton",
    round: "Grand Final · Mixed Doubles",
    date: "Aug 11",
    time: "",
    teamA: "Winner SF1",
    teamB: "Winner SF2",
    isFinal: true,
    gender: "mixed",
  },

  // Table Tennis (Singles — Male & Female) - Aug 11 (Sports Day)
  {
    id: "tt-sf1-m",
    type: "Table Tennis",
    round: "Semi-Final 1",
    date: "Aug 11",
    time: "",
    teamA: "TBD",
    teamB: "TBD",
    gender: "male",
  },
  {
    id: "tt-sf2-m",
    type: "Table Tennis",
    round: "Semi-Final 2",
    date: "Aug 11",
    time: "",
    teamA: "TBD",
    teamB: "TBD",
    gender: "male",
  },
  {
    id: "tt-sf1-f",
    type: "Table Tennis",
    round: "Semi-Final 1",
    date: "Aug 11",
    time: "",
    teamA: "TBD",
    teamB: "TBD",
    gender: "female",
  },
  {
    id: "tt-sf2-f",
    type: "Table Tennis",
    round: "Semi-Final 2",
    date: "Aug 11",
    time: "",
    teamA: "TBD",
    teamB: "TBD",
    gender: "female",
  },
  {
    id: "tt-final-m",
    type: "Table Tennis",
    round: "Grand Final",
    date: "Aug 11",
    time: "",
    teamA: "Winner SF1",
    teamB: "Winner SF2",
    isFinal: true,
    gender: "male",
  },
  {
    id: "tt-final-f",
    type: "Table Tennis",
    round: "Grand Final",
    date: "Aug 11",
    time: "",
    teamA: "Winner SF1",
    teamB: "Winner SF2",
    isFinal: true,
    gender: "female",
  },

  // Track Events - Aug 11 (Sports Day)

  {
    id: "tr-100m-final-m",
    type: "Track Events",
    round: "100m Final",
    date: "Aug 11",
    time: "",
    participants: "All Families",
    isGraded: true,
    isFinal: true,
    gender: "male",
  },
  {
    id: "tr-100m-final-f",
    type: "Track Events",
    round: "100m Final",
    date: "Aug 11",
    time: "",
    participants: "All Families",
    isGraded: true,
    isFinal: true,
    gender: "female",
  },
  {
    id: "tr-200m-final-m",
    type: "Track Events",
    round: "200m Final",
    date: "Aug 11",
    time: "",
    participants: "All Families",
    isGraded: true,
    isFinal: true,
    gender: "male",
  },
  {
    id: "tr-200m-final-f",
    type: "Track Events",
    round: "200m Final",
    date: "Aug 11",
    time: "",
    participants: "All Families",
    isGraded: true,
    isFinal: true,
    gender: "female",
  },
  {
    id: "tr-400m-final-m",
    type: "Track Events",
    round: "400m Final",
    date: "Aug 11",
    time: "",
    participants: "All Families",
    isGraded: true,
    isFinal: true,
    gender: "male",
  },
  {
    id: "tr-400m-final-f",
    type: "Track Events",
    round: "400m Final",
    date: "Aug 11",
    time: "",
    participants: "All Families",
    isGraded: true,
    isFinal: true,
    gender: "female",
  },
  {
    id: "tr-relay-final-m",
    type: "Track Events",
    round: "4 × 100m Relay Final",
    date: "Aug 11",
    time: "",
    participants: "All Families",
    isGraded: true,
    isFinal: true,
    gender: "male",
  },
  {
    id: "tr-relay-final-f",
    type: "Track Events",
    round: "4 × 100m Relay Final",
    date: "Aug 11",
    time: "",
    participants: "All Families",
    isGraded: true,
    isFinal: true,
    gender: "female",
  },

  // Junior Games - Aug 11 (Sports Day)
  {
    id: "jr-sack-m",
    type: "Sack Race (Junior)",
    round: "Male Category",
    date: "Aug 11",
    time: "",
    participants: "All Junior Families",
    isGraded: true,
    gender: "male",
  },
  {
    id: "jr-sack-f",
    type: "Sack Race (Junior)",
    round: "Female Category",
    date: "Aug 11",
    time: "",
    participants: "All Junior Families",
    isGraded: true,
    gender: "female",
  },
  {
    id: "jr-egg-m",
    type: "Egg Race (Junior)",
    round: "Male Category",
    date: "Aug 11",
    time: "",
    participants: "All Junior Families",
    isGraded: true,
    gender: "male",
  },
  {
    id: "jr-egg-f",
    type: "Egg Race (Junior)",
    round: "Female Category",
    date: "Aug 11",
    time: "",
    participants: "All Junior Families",
    isGraded: true,
    gender: "female",
  },
  {
    id: "jr-basket-m",
    type: "Filling the Basket (Junior)",
    round: "Male Category",
    date: "Aug 11",
    time: "",
    participants: "All Junior Families",
    isGraded: true,
    gender: "male",
  },
  {
    id: "jr-basket-f",
    type: "Filling the Basket (Junior)",
    round: "Female Category",
    date: "Aug 11",
    time: "",
    participants: "All Junior Families",
    isGraded: true,
    gender: "female",
  },

  // Indoor Games (Chess, Scrabble, Ludo) - Aug 10
  {
    id: "ch-sf1",
    type: "Chess",
    round: "Semi-Final 1",
    date: "Aug 10",
    time: "02:00 PM",
    teamA: "TBD",
    teamB: "TBD",
  },
  {
    id: "ch-sf2",
    type: "Chess",
    round: "Semi-Final 2",
    date: "Aug 10",
    time: "02:00 PM",
    teamA: "TBD",
    teamB: "TBD",
  },
  {
    id: "ch-final",
    type: "Chess",
    round: "Grand Final",
    date: "Aug 10",
    time: "02:00 PM",
    teamA: "Winner SF1",
    teamB: "Winner SF2",
    isFinal: true,
  },
  {
    id: "sc-sf1",
    type: "Scrabble",
    round: "Semi-Final 1",
    date: "Aug 10",
    time: "02:00 PM",
    teamA: "TBD",
    teamB: "TBD",
  },
  {
    id: "sc-sf2",
    type: "Scrabble",
    round: "Semi-Final 2",
    date: "Aug 10",
    time: "02:00 PM",
    teamA: "TBD",
    teamB: "TBD",
  },
  {
    id: "sc-final",
    type: "Scrabble",
    round: "Grand Final",
    date: "Aug 10",
    time: "02:00 PM",
    teamA: "Winner SF1",
    teamB: "Winner SF2",
    isFinal: true,
  },
  {
    id: "lu-sf1",
    type: "Ludo",
    round: "Semi-Final 1",
    date: "Aug 10",
    time: "02:00 PM",
    teamA: "TBD",
    teamB: "TBD",
  },
  {
    id: "lu-sf2",
    type: "Ludo",
    round: "Semi-Final 2",
    date: "Aug 10",
    time: "02:00 PM",
    teamA: "TBD",
    teamB: "TBD",
  },
  {
    id: "lu-final",
    type: "Ludo",
    round: "Grand Final",
    date: "Aug 10",
    time: "02:00 PM",
    teamA: "Winner SF1",
    teamB: "Winner SF2",
    isFinal: true,
  },
];

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

  const filteredMatches = MATCHES.filter((m) => m.type === activeTab);

  // Group matches by date
  const groupedMatches = filteredMatches.reduce(
    (acc, match) => {
      if (!acc[match.date]) acc[match.date] = [];
      acc[match.date].push(match);
      return acc;
    },
    {} as Record<string, Match[]>,
  );

  const sortedDates = Object.keys(groupedMatches).sort((a, b) => {
    const monthOrder: Record<string, number> = { June: 6, July: 7, Aug: 8 };
    const parse = (d: string) => {
      const [m, day] = d.split(" ");
      return (monthOrder[m] || 0) * 100 + parseInt(day, 10);
    };
    return parse(a) - parse(b);
  });

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
            Tournament Session &amp; Grand Finals
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
                ${
                  activeTab === sport
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
          {sortedDates.length > 0 ? (
            sortedDates.map((date) => (
              <section key={date}>
                <div className="flex items-center gap-3 mb-5">
                  <span
                    className={`text-[10px] font-black uppercase tracking-[0.18em] ${groupedMatches[date].some((m) => m.isFinal) ? "text-(--primary-gold)" : "text-zinc-400 dark:text-zinc-500"}`}
                  >
                    {date} ·{" "}
                    {groupedMatches[date].some((m) => m.isFinal)
                      ? "Finals"
                      : "Preliminaries"}
                  </span>
                  <div
                    className={`h-px flex-1 ${groupedMatches[date].some((m) => m.isFinal) ? "bg-(--primary-gold)/20" : "bg-zinc-200 dark:bg-zinc-800"}`}
                  />
                </div>
                <div className="grid gap-3">
                  {groupedMatches[date].map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </section>
            ))
          ) : (
            <p className="py-8 text-center text-sm text-zinc-400 italic border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
              Schedule to be updated soon.
            </p>
          )}
        </div>

        <footer className="mt-16 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-300 dark:text-zinc-700">
          Official Event Schedule · Subject to change
        </footer>
      </main>
    </div>
  );
}

function MatchCard({ match }: { match: Match }) {
  const GenderIcon = () => {
    if (match.gender === "male")
      return <IoMaleSharp className="ml-1.5 h-3.5 w-3.5 text-blue-500" />;
    if (match.gender === "female")
      return <IoFemaleSharp className="ml-1.5 h-3.5 w-3.5 text-pink-500" />;
    if (match.gender === "mixed")
      return (
        <IoMaleFemaleSharp className="ml-1.5 h-3.5 w-3.5 text-purple-500" />
      );
    return null;
  };

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
            className={`flex items-center text-[10px] font-black uppercase tracking-[0.16em] ${match.isFinal ? "text-(--primary-gold)" : "text-zinc-400 dark:text-zinc-500"}`}
          >
            {match.round}
            <GenderIcon />
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
          className={`flex items-center text-[10px] font-black uppercase tracking-[0.16em] ${match.isFinal ? "text-(--primary-gold)" : "text-zinc-400 dark:text-zinc-500"}`}
        >
          {match.round}
          <GenderIcon />
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
