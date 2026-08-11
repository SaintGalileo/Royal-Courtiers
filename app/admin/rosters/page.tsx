"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  Save,
  Loader2,
  Plus,
  Trash2,
  AlertTriangle,
  Search,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  ALL_ROSTER_EVENT_NAMES,
  ROSTER_FAMILIES,
  createEmptyCompetitionRostersData,
  fetchCompetitionRosters,
  formatMemberDisplayName,
  isChoralRosterEvent,
  isUnlimitedOpenRosterEvent,
  parseCompetitionRostersData,
  serializeCompetitionRostersData,
  type CompetitionRostersData,
  type RosterSlotData,
  type SupplementaryEntry,
} from "@/lib/competition-rosters";
import type { CompetitionFamily, EventName } from "@/lib/competitions";
import { FAMILY_STYLES } from "@/lib/competitions";

type MemberOption = {
  id: string;
  first_name: string;
  last_name: string;
  nick_name: string;
  family: string;
  gender: string | null;
};

export default function AdminRostersPage() {
  const supabase = useMemo(() => createClient(), []);
  const [data, setData] = useState<CompetitionRostersData>(
    createEmptyCompetitionRostersData(),
  );
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [activeEvent, setActiveEvent] = useState<EventName>(
    ALL_ROSTER_EVENT_NAMES[0] ?? "Football",
  );
  const [activeFamily, setActiveFamily] =
    useState<CompetitionFamily>("Dominion");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [supplementaryDraft, setSupplementaryDraft] = useState("");
  const [openEntryDraft, setOpenEntryDraft] = useState("");
  const [duetDraft, setDuetDraft] = useState<RosterSlotData[]>([]);
  const [memberSearch, setMemberSearch] = useState("");

  const isChoral = isChoralRosterEvent(activeEvent);
  const isUnlimited = isUnlimitedOpenRosterEvent(activeEvent);
  const isSinging = activeEvent === "Singing Competition";
  const isDuet = activeEvent === "Duet";

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [rosters, membersResult] = await Promise.all([
        fetchCompetitionRosters(supabase),
        supabase
          .from("members")
          .select("id, first_name, last_name, nick_name, family, gender")
          .order("first_name", { ascending: true }),
      ]);

      setData(rosters);

      if (membersResult.error) {
        console.error(membersResult.error);
        toast.error("Failed to load members for the picker.");
      } else {
        setMembers((membersResult.data as MemberOption[]) ?? []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load rosters.");
      setData(createEmptyCompetitionRostersData());
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    setMemberSearch("");
    setOpenEntryDraft("");
    setDuetDraft([]);
    setSupplementaryDraft("");
  }, [activeEvent, activeFamily]);

  const familyMembers = useMemo(
    () =>
      members
        .filter((m) => m.family === activeFamily)
        .sort((a, b) =>
          formatMemberDisplayName(a).localeCompare(
            formatMemberDisplayName(b),
          ),
        ),
    [members, activeFamily],
  );

  const allMembersSorted = useMemo(
    () =>
      [...members].sort((a, b) =>
        formatMemberDisplayName(a).localeCompare(
          formatMemberDisplayName(b),
        ),
      ),
    [members],
  );

  const pickerMembers = isChoral ? allMembersSorted : familyMembers;

  const filteredPickerMembers = useMemo(() => {
    const query = memberSearch.trim().toLowerCase();
    if (!query) return pickerMembers;
    return pickerMembers.filter((m) => {
      const haystack =
        `${m.first_name} ${m.last_name} ${m.nick_name}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [pickerMembers, memberSearch]);

  const slots: RosterSlotData[] = useMemo(
    () =>
      isChoral
        ? (data.openRosters[activeEvent] ?? [])
        : (data.rosters[activeEvent]?.[activeFamily] ?? []),
    [activeEvent, activeFamily, data.openRosters, data.rosters, isChoral],
  );

  const assignedMemberIds = useMemo(() => {
    const ids = new Set<string>();
    for (const slot of slots) {
      if (slot.memberId) ids.add(slot.memberId);
      if (slot.secondMemberId) ids.add(slot.secondMemberId);
    }
    return ids;
  }, [slots]);

  const searchableMembers = useMemo(() => {
    const draftIds = new Set(
      duetDraft.map((entry) => entry.memberId).filter(Boolean),
    );
    return filteredPickerMembers.filter(
      (m) => !assignedMemberIds.has(m.id) && !draftIds.has(m.id),
    );
  }, [filteredPickerMembers, assignedMemberIds, duetDraft]);

  const supplementary: SupplementaryEntry[] =
    data.supplementary[activeEvent]?.[activeFamily] ?? [];

  const updateFamilySlot = (index: number, memberId: string) => {
    setData((prev) => {
      const next = parseCompetitionRostersData(prev);
      const eventRoster = next.rosters[activeEvent];
      if (!eventRoster) return prev;
      const familySlots = [...(eventRoster[activeFamily] ?? [])];
      const current = familySlots[index];
      if (!current) return prev;

      if (!memberId) {
        familySlots[index] = {
          ...current,
          name: "TBA",
          memberId: null,
        };
      } else {
        const member = members.find((m) => m.id === memberId);
        if (!member) return prev;
        familySlots[index] = {
          ...current,
          name: formatMemberDisplayName(member),
          memberId: member.id,
        };
      }

      eventRoster[activeFamily] = familySlots;
      next.rosters[activeEvent] = eventRoster;
      return next;
    });
  };

  const updateOpenSlot = (
    index: number,
    patch: { memberId?: string; name?: string; clear?: boolean },
  ) => {
    setData((prev) => {
      const next = parseCompetitionRostersData(prev);
      const list = [...(next.openRosters[activeEvent] ?? [])];
      const current = list[index];
      if (!current) return prev;

      if (patch.clear) {
        list[index] = {
          ...current,
          name: "TBA",
          memberId: null,
        };
      } else if (patch.memberId) {
        const member = members.find((m) => m.id === patch.memberId);
        if (!member) return prev;
        list[index] = {
          ...current,
          name: formatMemberDisplayName(member),
          memberId: member.id,
        };
      } else if (typeof patch.name === "string") {
        const trimmed = patch.name.trim();
        list[index] = {
          ...current,
          name: trimmed || "TBA",
          memberId: null,
        };
      }

      next.openRosters[activeEvent] = list;
      return next;
    });
  };

  const assignToNextOpenSlot = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;

    if (isDuet) {
      pushDuetDraft({
        name: formatMemberDisplayName(member),
        memberId: member.id,
      });
      setMemberSearch("");
      return;
    }

    if (isUnlimited) {
      addOpenEntry({
        name: formatMemberDisplayName(member),
        memberId: member.id,
      });
      setMemberSearch("");
      toast.success(`${formatMemberDisplayName(member)} added`);
      return;
    }

    const nextIndex = slots.findIndex(
      (slot) => !slot.memberId || slot.name === "TBA",
    );
    if (nextIndex === -1) {
      toast.error(
        isSinging
          ? "All 3 choir slots are filled."
          : "No open slots left for this family roster.",
      );
      return;
    }

    const roleLabel = slots[nextIndex]?.role ?? `Slot ${nextIndex + 1}`;
    if (isChoral) {
      updateOpenSlot(nextIndex, { memberId });
    } else {
      updateFamilySlot(nextIndex, memberId);
    }
    setMemberSearch("");
    toast.success(
      `${formatMemberDisplayName(member)} → ${roleLabel}`,
    );
  };

  const addOpenEntry = (entry: RosterSlotData) => {
    if (!entry.name.trim()) return;
    setData((prev) => {
      const next = parseCompetitionRostersData(prev);
      const list = [...(next.openRosters[activeEvent] ?? [])];
      list.push({
        role:
          entry.role ??
          `${activeEvent === "Duet" ? "Duo" : "Entrant"} ${list.length + 1}`,
        name: entry.name.trim(),
        memberId: entry.memberId ?? null,
        secondName: entry.secondName?.trim(),
        secondMemberId: entry.secondMemberId ?? null,
      });
      next.openRosters[activeEvent] = list;
      return next;
    });
  };

  const removeOpenEntry = (index: number) => {
    setData((prev) => {
      const next = parseCompetitionRostersData(prev);
      const list = [...(next.openRosters[activeEvent] ?? [])];
      list.splice(index, 1);
      next.openRosters[activeEvent] = list.map((slot, i) => ({
        ...slot,
        role:
          slot.role?.startsWith("Entrant ") || slot.role?.startsWith("Duo ")
            ? `${activeEvent === "Duet" ? "Duo" : "Entrant"} ${i + 1}`
            : slot.role,
      }));
      return next;
    });
  };

  const addSupplementary = (entry: SupplementaryEntry) => {
    if (!entry.name.trim()) return;
    setData((prev) => {
      const next = parseCompetitionRostersData(prev);
      const eventSupp =
        next.supplementary[activeEvent] ??
        (Object.fromEntries(
          ROSTER_FAMILIES.map((f) => [f, [] as SupplementaryEntry[]]),
        ) as Record<CompetitionFamily, SupplementaryEntry[]>);
      const list = [...(eventSupp[activeFamily] ?? [])];
      list.push({ name: entry.name.trim(), memberId: entry.memberId ?? null });
      eventSupp[activeFamily] = list;
      next.supplementary[activeEvent] = eventSupp;
      return next;
    });
  };

  const removeSupplementary = (index: number) => {
    setData((prev) => {
      const next = parseCompetitionRostersData(prev);
      const eventSupp = next.supplementary[activeEvent];
      if (!eventSupp) return prev;
      const list = [...(eventSupp[activeFamily] ?? [])];
      list.splice(index, 1);
      eventSupp[activeFamily] = list;
      next.supplementary[activeEvent] = eventSupp;
      return next;
    });
  };

  const handleAddSupplementaryFromDraft = () => {
    const name = supplementaryDraft.trim();
    if (!name) return;
    addSupplementary({ name, memberId: null });
    setSupplementaryDraft("");
  };

  const handleAddSupplementaryMember = (memberId: string) => {
    if (!memberId) return;
    const member = members.find((m) => m.id === memberId);
    if (!member) return;
    addSupplementary({
      name: formatMemberDisplayName(member),
      memberId: member.id,
    });
  };

  /** Duets take two entrants, so names collect into a draft pair before the duo is added. */
  const pushDuetDraft = (entry: RosterSlotData) => {
    const name = entry.name.trim();
    if (!name) return;

    const partner = duetDraft[0];
    if (!partner) {
      setDuetDraft([{ name, memberId: entry.memberId ?? null }]);
      toast.success(`${name} — pick a partner to complete the duo`);
      return;
    }

    addOpenEntry({
      name: partner.name,
      memberId: partner.memberId ?? null,
      secondName: name,
      secondMemberId: entry.memberId ?? null,
    });
    setDuetDraft([]);
    toast.success(`${partner.name} & ${name} added`);
  };

  const handleAddOpenEntryFromDraft = () => {
    const name = openEntryDraft.trim();
    if (!name) return;
    if (isDuet) {
      pushDuetDraft({ name, memberId: null });
    } else {
      addOpenEntry({ name, memberId: null });
      toast.success(`${name} added`);
    }
    setOpenEntryDraft("");
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = serializeCompetitionRostersData(data);
      const { error } = await supabase.from("competition_rosters").upsert(
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
          "Failed to save rosters. Ensure the 'competition_rosters' table exists.",
        );
      } else {
        setData(payload);
        toast.success("Rosters saved successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-(--primary-gold)" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-400">
            Competitions
          </p>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
            Participant Rosters
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {isChoral
              ? isSinging
                ? "Assign choirmasters for up to 3 choirs. Open to all members."
                : isDuet
                  ? "Add unlimited duet entries, with two people in each slot."
                : "Add unlimited entrants for this choral event. Open to all members."
              : "Assign family members to competition slots. Supplementary names are admin-only failsafes and never appear on the public site."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadAll}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-(--primary-gold) px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-(--primary-gold)/20 transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {ALL_ROSTER_EVENT_NAMES.map((eventName) => (
          <button
            key={eventName}
            type="button"
            onClick={() => setActiveEvent(eventName)}
            className={`rounded-xl border px-3.5 py-2 text-[11px] font-bold transition-all ${
              activeEvent === eventName
                ? "border-(--primary-gold) bg-(--primary-gold) text-white shadow-sm"
                : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
            }`}
          >
            {eventName}
          </button>
        ))}
      </div>

      {!isChoral && (
        <div className="flex flex-wrap gap-2">
          {ROSTER_FAMILIES.map((family) => {
            const style = FAMILY_STYLES[family];
            const isActive = activeFamily === family;
            return (
              <button
                key={family}
                type="button"
                onClick={() => {
                  setActiveFamily(family);
                  setMemberSearch("");
                }}
                className={`rounded-xl border px-3.5 py-2 text-[11px] font-black uppercase tracking-tight transition-all ${
                  isActive
                    ? `${style.bgColor} ${style.borderColor} ${style.textColor} ring-1 ring-current/20`
                    : "border-zinc-200 bg-white text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                }`}
              >
                {family}
              </button>
            );
          })}
        </div>
      )}

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100">
              {isSinging
                ? "Choir roster"
                : isUnlimited
                  ? "Entrants"
                  : "Main roster"}
            </h2>
            <p className="text-xs text-zinc-500">
              {isChoral
                ? isSinging
                  ? `${activeEvent} · 3 choirs max`
                  : isDuet
                    ? `${activeEvent} · 2 entrants per duo · No limit`
                  : `${activeEvent} · No entry limit`
                : `${activeEvent} · Family of ${activeFamily}`}
            </p>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            {isUnlimited
              ? `${slots.length} ${isDuet ? "duo" : "entrant"}${slots.length === 1 ? "" : "s"}`
              : `${slots.length} slots`}
          </p>
        </div>

        {!isChoral && familyMembers.length === 0 && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-50 px-3 py-2.5 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            No members found for Family of {activeFamily}. Assign members in
            Admin → Members first.
          </div>
        )}

        {isChoral && members.length === 0 && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-50 px-3 py-2.5 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            No members found. You can still type names manually below.
          </div>
        )}

        {pickerMembers.length > 0 && (
          <div className="mb-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder={
                  isChoral
                    ? "Search all members…"
                    : `Search Family of ${activeFamily}…`
                }
                aria-label="Search members"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-10 text-sm outline-none focus:border-(--primary-gold) dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
              {memberSearch && (
                <button
                  type="button"
                  onClick={() => setMemberSearch("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-200/70 hover:text-zinc-600 dark:hover:bg-zinc-800"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="mt-2 max-h-[8.25rem] overflow-y-auto rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950">
              {memberSearch.trim() && searchableMembers.length === 0 ? (
                <p className="px-3 py-3 text-sm text-zinc-400">
                  No available members match “{memberSearch.trim()}”.
                </p>
              ) : searchableMembers.length === 0 ? (
                <p className="px-3 py-3 text-sm text-zinc-400">
                  {isUnlimited
                    ? "All members are already on this roster."
                    : isSinging
                      ? "All choir slots are filled, or every member is already assigned."
                      : "All family members are already on this roster."}
                </p>
              ) : (
                <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {searchableMembers.map((member) => (
                    <li key={member.id}>
                      <button
                        type="button"
                        onClick={() => assignToNextOpenSlot(member.id)}
                        className="flex h-11 w-full items-center justify-between gap-3 px-3 text-left transition-colors hover:bg-(--primary-gold)/10"
                      >
                        <span className="min-w-0 truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                          {formatMemberDisplayName(member)}
                          {member.nick_name ? (
                            <span className="font-normal text-zinc-400">
                              {" "}
                              (@{member.nick_name})
                            </span>
                          ) : null}
                          {isChoral && member.family ? (
                            <span className="font-normal text-zinc-400">
                              {" "}
                              · {member.family}
                            </span>
                          ) : null}
                        </span>
                        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-(--primary-gold)">
                          Add
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <p className="mt-1.5 text-[11px] text-zinc-400">
              {isDuet
                ? "Click two names to form a duo · no entry limit."
                : isUnlimited
                  ? "Click a name to add them · no entry limit."
                  : isSinging
                    ? "Click a name to fill the next open choirmaster slot."
                    : "Click a name to fill the next open slot · 3 visible, scroll for more."}
            </p>
          </div>
        )}

        {isUnlimited && (
          <div className="mb-4 flex flex-1 gap-2">
            <input
              type="text"
              value={openEntryDraft}
              onChange={(e) => setOpenEntryDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddOpenEntryFromDraft();
                }
              }}
              placeholder={
                isDuet
                  ? duetDraft.length === 0
                    ? "Or type the first entrant’s name…"
                    : "Or type the partner’s name…"
                  : "Or type an entrant name…"
              }
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-(--primary-gold) dark:border-zinc-700 dark:bg-zinc-950"
            />
            <button
              type="button"
              onClick={handleAddOpenEntryFromDraft}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
        )}

        {isDuet && duetDraft.length > 0 && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-dashed border-(--primary-gold)/40 bg-(--primary-gold)/5 px-3 py-2">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-(--primary-gold)">
                Duo in progress
              </p>
              <p className="truncate text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                {duetDraft[0].name} · waiting for partner
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDuetDraft([])}
              aria-label="Cancel duo in progress"
              className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {isUnlimited ? (
          <ul className="space-y-2">
            {slots.length === 0 ? (
              <li className="text-sm italic text-zinc-400">
                No {isDuet ? "duos" : "entrants"} yet.
              </li>
            ) : (
              slots.map((slot, index) => (
                <li
                  key={`${slot.memberId ?? slot.name}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
                >
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      {slot.role ?? `Entrant ${index + 1}`}
                    </p>
                    <p className="truncate text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      {isDuet
                        ? `${slot.name} & ${slot.secondName ?? "TBA"}`
                        : slot.name}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeOpenEntry(index)}
                    aria-label={`Remove ${slot.name}`}
                    className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))
            )}
          </ul>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {slots.map((slot, index) => (
              <li
                key={`${slot.role ?? "slot"}-${index}`}
                className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  {slot.role ?? `Slot ${index + 1}`}
                </span>
                {isSinging ? (
                  <div className="flex w-full flex-col gap-2 sm:max-w-sm">
                    <select
                      value={slot.memberId ?? ""}
                      onChange={(e) =>
                        updateOpenSlot(
                          index,
                          e.target.value
                            ? { memberId: e.target.value }
                            : { clear: true },
                        )
                      }
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-800 outline-none focus:border-(--primary-gold) dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                    >
                      <option value="">TBA — unassigned</option>
                      {allMembersSorted.map((member) => (
                        <option key={member.id} value={member.id}>
                          {formatMemberDisplayName(member)}
                          {member.nick_name ? ` (@${member.nick_name})` : ""}
                          {member.family ? ` · ${member.family}` : ""}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={
                        slot.memberId || slot.name === "TBA" ? "" : slot.name
                      }
                      onChange={(e) =>
                        updateOpenSlot(index, { name: e.target.value })
                      }
                      placeholder="Or type choirmaster name…"
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-(--primary-gold) dark:border-zinc-700 dark:bg-zinc-950"
                    />
                  </div>
                ) : (
                  <select
                    value={slot.memberId ?? ""}
                    onChange={(e) => updateFamilySlot(index, e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-800 outline-none focus:border-(--primary-gold) dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 sm:max-w-sm"
                  >
                    <option value="">TBA — unassigned</option>
                    {familyMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {formatMemberDisplayName(member)}
                        {member.nick_name ? ` (@${member.nick_name})` : ""}
                      </option>
                    ))}
                  </select>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {!isChoral && (
        <section className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/80 p-5 dark:border-zinc-700 dark:bg-zinc-900/50">
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                Supplementary (failsafe)
              </h2>
              <span className="rounded-md bg-zinc-200 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                Admin only
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              Backup names for absentees. These never show on the public roster
              panel.
            </p>
          </div>

          <ul className="mb-4 space-y-2">
            {supplementary.length === 0 ? (
              <li className="text-sm italic text-zinc-400">
                No supplementary names yet.
              </li>
            ) : (
              supplementary.map((entry, index) => (
                <li
                  key={`${entry.name}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
                >
                  <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    {entry.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSupplementary(index)}
                    aria-label={`Remove ${entry.name}`}
                    className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))
            )}
          </ul>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex flex-1 gap-2">
              <input
                type="text"
                value={supplementaryDraft}
                onChange={(e) => setSupplementaryDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSupplementaryFromDraft();
                  }
                }}
                placeholder="Type a backup name…"
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-(--primary-gold) dark:border-zinc-700 dark:bg-zinc-950"
              />
              <button
                type="button"
                onClick={handleAddSupplementaryFromDraft}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>
            <select
              defaultValue=""
              onChange={(e) => {
                handleAddSupplementaryMember(e.target.value);
                e.target.value = "";
              }}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-(--primary-gold) dark:border-zinc-700 dark:bg-zinc-950 sm:max-w-xs"
            >
              <option value="">Or pick from family…</option>
              {filteredPickerMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {formatMemberDisplayName(member)}
                </option>
              ))}
            </select>
          </div>
        </section>
      )}
    </div>
  );
}
