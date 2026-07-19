"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import {
  FAMILY_STYLES,
  type CompetitionFamily,
} from "@/lib/competitions";
import {
  filterRosterSlots,
  getEventRoster,
  getRosterSubtitle,
  PARTICIPANTS_PENDING_NOTE,
  type RosterSlot,
} from "@/lib/competition-rosters";
import { FAMILY_ICONS } from "@/components/competitions/FamilyBadge";

function SlotRow({ slot }: { slot: RosterSlot }) {
  const isPending = slot.name === "TBA";
  return (
    <li className="flex items-baseline justify-between gap-4 py-1.5 text-sm">
      {slot.role && (
        <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
          {slot.role}
        </span>
      )}
      <span
        className={`min-w-0 text-right font-semibold ${
          isPending
            ? "text-zinc-400 dark:text-zinc-500"
            : "text-zinc-800 dark:text-zinc-200"
        }`}
      >
        {slot.name}
      </span>
    </li>
  );
}

export function FamilyRosterModal({
  family,
  eventName,
  round,
  gender,
  onClose,
}: {
  family: CompetitionFamily;
  eventName: string;
  round?: string;
  gender?: "male" | "female" | "mixed";
  onClose: () => void;
}) {
  const roster = getEventRoster(eventName);
  const slots = filterRosterSlots(roster?.[family] ?? [], {
    eventName,
    round,
    gender,
  });
  const style = FAMILY_STYLES[family];
  const Icon = FAMILY_ICONS[family];
  const subtitle = getRosterSubtitle(eventName, round, gender);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!roster) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative flex w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 max-h-[80vh]">
        <div
          className={`flex items-center justify-between gap-3 border-b px-5 py-4 ${style.borderColor} ${style.bgColor}`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${style.borderColor} bg-white/60 dark:bg-zinc-900/60 ${style.textColor}`}
            >
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p
                className={`text-sm font-black uppercase tracking-tight ${style.textColor}`}
              >
                Family of {family}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                {subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-zinc-500 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-3 custom-scrollbar">
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {slots.map((slot, index) => (
              <SlotRow key={`${slot.role ?? "slot"}-${index}`} slot={slot} />
            ))}
          </ul>
        </div>

        {slots.some((slot) => slot.name === "TBA") && (
          <p className="border-t border-zinc-100 px-5 py-3 text-[11px] text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
            {PARTICIPANTS_PENDING_NOTE}
          </p>
        )}
      </div>
    </div>
  );
}
