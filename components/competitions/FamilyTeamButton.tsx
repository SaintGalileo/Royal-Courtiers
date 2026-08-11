"use client";

import {
  COMPETITION_FAMILIES,
  FAMILY_STYLES,
  isCompetitionFamily,
  type CompetitionFamily,
} from "@/lib/competitions";
import { FAMILY_ICONS, FamilyShield } from "@/components/competitions/FamilyBadge";
import { getEventRoster } from "@/lib/competition-rosters";

function focusRosterPanel() {
  document
    .getElementById("event-roster-panel")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Clickable family chip (icon + name) that focuses the event roster panel family tab. */
export function FamilyTeamButton({
  name,
  eventName,
  align = "left",
  onOpen,
}: {
  name?: string;
  eventName: string;
  align?: "left" | "right";
  onOpen?: (family: CompetitionFamily) => void;
}) {
  const hasRoster = Boolean(getEventRoster(eventName));
  const isFamily = Boolean(name && isCompetitionFamily(name));
  const canOpen = hasRoster && isFamily && Boolean(onOpen);

  const content = (
    <>
      {align === "left" && <FamilyShield name={name} />}
      <span className="font-black text-sm text-zinc-700 dark:text-zinc-200 uppercase tracking-tight">
        {name}
      </span>
      {align === "right" && <FamilyShield name={name} />}
    </>
  );

  if (!canOpen) {
    return (
      <div
        className={`flex items-center gap-3 flex-1 ${align === "right" ? "justify-end" : ""}`}
      >
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        onOpen?.(name as CompetitionFamily);
        focusRosterPanel();
      }}
      aria-label={`View ${name} participants`}
      className={`flex items-center gap-3 flex-1 rounded-lg transition-opacity hover:opacity-80 active:opacity-70 ${align === "right" ? "justify-end text-right" : "text-left"}`}
    >
      {content}
    </button>
  );
}

/** Four family icons for open / graded events (e.g. "All Families"). */
export function AllFamiliesRosterButtons({
  eventName,
  onOpen,
}: {
  eventName: string;
  onOpen?: (family: CompetitionFamily) => void;
}) {
  const hasRoster = Boolean(getEventRoster(eventName));

  if (!hasRoster || !onOpen) {
    return (
      <div className="flex items-center gap-3 flex-1">
        <FamilyShield name="All Families" />
        <span className="font-black text-sm text-zinc-700 dark:text-zinc-200 uppercase tracking-tight">
          All Families
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-1 flex-wrap">
      {COMPETITION_FAMILIES.map((family) => {
        const style = FAMILY_STYLES[family];
        const Icon = FAMILY_ICONS[family];
        return (
          <button
            key={family}
            type="button"
            onClick={() => {
              onOpen(family);
              focusRosterPanel();
            }}
            aria-label={`View ${family} participants`}
            title={family}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-black uppercase tracking-tight transition-transform hover:scale-105 active:scale-95 ${style.bgColor} ${style.borderColor} ${style.textColor}`}
          >
            <Icon className="h-3.5 w-3.5" />
            {family}
          </button>
        );
      })}
    </div>
  );
}
