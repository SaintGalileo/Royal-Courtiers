"use client";

import { useState, useEffect, useMemo } from "react";
import { Clock, AlertCircle } from "lucide-react";
import { FaComments, FaPenFancy, FaCrown } from "react-icons/fa";
import { useRouter } from "next/navigation";
import EventInfoCard from "@/components/competitions/EventInfoCard";
import {
  FamilyTeamButton,
  AllFamiliesRosterButtons,
} from "@/components/competitions/FamilyTeamButton";
import { EventRosterPanel } from "@/components/competitions/EventRosterPanel";
import CompetitionBackButton from "@/components/competitions/CompetitionBackButton";
import PageantryCulturePanel from "@/components/competitions/PageantryCulturePanel";
import { type CompetitionFamily } from "@/lib/competitions";
import {
  EXTRACURRICULAR_MATCHES,
  EXTRACURRICULAR_TABS,
  isWinnerMode,
  winnerOutcomeLabel,
  type ExtracurricularMatch,
  type ExtracurricularTab,
} from "@/lib/match-fixtures";
import { applyPublishedBracketAdvancement } from "@/lib/match-brackets";
import {
  createEmptyMatchResults,
  getWinnerSide,
  isPublishedResult,
  parseMatchResults,
  type MatchResult,
  type MatchResultsData,
} from "@/lib/match-results";
import { createClient } from "@/lib/supabase/client";

const ExtracurricularIcon = ({ tab }: { tab: ExtracurricularTab }) => {
  const cls = "h-3.5 w-3.5 shrink-0";
  if (tab === "Debate") return <FaComments className={cls} />;
  if (tab === "Essay Writing") return <FaPenFancy className={cls} />;
  if (tab === "Pageantry") return <FaCrown className={cls} />;
  return <FaComments className={cls} />;
};

export default function ExtracurricularPage() {
  const [activeTab, setActiveTab] = useState<ExtracurricularTab>("Debate");
  const [rosterFamily, setRosterFamily] =
    useState<CompetitionFamily>("Virtue");
  const [isClient, setIsClient] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [results, setResults] = useState<MatchResultsData>(
    createEmptyMatchResults(),
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

    fetchResults();

    const channel = supabase
      .channel("public:match_results:extra")
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router, supabase]);

  const handleTabChange = (tab: ExtracurricularTab) => {
    setActiveTab(tab);
    setRosterFamily("Virtue");
  };

  const filteredMatches = applyPublishedBracketAdvancement(
    EXTRACURRICULAR_MATCHES.filter((m) => m.type === activeTab),
    results,
  );

  const groupedMatches = filteredMatches.reduce(
    (acc, match) => {
      if (!acc[match.date]) acc[match.date] = [];
      acc[match.date].push(match);
      return acc;
    },
    {} as Record<string, ExtracurricularMatch[]>,
  );

  const sortedDates = Object.keys(groupedMatches).sort((a, b) => {
    const months = ["July", "Aug"];
    const aMonth = months.findIndex((m) => a.includes(m));
    const bMonth = months.findIndex((m) => b.includes(m));
    if (aMonth !== bMonth) return aMonth - bMonth;
    return a.localeCompare(b);
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
            Extracurriculars
          </h1>
          <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-2 font-medium">
            Competitions &amp; Grand Finals
          </p>
        </header>

        <div className="flex flex-wrap items-center gap-2 mb-8">
          {EXTRACURRICULAR_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
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

        <div className="mb-8 space-y-6">
          <EventInfoCard eventName={activeTab} />
          {activeTab === "Pageantry" && <PageantryCulturePanel />}
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
                      : "Sessions"}
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

function MatchCard({
  match,
  result,
  onFocusFamily,
}: {
  match: ExtracurricularMatch;
  result?: MatchResult;
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
        <div className="flex items-center justify-between mb-4">
          <span
            className={`text-[10px] font-black uppercase tracking-[0.16em] ${match.isFinal ? "text-(--primary-gold)" : "text-zinc-400 dark:text-zinc-500"}`}
          >
            {match.round}
          </span>
          {match.info && (
            <span className="group/info relative cursor-help">
              <AlertCircle className="h-3.5 w-3.5 text-zinc-300 dark:text-zinc-600 hover:text-(--primary-gold) transition-colors" />
              <span className="pointer-events-none absolute bottom-full right-0 mb-2 w-52 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-[10px] font-medium text-zinc-500 dark:text-zinc-400 shadow-lg opacity-0 group-hover/info:opacity-100 group-hover/info:pointer-events-auto transition-opacity z-10">
                {match.info}
              </span>
            </span>
          )}
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
      <div className="flex items-center justify-between mb-4">
        <span
          className={`text-[10px] font-black uppercase tracking-[0.16em] ${match.isFinal ? "text-(--primary-gold)" : "text-zinc-400 dark:text-zinc-500"}`}
        >
          {match.round}
        </span>
      </div>

      {match.topic && (
        <p className="mb-4 text-sm font-medium leading-relaxed text-zinc-600 dark:text-zinc-400 border-l-2 border-(--primary-gold)/40 pl-3">
          {match.topic}
        </p>
      )}

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
    </div>
  );
}
