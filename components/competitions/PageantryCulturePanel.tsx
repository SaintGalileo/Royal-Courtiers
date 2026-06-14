import { FAMILY_CULTURES, type CompetitionFamily } from "@/lib/competitions";

const families = Object.keys(FAMILY_CULTURES) as CompetitionFamily[];

export default function PageantryCulturePanel() {
  return (
    <div className="mt-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3.5">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500 mb-3">
        Cultural Day Representation
      </p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 leading-relaxed">
        During Phase 2, each family showcases the Nigerian culture assigned to
        them — through dress, presentation, or performance.
      </p>
      <ul className="space-y-2">
        {families.map((family) => (
          <li
            key={family}
            className="flex items-baseline justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-2 last:border-0 last:pb-0 text-xs"
          >
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              {FAMILY_CULTURES[family].label}
            </span>
            <span className="text-right text-zinc-500 dark:text-zinc-400">
              {FAMILY_CULTURES[family].culture}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
