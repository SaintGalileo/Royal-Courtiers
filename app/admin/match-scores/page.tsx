"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, RefreshCw, Save } from "lucide-react";
import { IoMaleSharp, IoFemaleSharp, IoMaleFemaleSharp } from "react-icons/io5";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  SCOREABLE_EVENT_TABS,
  getScoreableFixtures,
  getScoringMode,
  isWinnerMode,
  scoringModeLabel,
  winnerOutcomeLabel,
  type ScoreableEventTab,
  type ScoreableFixture,
} from "@/lib/match-fixtures";
import {
  clearMatchResult,
  createEmptyMatchResults,
  getMatchResult,
  getWinnerSide,
  hasDecisiveWinner,
  parseMatchResults,
  resultFromWinner,
  serializeMatchResults,
  setMatchResult,
  type MatchResult,
  type MatchResultsData,
  type MatchResultStatus,
  type WinnerSide,
} from "@/lib/match-results";

function GenderIcon({ gender }: { gender?: "male" | "female" | "mixed" }) {
  if (gender === "male")
    return <IoMaleSharp className="h-3.5 w-3.5 text-blue-500" />;
  if (gender === "female")
    return <IoFemaleSharp className="h-3.5 w-3.5 text-pink-500" />;
  if (gender === "mixed")
    return <IoMaleFemaleSharp className="h-3.5 w-3.5 text-purple-500" />;
  return null;
}

function ScoreNumberInput({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (n: number) => void;
  label: string;
}) {
  return (
    <label className="flex flex-col items-center gap-1">
      <span className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-400">
        {label}
      </span>
      <input
        type="number"
        min={0}
        inputMode="numeric"
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          onChange(Number.isFinite(n) && n >= 0 ? n : 0);
        }}
        className="w-16 rounded-lg border border-zinc-200 bg-white px-2 py-2 text-center text-lg font-black tabular-nums text-zinc-900 outline-none focus:border-(--primary-gold) dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
      />
    </label>
  );
}

function WinnerPickButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-0 flex-1 rounded-xl border px-4 py-3 text-left transition-all ${
        selected
          ? "border-(--primary-gold) bg-(--primary-gold)/10 shadow-sm"
          : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:border-zinc-600"
      }`}
    >
      <p
        className={`truncate text-sm font-black ${
          selected
            ? "text-(--primary-gold)"
            : "text-zinc-900 dark:text-zinc-100"
        }`}
      >
        {label}
      </p>
      <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-400">
        {selected ? "Selected" : "Tap to select"}
      </p>
    </button>
  );
}

function MatchScoreEditor({
  fixture,
  results,
  onChange,
}: {
  fixture: ScoreableFixture;
  results: MatchResultsData;
  onChange: (updater: (prev: MatchResultsData) => MatchResultsData) => void;
}) {
  const mode = getScoringMode(fixture.type)!;
  const winnerMode = isWinnerMode(fixture.type);
  const existing = getMatchResult(results, fixture.id);
  const scoreA = existing?.scoreA ?? 0;
  const scoreB = existing?.scoreB ?? 0;
  const penaltyA = existing?.penaltyA ?? 0;
  const penaltyB = existing?.penaltyB ?? 0;
  const status: MatchResultStatus = existing?.status ?? "pending";
  const hasEntry = Boolean(existing);
  const isFootball = fixture.type === "Football";
  const isDraw = scoreA === scoreB;
  const showPenalties = isFootball && isDraw;
  const hasWinner = existing
    ? hasDecisiveWinner(existing, isFootball)
    : false;
  const winnerSide = existing ? getWinnerSide(existing) : null;
  const outcome = winnerOutcomeLabel(fixture.round);

  const commit = (partial: Partial<MatchResult>) => {
    onChange((prev) => {
      const current = getMatchResult(prev, fixture.id);
      const nextA = partial.scoreA ?? current?.scoreA ?? 0;
      const nextB = partial.scoreB ?? current?.scoreB ?? 0;
      const nextStatus = partial.status ?? current?.status ?? "pending";
      const next: MatchResult = {
        scoreA: nextA,
        scoreB: nextB,
        status: nextStatus,
      };
      if (fixture.type === "Football" && nextA === nextB) {
        const pensTouched =
          "penaltyA" in partial ||
          "penaltyB" in partial ||
          (current?.penaltyA !== undefined && current?.penaltyB !== undefined);
        if (pensTouched) {
          next.penaltyA = partial.penaltyA ?? current?.penaltyA ?? 0;
          next.penaltyB = partial.penaltyB ?? current?.penaltyB ?? 0;
        }
      }

      const allowPens = fixture.type === "Football";
      const wasDecisive = current
        ? hasDecisiveWinner(current, allowPens)
        : false;
      const nowDecisive = hasDecisiveWinner(next, allowPens);

      // Auto-publish when a score first becomes decisive (same as winner-mode events).
      if (partial.status === undefined && nowDecisive && !wasDecisive) {
        next.status = "final";
      }

      if (next.status === "final" && !nowDecisive) {
        next.status = "pending";
      }
      return setMatchResult(prev, fixture.id, next);
    });
  };

  const pickWinner = (side: WinnerSide) => {
    onChange((prev) =>
      setMatchResult(prev, fixture.id, resultFromWinner(side, "final")),
    );
  };

  return (
    <div
      className={`rounded-2xl border bg-white px-5 py-5 dark:bg-zinc-900 ${
        fixture.isFinal
          ? "border-(--primary-gold)/30 dark:border-(--primary-gold)/20"
          : "border-zinc-200 dark:border-zinc-800"
      }`}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-black uppercase tracking-[0.16em] ${
              fixture.isFinal
                ? "text-(--primary-gold)"
                : "text-zinc-400 dark:text-zinc-500"
            }`}
          >
            {fixture.round}
          </span>
          <GenderIcon gender={fixture.gender} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
          {scoringModeLabel(mode)} · {fixture.date}
          {fixture.time ? ` · ${fixture.time}` : ""}
        </span>
      </div>

      {fixture.topic && (
        <p className="mb-4 border-l-2 border-(--primary-gold)/40 pl-3 text-sm font-medium leading-relaxed text-zinc-600 dark:text-zinc-400">
          {fixture.topic}
        </p>
      )}

      {winnerMode ? (
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">
            Who{" "}
            {outcome.toLowerCase() === "champion"
              ? "is champion"
              : outcome.toLowerCase()}
            ?
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <WinnerPickButton
              label={fixture.teamA ?? "Team A"}
              selected={winnerSide === "A"}
              onClick={() => pickWinner("A")}
            />
            <WinnerPickButton
              label={fixture.teamB ?? "Team B"}
              selected={winnerSide === "B"}
              onClick={() => pickWinner("B")}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black text-zinc-900 dark:text-zinc-100">
              {fixture.teamA}
            </p>
          </div>

          <div className="flex items-end gap-4">
            <ScoreNumberInput
              label={fixture.teamA ?? "A"}
              value={scoreA}
              onChange={(n) => commit({ scoreA: n })}
            />
            <span className="pb-2 text-xs font-black text-zinc-300 dark:text-zinc-600">
              –
            </span>
            <ScoreNumberInput
              label={fixture.teamB ?? "B"}
              value={scoreB}
              onChange={(n) => commit({ scoreB: n })}
            />
          </div>

          <div className="min-w-0 flex-1 text-right">
            <p className="truncate text-sm font-black text-zinc-900 dark:text-zinc-100">
              {fixture.teamB}
            </p>
          </div>
        </div>
      )}

      {showPenalties && (
        <div className="mt-4 rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-zinc-700 dark:bg-zinc-950/60">
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">
            Penalty shootout (tiebreaker)
          </p>
          <div className="flex flex-wrap items-end justify-center gap-4">
            <ScoreNumberInput
              label={`${fixture.teamA ?? "A"} pens`}
              value={penaltyA}
              onChange={(n) => commit({ penaltyA: n, penaltyB })}
            />
            <span className="pb-2 text-xs font-black text-zinc-300 dark:text-zinc-600">
              –
            </span>
            <ScoreNumberInput
              label={`${fixture.teamB ?? "B"} pens`}
              value={penaltyB}
              onChange={(n) => commit({ penaltyA, penaltyB: n })}
            />
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
        {!winnerMode && (
          <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={status === "final"}
              disabled={!hasWinner}
              onChange={(e) =>
                commit({ status: e.target.checked ? "final" : "pending" })
              }
              className="h-4 w-4 rounded border-zinc-300 text-(--primary-gold) focus:ring-(--primary-gold) disabled:cursor-not-allowed disabled:opacity-50"
            />
            Publish on schedule (Final)
          </label>
        )}

        {hasEntry && (
          <button
            type="button"
            onClick={() =>
              onChange((prev) => clearMatchResult(prev, fixture.id))
            }
            className="text-xs font-bold text-red-500 hover:text-red-600"
          >
            Clear
          </button>
        )}

        {winnerMode && !hasEntry && (
          <span className="text-[10px] font-medium text-zinc-400">
            Select a winner, then Save to publish
          </span>
        )}
        {winnerMode && hasEntry && status === "final" && (
          <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
            Will publish on Save · {outcome}
          </span>
        )}
        {!winnerMode && !hasEntry && (
          <span className="text-[10px] font-medium text-zinc-400">
            No score entered yet
          </span>
        )}
        {!winnerMode && hasEntry && !hasWinner && (
          <span className="text-[10px] font-bold text-red-500">
            A winner is required to publish
            {isFootball && isDraw
              ? " — enter unequal penalty scores"
              : " — tied scores cannot be published"}
            .
          </span>
        )}
        {!winnerMode && hasEntry && hasWinner && status === "pending" && (
          <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
            Draft — saved on Save, but not shown publicly until published
          </span>
        )}
        {!winnerMode && hasEntry && status === "final" && (
          <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
            Live on public schedule
          </span>
        )}
      </div>
    </div>
  );
}

