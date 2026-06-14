"use client";

import { useState } from "react";
import {
  CHORAL_GRAND_FINALE_NOTE,
  getEventInfo,
  getEventPoints,
  hasSemiFinalDraw,
  PAGEANTRY_GRAND_FINALE_NOTE,
  SCORING_PLACEMENTS,
  SEMI_FINAL_DRAWS,
  SUBMISSION_DEADLINE,
  type EventName,
  type EventPointsInfo,
} from "@/lib/competitions";
import { ChevronDown, Star, Trophy } from "lucide-react";

type EventInfoCardProps = {
  eventName: EventName | string;
  showGrandFinaleNote?: boolean;
  defaultOpen?: boolean;
};

function formatPointsHeadline(points: EventPointsInfo): string {
  if (points.unit === "total") {
    return `${points.maxPoints} pts`;
  }
  return `${points.maxPoints} pts ${points.unit}`;
}

function SemiFinalDrawSummary({ eventName }: { eventName: string }) {
  const draws = SEMI_FINAL_DRAWS[eventName];
  if (!draws) return null;

  return (
    <div className="mt-4 border-t border-zinc-200 dark:border-zinc-800 pt-3">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500 mb-2">
        Semi-Final Draw
      </p>
      <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
        <p>
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">
            Match 1:
          </span>{" "}
          {draws.sf1[0]} vs {draws.sf1[1]}
        </p>
        <p>
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">
            Match 2:
          </span>{" "}
          {draws.sf2[0]} vs {draws.sf2[1]}
        </p>
        <p className="text-zinc-400 dark:text-zinc-500 pt-1">
          Winners of each match advance to the final. Losers play for 3rd place.
        </p>
      </div>
    </div>
  );
}

function PointsBlock({ points }: { points: EventPointsInfo }) {
  return (
    <div className="rounded-lg border-2 border-(--primary-gold)/35 bg-(--primary-gold)/5 px-3.5 py-3">
      <div className="flex items-start gap-2.5">
        <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-(--primary-gold)" />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-(--primary-gold)">
            Points Allocation
          </p>
          <p className="mt-1 text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-100">
            {formatPointsHeadline(points)}
            <span className="ml-1.5 text-xs font-bold text-zinc-500 dark:text-zinc-400">
              for 1st place
            </span>
          </p>
          <p className="mt-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            {SCORING_PLACEMENTS}
          </p>
          {points.breakdown && points.breakdown.length > 0 && (
            <ul className="mt-2 space-y-1 border-t border-(--primary-gold)/15 pt-2">
              {points.breakdown.map((line) => (
                <li
                  key={line}
                  className="text-xs font-medium text-zinc-600 dark:text-zinc-400"
                >
                  {line}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EventInfoCard({
  eventName,
  showGrandFinaleNote,
  defaultOpen = true,
}: EventInfoCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const info = getEventInfo(eventName);
  const points = getEventPoints(eventName);
  if (!info) return null;

  const choralFinale = showGrandFinaleNote ?? info.grandFinaleNote ?? false;
  const pageantryFinale = info.pageantryGrandFinaleNote ?? false;
  const showDraw = hasSemiFinalDraw(eventName as EventName);

  const finaleNote = choralFinale
    ? CHORAL_GRAND_FINALE_NOTE
    : pageantryFinale
      ? PAGEANTRY_GRAND_FINALE_NOTE
      : null;

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
        aria-expanded={isOpen}
      >
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
            Event Info
          </p>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
              {info.name}
            </p>
            {points && (
              <span className="text-xs font-black text-(--primary-gold)">
                {formatPointsHeadline(points)}
              </span>
            )}
          </div>
          {!isOpen && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
              {info.about}
            </p>
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 px-4 py-4 space-y-4">
          {points && <PointsBlock points={points} />}

          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {info.about}
          </p>

          {info.howItWorks.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500 mb-2">
                How It Works
              </p>
              <ul className="space-y-1.5">
                {info.howItWorks.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed"
                  >
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {info.registration.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500 mb-2">
                Registration
              </p>
              <ul className="space-y-1.5">
                {info.registration.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed"
                  >
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {info.formatNotes && info.formatNotes.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500 mb-2">
                Good to Know
              </p>
              <ul className="space-y-1.5">
                {info.formatNotes.map((item) => (
                  <li
                    key={item}
                    className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {showDraw && <SemiFinalDrawSummary eventName={eventName} />}

          {finaleNote && (
            <p className="flex items-start gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-3 text-xs font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <Star className="mt-0.5 h-3.5 w-3.5 shrink-0 text-(--primary-gold)" />
              {finaleNote}
            </p>
          )}

          <p className="border-t border-zinc-100 dark:border-zinc-800 pt-3 text-[11px] text-zinc-400 dark:text-zinc-500">
            Submit participant names on or before{" "}
            <span className="font-semibold text-zinc-500 dark:text-zinc-400">
              {SUBMISSION_DEADLINE}
            </span>
            .
          </p>
        </div>
      )}
    </div>
  );
}
