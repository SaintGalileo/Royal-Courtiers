"use client";

import {
  FAMILY_STYLES,
  type CompetitionFamily,
} from "@/lib/competitions";
import { FAMILY_ICONS } from "@/components/competitions/FamilyBadge";
import {
  formatPlacementLabel,
  type FamilyPlacement,
} from "@/lib/scoresheet";

function focusRosterPanel() {
  document
    .getElementById("event-roster-panel")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Ordered 1st–4th standings from the family scoresheet for a graded fixture. */
export default function GradedEventStandings({
  placements,
  onFocusFamily,
}: {
  placements: FamilyPlacement[];
  onFocusFamily?: (family: CompetitionFamily) => void;
}) {
  if (placements.length === 0) return null;

  return (
    <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
      <p className="mb-2.5 text-[9px] font-black uppercase tracking-[0.18em] text-(--primary-gold)">
        Results
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {placements.map((entry) => {
          const style = FAMILY_STYLES[entry.family];
          const Icon = FAMILY_ICONS[entry.family];
          const canOpen = Boolean(onFocusFamily);

          const content = (
            <>
              <span className="text-[9px] font-black uppercase tracking-[0.14em] text-(--primary-gold)">
                {formatPlacementLabel(entry.position)}
              </span>
              <span className="flex items-center gap-1.5">
                <Icon className={`h-3.5 w-3.5 shrink-0 ${style.textColor}`} />
                <span
                  className={`truncate text-xs font-black uppercase tracking-tight ${style.textColor}`}
                >
                  {entry.family}
                </span>
              </span>
              <span className="text-[10px] font-bold tabular-nums text-zinc-400">
                {entry.points} pts
              </span>
            </>
          );

          const className = `flex flex-col gap-1 rounded-xl border px-3 py-2.5 ${style.bgColor} ${style.borderColor}`;

          if (!canOpen) {
            return (
              <div key={entry.family} className={className}>
                {content}
              </div>
            );
          }

          return (
            <button
              key={entry.family}
              type="button"
              onClick={() => {
                onFocusFamily?.(entry.family);
                focusRosterPanel();
              }}
              aria-label={`View ${entry.family} lineup · ${formatPlacementLabel(entry.position)}`}
              className={`${className} text-left transition-transform hover:scale-[1.02] active:scale-[0.98]`}
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}
