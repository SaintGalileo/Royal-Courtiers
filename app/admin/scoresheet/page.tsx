"use client";

import { useState, useEffect, useMemo } from "react";
import {
  RefreshCw,
  Save,
  Loader2,
  AlertTriangle,
  X,
  Flag,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  FAMILIES,
  CATEGORIES,
  CONDUCT_STARTING_POINTS,
  PENALTY_TYPES,
  ROSTER_SUBMISSION_DEADLINE,
  EVENT_PENALTY_TYPE_KEYS,
  type FamilyName,
  type ScoresheetData,
  createEmptyScoresheetData,
  getConductScore,
  getFamilyTotal,
  getMaxScore,
  getPenaltiesForCell,
  getPositionFromScore,
  hasFamilyPenalty,
  parseScoresheetData,
  scoreFromPosition,
  serializeScoresheetData,
  setEventPenaltyChecked,
  setFamilyPenaltyChecked,
} from "@/lib/scoresheet";

type PenaltyModalTarget = {
  category: string;
  event: string;
  family: FamilyName;
};

export default function AdminScoresheetPage() {
  const [scoresheet, setScoresheet] = useState<ScoresheetData>(
    createEmptyScoresheetData(),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [penaltyModal, setPenaltyModal] = useState<PenaltyModalTarget | null>(
    null,
  );
  const supabase = useMemo(() => createClient(), []);

  const { scores, penalties, familyPenalties } = scoresheet;

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
  }, [supabase]);

  const handlePositionChange = (
    category: string,
    event: string,
    family: string,
    value: string,
  ) => {
    const numValue = scoreFromPosition(value, getMaxScore(event));

    setScoresheet((prev) => {
      const currentEventScores = { ...prev.scores[category]?.[event] };

      if (numValue > 0) {
        Object.entries(currentEventScores).forEach(([fam, score]) => {
          if (fam !== family && score === numValue) {
            currentEventScores[fam] = 0;
            toast.info(
              `${fam}'s previous position was cleared to prevent a tie.`,
            );
          }
        });
      }

      currentEventScores[family] = numValue;

      return {
        ...prev,
        scores: {
          ...prev.scores,
          [category]: {
            ...prev.scores[category],
            [event]: currentEventScores,
          },
        },
      };
    });
  };

  const handleFamilyRosterPenalty = (family: FamilyName, checked: boolean) => {
    setScoresheet((prev) =>
      setFamilyPenaltyChecked(
        prev,
        family,
        "lateRosterSubmission",
        checked,
      ),
    );
  };

  const handleEventPenalty = (
    category: string,
    event: string,
    family: FamilyName,
    penaltyKey: (typeof EVENT_PENALTY_TYPE_KEYS)[number],
    checked: boolean,
  ) => {
    setScoresheet((prev) =>
      setEventPenaltyChecked(prev, category, event, family, penaltyKey, checked),
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = serializeScoresheetData(scoresheet);
      const { error } = await supabase
        .from("scoresheet")
        .upsert(
          {
            id: "current",
            data: payload,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        );

      if (error) {
        console.error(error);
        toast.error(
          "Failed to save scores. Ensure the 'scoresheet' table exists.",
        );
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

  const confirmReset = () => {
    setScoresheet(createEmptyScoresheetData());
    setPenaltyModal(null);
    setShowResetConfirm(false);
    toast.success("Scores reset. Click Save to persist changes.");
  };

  const modalPenalties = penaltyModal
    ? getPenaltiesForCell(
        penalties,
        penaltyModal.category,
        penaltyModal.event,
        penaltyModal.family,
      )
    : [];

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
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Official Scoresheet
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Update placements and record conduct penalties.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 transition-all hover:bg-red-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-red-400"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-xl bg-(--primary-gold) px-6 py-2.5 text-sm font-black text-white shadow-lg shadow-(--primary-gold)/20 transition-all hover:bg-(--primary-gold-hover) active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {FAMILIES.map((family) => {
          const total = getFamilyTotal(
            scores,
            penalties,
            familyPenalties,
            family,
          );
          const conduct = getConductScore(penalties, familyPenalties, family);
          return (
            <div
              key={family}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 text-center shadow-xs"
            >
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-1">
                {family}
              </h3>
              <p className="text-4xl font-black text-(--primary-gold) tracking-tighter">
                {total}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-1">
                Conduct: {conduct}/{CONDUCT_STARTING_POINTS}
              </p>
            </div>
          );
        })}
      </div>

      <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
          <h2 className="text-sm font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
            Conduct &amp; Discipline
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Each family starts with {CONDUCT_STARTING_POINTS} pts at flag-off.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed min-w-[640px]">
            <colgroup>
              <col className="w-[40%]" />
              <col className="w-[15%]" />
              <col className="w-[15%]" />
              <col className="w-[15%]" />
              <col className="w-[15%]" />
            </colgroup>
            <thead className="bg-zinc-50 dark:bg-zinc-950/50 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 text-left font-bold uppercase text-[10px] tracking-widest">
                  Item
                </th>
                {FAMILIES.map((family) => (
                  <th
                    key={family}
                    className="px-3 py-4 font-bold uppercase text-[10px] tracking-widest text-center"
                  >
                    {family}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              <tr>
                <td className="px-6 py-4 font-bold text-zinc-700 dark:text-zinc-300">
                  Net conduct score
                </td>
                {FAMILIES.map((family) => (
                  <td key={family} className="px-3 py-4 text-center">
                    <span className="font-black text-(--primary-gold)">
                      {getConductScore(penalties, familyPenalties, family)}
                    </span>
                    <span className="text-zinc-400 text-xs">
                      {" "}
                      / {CONDUCT_STARTING_POINTS}
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4">
                  <p className="font-bold text-zinc-700 dark:text-zinc-300">
                    Late roster submission
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-0.5 leading-snug">
                    Unified penalty — all participants due{" "}
                    {ROSTER_SUBMISSION_DEADLINE} ({PENALTY_TYPES.lateRosterSubmission.points}{" "}
                    pts)
                  </p>
                </td>
                {FAMILIES.map((family) => (
                  <td key={family} className="px-3 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={hasFamilyPenalty(
                        familyPenalties,
                        family,
                        "lateRosterSubmission",
                      )}
                      onChange={(e) =>
                        handleFamilyRosterPenalty(family, e.target.checked)
                      }
                      aria-label={`Late roster submission — ${family}`}
                      className="h-4 w-4 cursor-pointer accent-(--primary-gold)"
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

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
              <table className="w-full text-sm table-fixed min-w-[800px]">
                <colgroup>
                  <col className="w-[28%]" />
                  <col className="w-[18%]" />
                  <col className="w-[18%]" />
                  <col className="w-[18%]" />
                  <col className="w-[18%]" />
                </colgroup>
                <thead className="bg-zinc-50 dark:bg-zinc-950/50 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold uppercase text-[10px] tracking-widest">
                      Event
                    </th>
                    {FAMILIES.map((family) => (
                      <th
                        key={family}
                        className="px-2 py-4 font-bold uppercase text-[10px] tracking-widest text-center"
                      >
                        {family}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                  {events.map((event) => (
                    <tr key={event}>
                      <td className="px-6 py-4 font-bold text-zinc-700 dark:text-zinc-300 align-middle">
                        {event}
                      </td>
                      {FAMILIES.map((family) => {
                        const cellPenalties = getPenaltiesForCell(
                          penalties,
                          category,
                          event,
                          family,
                        );

                        return (
                          <td
                            key={family}
                            className="px-2 py-3 align-middle"
                          >
                            <div className="flex flex-col items-stretch gap-2 h-[4.25rem] justify-center">
                              <select
                                value={getPositionFromScore(
                                  scores[category]?.[event]?.[family] ?? 0,
                                  getMaxScore(event),
                                )}
                                onChange={(e) =>
                                  handlePositionChange(
                                    category,
                                    event,
                                    family,
                                    e.target.value,
                                  )
                                }
                                className="w-full h-9 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 text-center font-black text-(--primary-gold) outline-none focus:ring-2 focus:ring-(--primary-gold)/50 cursor-pointer text-sm"
                              >
                                <option value="">-</option>
                                <option value="1">1st</option>
                                <option value="2">2nd</option>
                                <option value="3">3rd</option>
                                <option value="4">4th</option>
                              </select>
                              <button
                                type="button"
                                onClick={() =>
                                  setPenaltyModal({
                                    category,
                                    event,
                                    family,
                                  })
                                }
                                className={`flex h-7 items-center justify-center gap-1 rounded-md border text-[9px] font-bold uppercase tracking-wider transition-colors ${
                                  cellPenalties.length > 0
                                    ? "border-red-200 bg-red-50 text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400"
                                    : "border-zinc-200 bg-zinc-50 text-zinc-500 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600"
                                }`}
                              >
                                <Flag className="h-3 w-3 shrink-0" />
                                {cellPenalties.length > 0
                                  ? `${cellPenalties.length} flag${cellPenalties.length > 1 ? "s" : ""}`
                                  : "Flags"}
                              </button>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>

      {penaltyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setPenaltyModal(null)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <button
              type="button"
              onClick={() => setPenaltyModal(null)}
              className="absolute right-3 top-3 rounded-full p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 pr-8">
              Event penalties
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              {penaltyModal.family} · {penaltyModal.event}
            </p>
            <ul className="mt-5 space-y-3">
              {EVENT_PENALTY_TYPE_KEYS.map((key) => {
                const { label, points, description } = PENALTY_TYPES[key];
                const checked = modalPenalties.includes(key);
                return (
                  <li key={key}>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={checked}
                      onClick={() =>
                        handleEventPenalty(
                          penaltyModal.category,
                          penaltyModal.event,
                          penaltyModal.family,
                          key,
                          !checked,
                        )
                      }
                      className={`w-full flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                        checked
                          ? "border-red-300 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20"
                          : "border-zinc-200 bg-zinc-50 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                          checked
                            ? "border-red-500 bg-red-500 text-white"
                            : "border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-800"
                        }`}
                      >
                        {checked && (
                          <span className="text-[10px] font-bold leading-none">
                            ✓
                          </span>
                        )}
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                          {label}{" "}
                          <span className="text-red-500">({points})</span>
                        </span>
                        <span className="block text-xs text-zinc-500 mt-0.5">
                          {description}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              onClick={() => setPenaltyModal(null)}
              className="mt-6 w-full rounded-xl bg-(--primary-gold) py-2.5 text-sm font-bold text-white"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setShowResetConfirm(false)}
          />
          <div className="relative w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-900/20">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Reset All Scores?
              </h2>
              <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                This will clear all competition placements and conduct
                penalties. Conduct returns to {CONDUCT_STARTING_POINTS} per
                family.
              </p>
              <div className="mt-8 flex w-full gap-3">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 rounded-xl border border-zinc-200 py-3 text-sm font-bold text-zinc-600 dark:border-zinc-800 dark:text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmReset}
                  className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-bold text-white"
                >
                  Yes, Reset All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
