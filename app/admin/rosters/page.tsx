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
  ROSTER_EVENT_NAMES,
  ROSTER_FAMILIES,
  createEmptyCompetitionRostersData,
  fetchCompetitionRosters,
  formatMemberDisplayName,
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
    ROSTER_EVENT_NAMES[0] ?? "Football",
  );
  const [activeFamily, setActiveFamily] =
    useState<CompetitionFamily>("Virtue");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [supplementaryDraft, setSupplementaryDraft] = useState("");
  const [memberSearch, setMemberSearch] = useState("");

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

  const filteredFamilyMembers = useMemo(() => {
    const query = memberSearch.trim().toLowerCase();
    if (!query) return familyMembers;
    return familyMembers.filter((m) => {
      const haystack =
        `${m.first_name} ${m.last_name} ${m.nick_name}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [familyMembers, memberSearch]);

  const slots: RosterSlotData[] =
    data.rosters[activeEvent]?.[activeFamily] ?? [];

  const assignedMemberIds = useMemo(() => {
    const ids = new Set<string>();
    for (const slot of slots) {
      if (slot.memberId) ids.add(slot.memberId);
    }
    return ids;
  }, [slots]);

  const searchableMembers = useMemo(
    () => filteredFamilyMembers.filter((m) => !assignedMemberIds.has(m.id)),
    [filteredFamilyMembers, assignedMemberIds],
  );

  const supplementary: SupplementaryEntry[] =
    data.supplementary[activeEvent]?.[activeFamily] ?? [];

  const updateSlot = (index: number, memberId: string) => {
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

  const assignToNextOpenSlot = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;

    const nextIndex = slots.findIndex(
      (slot) => !slot.memberId || slot.name === "TBA",
    );
    if (nextIndex === -1) {
      toast.error("No open slots left for this family roster.");
      return;
    }

    const roleLabel = slots[nextIndex]?.role ?? `Slot ${nextIndex + 1}`;
    updateSlot(nextIndex, memberId);
    setMemberSearch("");
    toast.success(
      `${formatMemberDisplayName(member)} → ${roleLabel}`,
    );
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
            Assign family members to competition slots. Supplementary names are
            admin-only failsafes and never appear on the public site.
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
        {ROSTER_EVENT_NAMES.map((eventName) => (
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

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100">
              Main roster
            </h2>
            <p className="text-xs text-zinc-500">
              {activeEvent} · Family of {activeFamily}
            </p>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            {slots.length} slots
          </p>
        </div>

        {familyMembers.length === 0 && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-50 px-3 py-2.5 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            No members found for Family of {activeFamily}. Assign members in
            Admin → Members first.
          </div>
        )}

        {familyMembers.length > 0 && (
          <div className="mb-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder={`Search Family of ${activeFamily}…`}
                aria-label="Search family members"
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
                  All family members are already on this roster.
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
              Click a name to fill the next open slot · 3 visible, scroll for
              more.
            </p>
          </div>
        )}

        <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {slots.map((slot, index) => (
            <li
              key={`${slot.role ?? "slot"}-${index}`}
              className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {slot.role ?? `Slot ${index + 1}`}
              </span>
              <select
                value={slot.memberId ?? ""}
                onChange={(e) => updateSlot(index, e.target.value)}
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
            </li>
          ))}
        </ul>
      </section>

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
            {filteredFamilyMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {formatMemberDisplayName(member)}
              </option>
            ))}
          </select>
        </div>
      </section>
    </div>
  );
}
