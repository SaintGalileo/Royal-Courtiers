import type { ComponentType } from "react";
import { GiPolarStar, GiWingedScepter, GiFruitTree } from "react-icons/gi";
import { FaBolt } from "react-icons/fa";
import {
  FAMILY_STYLES,
  isCompetitionFamily,
  type CompetitionFamily,
} from "@/lib/competitions";

type IconType = ComponentType<{ className?: string }>;

export const FAMILY_ICONS: Record<CompetitionFamily, IconType> = {
  Dominion: GiWingedScepter,
  Light: GiPolarStar,
  Power: FaBolt,
  Virtue: GiFruitTree,
};

export function FamilyBadge({ family }: { family: CompetitionFamily }) {
  const style = FAMILY_STYLES[family];
  const Icon = FAMILY_ICONS[family];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-black uppercase tracking-tight ${style.bgColor} ${style.borderColor} ${style.textColor}`}
    >
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-md border ${style.borderColor} ${style.bgColor}`}
      >
        <Icon className="h-3 w-3" />
      </span>
      {family}
    </span>
  );
}

export function FamilyShield({
  name,
  onClick,
}: {
  name?: string;
  onClick?: () => void;
}) {
  if (!name || !isCompetitionFamily(name)) {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-xs font-black text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500">
        ?
      </div>
    );
  }

  const style = FAMILY_STYLES[name];
  const Icon = FAMILY_ICONS[name];
  const className = `flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${style.bgColor} ${style.borderColor} ${style.textColor}`;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={`View ${name} participants`}
        className={`${className} transition-transform hover:scale-110 active:scale-95`}
      >
        <Icon className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div className={className}>
      <Icon className="h-4 w-4" />
    </div>
  );
}

export function DrawMatchupRow({
  label,
  teamA,
  teamB,
}: {
  label: string;
  teamA: CompetitionFamily;
  teamB: CompetitionFamily;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="w-8 shrink-0 text-[10px] font-black uppercase tracking-wider text-zinc-400">
        {label}
      </span>
      <div className="flex flex-1 items-center justify-center gap-2">
        <FamilyBadge family={teamA} />
        <span className="text-[10px] font-black text-zinc-300 dark:text-zinc-600">
          VS
        </span>
        <FamilyBadge family={teamB} />
      </div>
    </div>
  );
}
