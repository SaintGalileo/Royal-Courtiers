import {
  FAMILY_STYLES,
  isCompetitionFamily,
  type CompetitionFamily,
} from "@/lib/competitions";

export function FamilyBadge({ family }: { family: CompetitionFamily }) {
  const style = FAMILY_STYLES[family];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-black uppercase tracking-tight ${style.bgColor} ${style.borderColor} ${style.textColor}`}
    >
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-md border text-[10px] font-black ${style.borderColor} ${style.bgColor}`}
      >
        {style.initial}
      </span>
      {family}
    </span>
  );
}

export function FamilyShield({ name }: { name?: string }) {
  if (!name || !isCompetitionFamily(name)) {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-xs font-black text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500">
        ?
      </div>
    );
  }

  const style = FAMILY_STYLES[name];
  return (
    <div
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-black ${style.bgColor} ${style.borderColor} ${style.textColor}`}
    >
      {style.initial}
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