export default function AdminMatchScoresPage() {
  const [activeTab, setActiveTab] = useState<ScoreableEventTab>("Football");
  const [results, setResults] = useState<MatchResultsData>(
    createEmptyMatchResults(),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const supabase = useMemo(() => createClient(), []);
  const resultsRef = useRef(results);
  resultsRef.current = results;

  const fixtures = useMemo(
    () => getScoreableFixtures(activeTab, results),
    [activeTab, results],
  );

  const fetchResults = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("match_results")
        .select("data")
        .eq("id", "current")
        .maybeSingle();

      if (error) {
        console.error(error);
        toast.error(
          `Failed to load match results: ${error.message}. Existing edits were kept.`,
        );
        return;
      }

      if (data) {
        setResults(parseMatchResults(data.data));
      } else {
        setResults(createEmptyMatchResults());
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load match results. Existing edits were kept.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchResults();
    // Initial load only; fetchResults closes over supabase from mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  const handleSave = async () => {
    const latest = resultsRef.current;
    const allFixtures = getScoreableFixtures(undefined, latest);
    const invalidEntry = Object.entries(latest).find(([matchId, result]) => {
      if (result.status !== "final") return false;
      const fixture = allFixtures.find((item) => item.id === matchId);
      return !hasDecisiveWinner(result, fixture?.type === "Football");
    });

    if (invalidEntry) {
      const fixture = allFixtures.find((item) => item.id === invalidEntry[0]);
      toast.error(
        fixture
          ? `${fixture.type} · ${fixture.round} must have a winner before published scores can be saved.`
          : "Every published match must have a winner.",
      );
      return;
    }

    setIsSaving(true);
    try {
      const payload = serializeMatchResults(latest);
      const updatedAt = new Date().toISOString();

      // Prefer UPDATE + select so we can detect silent RLS / 0-row writes.
      let { data: written, error } = await supabase
        .from("match_results")
        .update({ data: payload, updated_at: updatedAt })
        .eq("id", "current")
        .select("data")
        .maybeSingle();

      if (!error && !written) {
        const inserted = await supabase
          .from("match_results")
          .insert({ id: "current", data: payload, updated_at: updatedAt })
          .select("data")
          .maybeSingle();
        written = inserted.data;
        error = inserted.error;
      }

      if (error) {
        console.error(error);
        toast.error(
          `Failed to save: ${error.message}. If this mentions permissions or a missing table, run match-results-schema.sql in the Supabase SQL Editor.`,
        );
        return;
      }

      if (!written) {
        toast.error(
          "Save did not persist (no row returned). Check Supabase RLS policies for match_results.",
        );
        return;
      }

      const confirmed = parseMatchResults(written.data);
      setResults(confirmed);
      resultsRef.current = confirmed;

      const confirmedPublished = Object.values(confirmed).filter(
        (result) => result.status === "final",
      ).length;
      const confirmedDrafts = Object.keys(confirmed).length - confirmedPublished;

      if (confirmedPublished === 0 && confirmedDrafts > 0) {
        toast.success(
          `Saved ${confirmedDrafts} draft${confirmedDrafts === 1 ? "" : "s"}. Check “Publish on schedule” to show scores publicly.`,
        );
      } else if (confirmedDrafts > 0) {
        toast.success(
          `Saved ${confirmedPublished} published and ${confirmedDrafts} draft result${confirmedDrafts === 1 ? "" : "s"}.`,
        );
      } else {
        toast.success(
          confirmedPublished > 0
            ? `Saved ${confirmedPublished} published result${confirmedPublished === 1 ? "" : "s"}.`
            : "Match scores saved.",
        );
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("An unexpected error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
            Match Scores
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Enter live results — all scores are saved. Only published results
            appear on Sports Arena and Extracurriculars. Chess, Scrabble, and
            Debate use a winner pick.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchResults}
            disabled={isLoading || isSaving}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            Reload
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading || isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-(--primary-gold) px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {SCOREABLE_EVENT_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-xl border px-4 py-2 text-[11px] font-bold whitespace-nowrap transition-all ${
              activeTab === tab
                ? "border-(--primary-gold) bg-(--primary-gold) text-white shadow-sm"
                : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-(--primary-gold)" />
        </div>
      ) : (
        <div className="grid gap-4">
          {fixtures.map((fixture) => (
            <MatchScoreEditor
              key={fixture.id}
              fixture={fixture}
              results={results}
              onChange={setResults}
            />
          ))}
          {fixtures.length === 0 && (
            <p className="rounded-2xl border border-dashed border-zinc-200 py-10 text-center text-sm text-zinc-400 dark:border-zinc-800">
              No scoreable fixtures for this event.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
