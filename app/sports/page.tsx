"use client";

import { useState, useEffect, useMemo } from "react";
import { Clock } from "lucide-react";
import {
  FaFutbol,
  FaRunning,
  FaTableTennis,
  FaVolleyballBall,
  FaChess,
  FaFont,
} from "react-icons/fa";
import { IoMaleSharp, IoFemaleSharp, IoMaleFemaleSharp } from "react-icons/io5";
import { useRouter } from "next/navigation";
import EventInfoCard from "@/components/competitions/EventInfoCard";
import {
  FamilyTeamButton,
  AllFamiliesRosterButtons,
} from "@/components/competitions/FamilyTeamButton";
import { EventRosterPanel } from "@/components/competitions/EventRosterPanel";
import CompetitionBackButton from "@/components/competitions/CompetitionBackButton";
import { type CompetitionFamily } from "@/lib/competitions";
import {
  SPORT_MATCHES,
  SPORT_TABS,
  isWinnerMode,
  winnerOutcomeLabel,
  type SportMatch,
  type SportTab,
} from "@/lib/match-fixtures";
import { applyPublishedBracketAdvancement } from "@/lib/match-brackets";
import {
  createEmptyMatchResults,
  getWinnerSide,
  hasPenaltyShootout,
  isPublishedResult,
  parseMatchResults,
  type MatchResult,
  type MatchResultsData,
} from "@/lib/match-results";
import {
  createEmptyScoresheetData,
  fixtureShowsScoresheetResults,
  getFamilyPlacementsForEvent,
  getScoresheetEventForFixture,
  parseScoresheetData,
  type FamilyPlacement,
  type ScoresheetData,
} from "@/lib/scoresheet";
import GradedEventStandings from "@/components/competitions/GradedEventStandings";
import { createClient } from "@/lib/supabase/client";

const SportIcon = ({ sport }: { sport: SportTab }) => {
  const cls = "h-3.5 w-3.5 shrink-0";
  if (sport === "Football") return <FaFutbol className={cls} />;
  if (sport === "Volleyball") return <FaVolleyballBall className={cls} />;
  if (sport === "Table Tennis") return <FaTableTennis className={cls} />;
  if (sport === "Track Events") return <FaRunning className={cls} />;
  if (sport === "Chess") return <FaChess className={cls} />;
  if (sport === "Scrabble") return <FaFont className={cls} />;
  return <FaFutbol className={cls} />;
};

