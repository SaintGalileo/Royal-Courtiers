"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import {
  fetchCompetitionRosters,
  getMergedOpenEventRoster,
  isChoralRosterEvent,
  isUnlimitedOpenRosterEvent,
  PARTICIPANTS_PENDING_NOTE,
  SINGING_COMPETITION_SLOTS,
  type RosterSlot,
} from "@/lib/competition-rosters";
import { createClient } from "@/lib/supabase/client";

export function OpenEventRosterPanel({ eventName }: { eventName: string }) {
  const isChoral = isChoralRosterEvent(eventName);
  const isUnlimited = isUnlimitedOpenRosterEvent(eventName);
  const isSinging = eventName === "Singing Competition";
  const isDuet = eventName === "Duet";
  const supabase = useMemo(() => createClient(), []);
  const [slots, setSlots] = useState<RosterSlot[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isChoral) {
      setSlots(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const data = await fetchCompetitionRosters(supabase);
        if (cancelled) return;
        const merged = getMergedOpenEventRoster(data, eventName);
        setSlots(merged ?? (isSinging ? SINGING_COMPETITION_SLOTS : []));
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setSlots(isSinging ? SINGING_COMPETITION_SLOTS : []);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [eventName, supabase, isChoral, isSinging]);

  if (!isChoral) return null;

  const displaySlots = slots ?? [];
  const hasPending =
    (isSinging || isDuet) &&
    displaySlots.some(
      (slot) => slot.name === "TBA" || slot.secondName === "TBA",
    );
  const isEmpty = !isSinging && displaySlots.length === 0;

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
          {isSinging
            ? "Singing Competition — Choirmasters (3 choirs)"
            : isDuet
              ? "Duet — Duos"
              : `${eventName} — Entrants`}
        </p>
      </div>

      <div className="px-5 py-5 sm:px-6">
        <div className="mb-4">
          <p className="text-sm font-black uppercase tracking-tight text-zinc-700 dark:text-zinc-200">
            Open to all
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            {isUnlimited
              ? `${displaySlots.length} ${isDuet ? "duo" : "entrant"}${displaySlots.length === 1 ? "" : "s"} · no limit`
              : `${displaySlots.length} choir${displaySlots.length === 1 ? "" : "s"}`}
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-(--primary-gold)" />
          </div>
        ) : isEmpty ? (
          <p className="py-6 text-center text-sm italic text-zinc-400">
            {PARTICIPANTS_PENDING_NOTE}
          </p>
        ) : (
          <AnimatePresence mode="wait">
            <motion.ul
              key={eventName}
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
              {displaySlots.map((slot, index) => {
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
                      {isDuet
                        ? `${slot.name} & ${slot.secondName ?? "TBA"}`
                        : slot.name}
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
