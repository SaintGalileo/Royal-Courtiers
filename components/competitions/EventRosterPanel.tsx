"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { FAMILY_STYLES, type CompetitionFamily } from "@/lib/competitions";
import {
  ROSTER_FAMILIES,
  fetchCompetitionRosters,
  getEventRoster,
  getMergedEventRoster,
  getRosterSubtitle,
  PARTICIPANTS_PENDING_NOTE,
  type RosterSlot,
} from "@/lib/competition-rosters";
import { FAMILY_ICONS } from "@/components/competitions/FamilyBadge";
import { createClient } from "@/lib/supabase/client";

export function EventRosterPanel({
  eventName,
  selectedFamily,
  onFamilyChange,
}: {
  eventName: string;
  selectedFamily?: CompetitionFamily;
  onFamilyChange?: (family: CompetitionFamily) => void;
}) {
  const template = useMemo(() => getEventRoster(eventName), [eventName]);
  const supabase = useMemo(() => createClient(), []);
  const [slotsByFamily, setSlotsByFamily] = useState<Record<
    CompetitionFamily,
    RosterSlot[]
  > | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [internalFamily, setInternalFamily] =
    useState<CompetitionFamily>("Virtue");

  const activeFamily = selectedFamily ?? internalFamily;

  const setFamily = (family: CompetitionFamily) => {
    onFamilyChange?.(family);
    if (selectedFamily === undefined) {
      setInternalFamily(family);
    }
  };

  useEffect(() => {
    if (selectedFamily === undefined) {
      setInternalFamily("Virtue");
    }
  }, [eventName, selectedFamily]);

  useEffect(() => {
    if (!template) {
      setSlotsByFamily(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const data = await fetchCompetitionRosters(supabase);
        if (cancelled) return;
        const merged = getMergedEventRoster(data, eventName);
        setSlotsByFamily(merged ?? null);
      } catch (err) {
        console.error(err);
        if (!cancelled && template) setSlotsByFamily(template);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [eventName, supabase, template]);

  if (!template) return null;

  const style = FAMILY_STYLES[activeFamily];
  const Icon = FAMILY_ICONS[activeFamily];
  const slots = slotsByFamily?.[activeFamily] ?? template[activeFamily];
  const hasPending = slots.some((slot) => slot.name === "TBA");
  const subtitle = getRosterSubtitle(eventName);

  return (
    <section
      id="event-roster-panel"
      className="overflow-hidden rounded-2xl border border-(--primary-gold)/25 bg-gradient-to-b from-white via-white to-amber-50/40 shadow-sm dark:from-zinc-900 dark:via-zinc-900 dark:to-amber-950/20 dark:border-(--primary-gold)/20"
    >
      <div className="border-b border-(--primary-gold)/15 px-5 py-5 sm:px-6">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-(--primary-gold)">
          Lineups
        </p>
        <h2 className="mt-1 text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
          {eventName}
        </h2>
        <p className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {subtitle}
        </p>
      </div>

      <div className="flex gap-1.5 overflow-x-auto border-b border-zinc-100 px-3 py-3 dark:border-zinc-800 sm:px-4">
        {ROSTER_FAMILIES.map((family) => {
          const famStyle = FAMILY_STYLES[family];
          const FamIcon = FAMILY_ICONS[family];
          const isActive = activeFamily === family;
          return (
            <button
              key={family}
              type="button"
              onClick={() => setFamily(family)}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-tight transition-all ${
                isActive
                  ? `${famStyle.bgColor} ${famStyle.borderColor} ${famStyle.textColor} shadow-sm scale-[1.02]`
                  : "border-transparent bg-zinc-50 text-zinc-500 hover:border-zinc-200 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:border-zinc-700"
              }`}
            >
              <FamIcon className="h-3.5 w-3.5" />
              {family}
            </button>
          );
        })}
      </div>

      <div className={`relative px-5 py-5 sm:px-6 ${style.bgColor}`}>
        <div className="mb-4 flex items-center gap-3">
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-2xl border bg-white/70 dark:bg-zinc-950/50 ${style.borderColor} ${style.textColor}`}
          >
            <Icon className="h-6 w-6" />
          </span>
          <div>
            <p
              className={`text-sm font-black uppercase tracking-tight ${style.textColor}`}
            >
              Family of {activeFamily}
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {slots.length} participant{slots.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-(--primary-gold)" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.ul
              key={`${eventName}-${activeFamily}`}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: 6 }}
              variants={{
                hidden: {},
                show: {
                  transition: { staggerChildren: 0.045 },
                },
              }}
              className="space-y-1"
            >
              {slots.map((slot, index) => {
                const isPending = slot.name === "TBA";
                return (
                  <motion.li
                    key={`${slot.role ?? "slot"}-${index}`}
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      show: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                    className="flex items-baseline justify-between gap-4 border-b border-black/5 py-2.5 last:border-0 dark:border-white/5"
                  >
                    {slot.role && (
                      <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                        {slot.role}
                      </span>
                    )}
                    <span
                      className={`min-w-0 text-right text-base font-black tracking-tight sm:text-lg ${
                        isPending
                          ? "text-zinc-400/80 dark:text-zinc-600"
                          : "text-zinc-900 dark:text-zinc-50"
                      }`}
                    >
                      {slot.name}
                    </span>
                  </motion.li>
                );
              })}
            </motion.ul>
          </AnimatePresence>
        )}

        {hasPending && !isLoading && (
          <p className="mt-4 text-[11px] text-zinc-500 dark:text-zinc-500">
            {PARTICIPANTS_PENDING_NOTE}
          </p>
        )}
      </div>
    </section>
  );
}