export default function SportsPage() {
  const [activeTab, setActiveTab] = useState<SportTab>("Football");
  const [rosterFamily, setRosterFamily] = useState<CompetitionFamily>("Virtue");
  const [isClient, setIsClient] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [results, setResults] = useState<MatchResultsData>(
    createEmptyMatchResults(),
  );
  const [scoresheet, setScoresheet] = useState<ScoresheetData>(
    createEmptyScoresheetData(),
  );
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

    async function fetchResults() {
      try {
        const { data, error } = await supabase
          .from("match_results")
          .select("data")
          .eq("id", "current")
          .maybeSingle();

        if (data && !error) {
          setResults(parseMatchResults(data.data));
        }
      } catch (err) {
        console.error("Match results fetch error:", err);
      }
    }

    async function fetchScoresheet() {
      try {
        const { data, error } = await supabase
          .from("scoresheet")
          .select("data")
          .eq("id", "current")
          .maybeSingle();

        if (data && !error) {
          setScoresheet(parseScoresheetData(data.data));
        }
      } catch (err) {
        console.error("Scoresheet fetch error:", err);
      }
    }

    fetchResults();
    fetchScoresheet();

    const matchChannel = supabase
      .channel("public:match_results")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "match_results",
          filter: "id=eq.current",
        },
        (payload) => {
          if (payload.new && (payload.new as { data?: unknown }).data) {
            setResults(
              parseMatchResults((payload.new as { data: unknown }).data),
            );
          }
        },
      )
      .subscribe();

    const scoresheetChannel = supabase
      .channel("public:scoresheet:sports")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "scoresheet",
          filter: "id=eq.current",
        },
        (payload) => {
          if (payload.new && (payload.new as { data?: unknown }).data) {
            setScoresheet(
              parseScoresheetData((payload.new as { data: unknown }).data),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(matchChannel);
      supabase.removeChannel(scoresheetChannel);
    };
  }, [router, supabase]);

  const handleTabChange = (sport: SportTab) => {
    setActiveTab(sport);
    setRosterFamily("Virtue");
  };

  const filteredMatches = applyPublishedBracketAdvancement(
    SPORT_MATCHES.filter((m) => m.type === activeTab),
    results,
  );

  const groupedMatches = filteredMatches.reduce(
    (acc, match) => {
      if (!acc[match.date]) acc[match.date] = [];
      acc[match.date].push(match);
      return acc;
    },
    {} as Record<string, SportMatch[]>,
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
        <CompetitionBackButton />

        <header className="mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-400 dark:text-zinc-500 mb-2">
            Official Schedule
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-[-0.03em] leading-none">
            Sports Arena
          </h1>
          <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-2 font-medium">
            Tournament Preliminaries &amp; Grand Finals
          </p>
        </header>

        <div className="flex flex-wrap items-center gap-2 mb-8">
          {SPORT_TABS.map((sport) => (
            <button
              key={sport}
              onClick={() => handleTabChange(sport)}
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

        <div className="mb-8 space-y-6">
          <EventInfoCard eventName={activeTab} />
          <EventRosterPanel
            eventName={activeTab}
            selectedFamily={rosterFamily}
            onFamilyChange={setRosterFamily}
          />
        </div>

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
                    <MatchCard
                      key={match.id}
                      match={match}
                      result={results[match.id]}
                      placements={getGradedPlacements(match, scoresheet)}
                      onFocusFamily={setRosterFamily}
                    />
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

function MatchGenderIcon({ gender }: { gender?: "male" | "female" | "mixed" }) {
  if (gender === "male")
    return <IoMaleSharp className="ml-1.5 h-3.5 w-3.5 text-blue-500" />;
  if (gender === "female")
    return <IoFemaleSharp className="ml-1.5 h-3.5 w-3.5 text-pink-500" />;
  if (gender === "mixed")
    return <IoMaleFemaleSharp className="ml-1.5 h-3.5 w-3.5 text-purple-500" />;
  return null;
}

function getGradedPlacements(
  match: SportMatch,
  scoresheet: ScoresheetData,
): FamilyPlacement[] {
  if (!fixtureShowsScoresheetResults(match)) return [];
  const ref = getScoresheetEventForFixture(match);
  if (!ref) return [];
  return getFamilyPlacementsForEvent(
    scoresheet.scores,
    ref.category,
    ref.event,
  );
}

function MatchCard({
  match,
  result,
  placements = [],
  onFocusFamily,
}: {
  match: SportMatch;
  result?: MatchResult;
  placements?: FamilyPlacement[];
  onFocusFamily: (family: CompetitionFamily) => void;
}) {
  const published = isPublishedResult(result);
  const winnerMode = isWinnerMode(match.type);
  const winnerSide = published ? getWinnerSide(result) : null;
  const winnerName =
    winnerSide === "A"
      ? match.teamA
      : winnerSide === "B"
        ? match.teamB
        : undefined;
  const cardClass = `
    group block bg-white dark:bg-zinc-900
    border border-zinc-200 dark:border-zinc-800
    rounded-2xl px-6 py-5
    transition-all duration-200
    ${match.isFinal ? "border-(--primary-gold)/30 dark:border-(--primary-gold)/20" : ""}
  `;

  const inner = match.isGraded ? (
    <>
      <div className="flex items-center justify-between mb-4">
        <span
          className={`flex items-center text-[10px] font-black uppercase tracking-[0.16em] ${match.isFinal ? "text-(--primary-gold)" : "text-zinc-400 dark:text-zinc-500"}`}
        >
          {match.round}
          <MatchGenderIcon gender={match.gender} />
        </span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <AllFamiliesRosterButtons
          eventName={match.type}
          onOpen={onFocusFamily}
        />

        <div className="flex items-center gap-1.5 shrink-0">
          <Clock className="h-3 w-3 text-(--primary-gold)" />
          <span className="text-xs font-black text-(--primary-gold)">
            {match.time}
          </span>
        </div>
      </div>

      <GradedEventStandings
        placements={placements}
        onFocusFamily={onFocusFamily}
      />
    </>
  ) : (
    <>
      <div className="flex items-center justify-between mb-4">
        <span
          className={`flex items-center text-[10px] font-black uppercase tracking-[0.16em] ${match.isFinal ? "text-(--primary-gold)" : "text-zinc-400 dark:text-zinc-500"}`}
        >
          {match.round}
          <MatchGenderIcon gender={match.gender} />
        </span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <FamilyTeamButton
          name={match.teamA}
          eventName={match.type}
          onOpen={onFocusFamily}
        />

        <div className="flex flex-col items-center shrink-0">
          {match.time ? (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-(--primary-gold)" />
              <span className="text-xs font-black text-(--primary-gold)">
                {match.time}
              </span>
            </div>
          ) : null}
          {published && winnerMode && winnerName ? (
            <div className="mt-0.5 flex flex-col items-center max-w-[7.5rem]">
              <span className="text-[10px] font-black uppercase tracking-[0.12em] text-(--primary-gold) text-center leading-tight">
                {winnerOutcomeLabel(match.round)}
              </span>
              <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 text-center truncate w-full">
                {winnerName}
              </span>
            </div>
          ) : published ? (
            <div className="mt-0.5 flex flex-col items-center">
              <span className="text-base font-black tabular-nums tracking-tight text-zinc-900 dark:text-zinc-100">
                {result.scoreA} – {result.scoreB}
              </span>
              {hasPenaltyShootout(result) ? (
                <span className="text-[9px] font-black uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">
                  {result.penaltyA}–{result.penaltyB} pens
                </span>
              ) : null}
            </div>
          ) : (
            <span className="text-[9px] font-black text-zinc-300 dark:text-zinc-600 tracking-[0.14em] mt-0.5">
              VS
            </span>
          )}
        </div>

        <FamilyTeamButton
          name={match.teamB}
          eventName={match.type}
          align="right"
          onOpen={onFocusFamily}
        />
      </div>
    </>
  );

  return <div className={cardClass}>{inner}</div>;
}
