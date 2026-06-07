"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Filter,
  Loader2,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import {
  GiPolarStar,
  GiWingedScepter,
  GiFruitTree,
  GiDove,
} from "react-icons/gi";
import { FaBolt } from "react-icons/fa";
import type { ComponentType } from "react";
import { toast } from "sonner";
import {
  FAMILY_OPTIONS,
  SHIRT_SIZES,
  type Family,
  type MemberSeed,
  type RosterRow,
  buildSummary,
  collectNations,
  createManualRow,
  downloadAllFamiliesCsv,
  downloadAllFamiliesPdf,
  downloadCsv,
  downloadRosterPdf,
  filterAllRostersByNations,
  formatFamilyDisplayName,
  formatNationFilterLabel,
  loadSession,
  memberToDefaultRow,
  resolveAllFamilyRosters,
  rosterToCsv,
  rowDiffersFromDefault,
  saveSession,
  organizeFamilyRows,
} from "@/lib/family-roster";

type IconType = ComponentType<{ className?: string; size?: number }>;

const familyStyles: Record<
  string,
  { bgColor: string; borderColor: string; textColor: string; icon: IconType }
> = {
  Dominion: {
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/40",
    textColor: "text-purple-700 dark:text-purple-400",
    icon: GiWingedScepter,
  },
  Light: {
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/40",
    textColor: "text-yellow-700 dark:text-yellow-400",
    icon: GiPolarStar,
  },
  Power: {
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/40",
    textColor: "text-red-700 dark:text-red-400",
    icon: FaBolt,
  },
  Virtue: {
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/40",
    textColor: "text-green-700 dark:text-green-400",
    icon: GiFruitTree,
  },
  Seraphs: {
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/40",
    textColor: "text-cyan-700 dark:text-cyan-400",
    icon: GiDove,
  },
};

export default function AdminFamilyRostersPage() {
  const [members, setMembers] = useState<MemberSeed[]>([]);
  const [rosters, setRosters] = useState<Record<Family, RosterRow[]>>(() =>
    resolveAllFamilyRosters([]),
  );
  const [selectedNations, setSelectedNations] = useState<string[]>([]);
  const [showNationFilter, setShowNationFilter] = useState(false);
  const [activeFamilyIndex, setActiveFamilyIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{
    family: Family;
    row: RosterRow;
  } | null>(null);
  const touchStartX = useRef<number | null>(null);

  const supabase = useMemo(() => createClient(), []);
  const activeFamily = FAMILY_OPTIONS[activeFamilyIndex];
  const allNations = useMemo(() => collectNations(rosters), [rosters]);
  const nationFilterLabel = formatNationFilterLabel(
    selectedNations,
    allNations,
  );

  const filteredRosters = useMemo(
    () => filterAllRostersByNations(rosters, selectedNations, allNations),
    [rosters, selectedNations, allNations],
  );

  const activeRows = filteredRosters[activeFamily] ?? [];
  const totalTeeCount = useMemo(
    () =>
      FAMILY_OPTIONS.reduce(
        (sum, family) => sum + (filteredRosters[family]?.length ?? 0),
        0,
      ),
    [filteredRosters],
  );
  const summary = buildSummary(activeFamily, activeRows);
  const style = familyStyles[activeFamily];
  const FamilyIcon = style?.icon ?? GiPolarStar;

  const persistSession = useCallback(
    (nextRosters: Record<Family, RosterRow[]>, nations: string[]) => {
      saveSession({ rosters: nextRosters, selectedNations: nations });
    },
    [],
  );

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("members")
        .select(
          "id, first_name, nick_name, date_of_birth, shirt_size, nation_of_residence, family",
        );

      if (error) {
        console.error(error);
        toast.error("Failed to load members");
        setIsLoading(false);
        return;
      }

      const memberList = (data ?? []) as MemberSeed[];
      setMembers(memberList);

      const defaults = resolveAllFamilyRosters(memberList);
      const session = loadSession();

      if (session?.rosters) {
        setRosters(session.rosters);
        setSelectedNations(
          session.selectedNations?.length
            ? session.selectedNations
            : collectNations(session.rosters),
        );
      } else {
        const nations = collectNations(defaults);
        setRosters(defaults);
        setSelectedNations(nations);
        persistSession(defaults, nations);
      }

      setIsLoading(false);
    }
    fetchData();
  }, [supabase, persistSession]);

  const updateRosters = (next: Record<Family, RosterRow[]>) => {
    setRosters(next);
    persistSession(next, selectedNations);
  };

  const updateFamilyRows = (family: Family, rows: RosterRow[]) => {
    updateRosters({
      ...rosters,
      [family]: organizeFamilyRows(rows),
    });
  };

  const handleFieldChange = (
    family: Family,
    rowKey: string,
    field: keyof Pick<
      RosterRow,
      "nick_name" | "age" | "shirt_size" | "nation_of_residence"
    >,
    value: string,
  ) => {
    const rows = rosters[family] ?? [];
    const updated = rows.map((r) => {
      if (r.rowKey !== rowKey) return r;
      if (field === "age") {
        const parsed = value === "" ? null : parseInt(value, 10);
        return { ...r, age: Number.isNaN(parsed) ? null : parsed };
      }
      return { ...r, [field]: value };
    });
    updateFamilyRows(family, updated);
  };

  const handleRevert = (family: Family, row: RosterRow) => {
    if (row.source !== "member" || !row.memberId) return;
    const member = members.find((m) => m.id === row.memberId);
    if (!member) return;
    const defaults = memberToDefaultRow(member);
    updateFamilyRows(
      family,
      (rosters[family] ?? []).map((r) =>
        r.rowKey === row.rowKey ? defaults : r,
      ),
    );
    toast.success("Reverted to member defaults");
  };

  const handleAddRow = (family: Family) => {
    const newRow = createManualRow();
    const current = rosters[family] ?? [];
    const manual = [newRow, ...current.filter((r) => r.source === "manual")];
    const members = current.filter((r) => r.source === "member");
    updateFamilyRows(family, [...manual, ...members]);
    toast.success("Manual row added (session only)");
  };

  const confirmDeleteManual = () => {
    if (!deleteTarget) return;
    const { family, row } = deleteTarget;
    updateFamilyRows(
      family,
      (rosters[family] ?? []).filter((r) => r.rowKey !== row.rowKey),
    );
    setDeleteTarget(null);
    toast.success("Row removed");
  };

  const toggleNation = (nation: string) => {
    const next = selectedNations.includes(nation)
      ? selectedNations.filter((n) => n !== nation)
      : [...selectedNations, nation];
    setSelectedNations(next);
    persistSession(rosters, next);
  };

  const selectAllNations = () => {
    setSelectedNations(allNations);
    persistSession(rosters, allNations);
  };

  const clearNationFilter = () => {
    setSelectedNations([]);
    persistSession(rosters, []);
  };

  const goToFamily = (index: number) => {
    setActiveFamilyIndex(
      ((index % FAMILY_OPTIONS.length) + FAMILY_OPTIONS.length) %
        FAMILY_OPTIONS.length,
    );
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      goToFamily(activeFamilyIndex + (delta < 0 ? 1 : -1));
    }
    touchStartX.current = null;
  };

  const exportFamilyCsv = () => {
    const slug = activeFamily.toLowerCase();
    downloadCsv(
      `anniversary-tshirts-${slug}.csv`,
      rosterToCsv(activeFamily, activeRows, nationFilterLabel),
    );
    toast.success("CSV downloaded");
  };

  const exportFamilyPdf = () => {
    downloadRosterPdf(activeFamily, activeRows, nationFilterLabel);
    toast.success("PDF downloaded");
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-(--primary-gold)" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Anniversary T-Shirts
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Query members by family for anniversary tee printing and
            distribution. Edit locally, then export CSV or PDF for your vendor.
            Changes stay in this browser session only.
          </p>
        </div>
        <div className="flex shrink-0 flex-nowrap items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setShowNationFilter((v) => !v)}
            title="Filter by nation of residence"
            aria-label="Filter by nation of residence"
            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-xs transition ${
              showNationFilter
                ? "border-(--primary-gold) bg-(--primary-gold)/10 text-(--primary-gold)"
                : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            }`}
          >
            <Filter size={16} />
          </button>
          <button
            onClick={() => {
              downloadAllFamiliesCsv(filteredRosters, nationFilterLabel);
              toast.success("All families CSV downloaded");
            }}
            className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 shadow-xs transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <Download size={16} />
            Export All CSV
          </button>
          <button
            onClick={() => {
              downloadAllFamiliesPdf(filteredRosters, nationFilterLabel);
              toast.success("All families PDF downloaded");
            }}
            className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl bg-(--primary-gold) px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-(--primary-gold)/20 transition hover:opacity-90"
          >
            <FileText size={16} />
            Export All PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="col-span-2 rounded-2xl border border-(--primary-gold)/30 bg-(--primary-gold)/5 p-5 shadow-xs sm:col-span-1 lg:col-span-1">
          <p className="text-xs font-bold uppercase tracking-wider text-(--primary-gold)">
            Total
          </p>
          <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            {totalTeeCount}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {selectedNations.length > 0 &&
            selectedNations.length < allNations.length
              ? "Filtered count"
              : "All families"}
          </p>
        </div>
        {FAMILY_OPTIONS.map((family) => (
          <div
            key={family}
            className={`rounded-2xl border p-5 shadow-xs ${
              family === activeFamily
                ? `${familyStyles[family].borderColor} ${familyStyles[family].bgColor}`
                : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            }`}
          >
            <p
              className={`text-xs font-bold uppercase tracking-wider ${
                family === activeFamily
                  ? familyStyles[family].textColor
                  : "text-zinc-500"
              }`}
            >
              {family}
            </p>
            <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {filteredRosters[family]?.length ?? 0}
            </p>
          </div>
        ))}
      </div>

      {showNationFilter && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Filter by Nation of Residence
              </h3>
              <p className="text-xs text-zinc-500">
                Applies to the table view and all exports. Currently:{" "}
                {nationFilterLabel}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={selectAllNations}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-(--primary-gold) hover:bg-(--primary-gold)/10"
              >
                Select All
              </button>
              <button
                onClick={clearNationFilter}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Clear
              </button>
              <button
                onClick={() => setShowNationFilter(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {allNations.map((nation) => {
              const checked = selectedNations.includes(nation);
              return (
                <button
                  key={nation}
                  onClick={() => toggleNation(nation)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                    checked
                      ? "border-(--primary-gold) bg-(--primary-gold)/10 text-(--primary-gold)"
                      : "border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400"
                  }`}
                >
                  {nation}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => goToFamily(activeFamilyIndex - 1)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          aria-label="Previous family"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex flex-1 flex-col items-center gap-3">
          <div className="flex gap-2">
            {FAMILY_OPTIONS.map((family, idx) => (
              <button
                key={family}
                onClick={() => goToFamily(idx)}
                className={`h-2.5 rounded-full transition-all ${
                  idx === activeFamilyIndex
                    ? "w-8 bg-(--primary-gold)"
                    : "w-2.5 bg-zinc-300 dark:bg-zinc-600"
                }`}
                aria-label={`Go to ${family}`}
              />
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {FAMILY_OPTIONS.map((family, idx) => (
              <button
                key={family}
                onClick={() => goToFamily(idx)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  idx === activeFamilyIndex
                    ? "bg-(--primary-gold) text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                }`}
              >
                {family}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => goToFamily(activeFamilyIndex + 1)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          aria-label="Next family"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`overflow-hidden rounded-2xl border ${style?.borderColor ?? "border-zinc-200"} bg-white shadow-xs dark:bg-zinc-900`}
      >
        <div
          className={`border-b px-6 py-6 ${style?.bgColor ?? "bg-zinc-50"} ${style?.borderColor ?? "border-zinc-200"}`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${style?.borderColor} ${style?.bgColor}`}
              >
                <FamilyIcon className={style?.textColor} size={24} />
              </div>
              <div>
                <h2
                  className={`text-xl font-bold ${style?.textColor ?? "text-zinc-900 dark:text-zinc-100"}`}
                >
                  {formatFamilyDisplayName(activeFamily)}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {summary.text}
                </p>
                {selectedNations.length > 0 &&
                  selectedNations.length < allNations.length && (
                    <p className="mt-1 text-xs text-zinc-500">
                      Filtered nations: {nationFilterLabel}
                    </p>
                  )}
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <button
                onClick={exportFamilyCsv}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                <Download size={14} />
                CSV
              </button>
              <button
                onClick={exportFamilyPdf}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                <FileText size={14} />
                PDF
              </button>
              <button
                onClick={() => handleAddRow(activeFamily)}
                className="inline-flex items-center gap-2 rounded-xl bg-(--primary-gold) px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                <Plus size={14} />
                Add Row
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50">
                <th className="w-12 px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500">
                  #
                </th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Nickname
                </th>
                <th className="w-24 px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Age
                </th>
                <th className="w-32 px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500">
                  T-Shirt Size
                </th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Nation of Residence
                </th>
                <th className="w-28 px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {activeRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-sm text-zinc-500"
                  >
                    No members match the current nation filter. Adjust the
                    filter or use Add Row for manual entries.
                  </td>
                </tr>
              ) : (
                activeRows.map((row, idx) => {
                  const showRevert =
                    row.source === "member" && rowDiffersFromDefault(row);
                  return (
                    <tr
                      key={row.rowKey}
                      className="transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30"
                    >
                      <td className="px-4 py-3 text-sm text-zinc-500">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <input
                            type="text"
                            value={row.nick_name}
                            onChange={(e) =>
                              handleFieldChange(
                                activeFamily,
                                row.rowKey,
                                "nick_name",
                                e.target.value,
                              )
                            }
                            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-(--primary-gold) dark:border-zinc-700 dark:bg-zinc-950"
                            placeholder="Nickname"
                          />
                          {row.source === "member" && showRevert && (
                            <span className="text-[10px] font-medium uppercase tracking-wide text-amber-600 dark:text-amber-400">
                              Edited for export
                            </span>
                          )}
                          {row.source === "manual" && (
                            <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                              Manual entry
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min={0}
                          max={120}
                          value={row.age ?? ""}
                          onChange={(e) =>
                            handleFieldChange(
                              activeFamily,
                              row.rowKey,
                              "age",
                              e.target.value,
                            )
                          }
                          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-(--primary-gold) dark:border-zinc-700 dark:bg-zinc-950"
                          placeholder="—"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={row.shirt_size}
                          onChange={(e) =>
                            handleFieldChange(
                              activeFamily,
                              row.rowKey,
                              "shirt_size",
                              e.target.value,
                            )
                          }
                          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-(--primary-gold) dark:border-zinc-700 dark:bg-zinc-950"
                        >
                          <option value="">—</option>
                          {SHIRT_SIZES.map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                          {!SHIRT_SIZES.includes(
                            row.shirt_size as (typeof SHIRT_SIZES)[number],
                          ) && (
                            <option value={row.shirt_size}>
                              {row.shirt_size}
                            </option>
                          )}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={row.nation_of_residence}
                          onChange={(e) =>
                            handleFieldChange(
                              activeFamily,
                              row.rowKey,
                              "nation_of_residence",
                              e.target.value,
                            )
                          }
                          className="w-full min-w-[120px] rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-(--primary-gold) dark:border-zinc-700 dark:bg-zinc-950"
                          placeholder="Nation"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {showRevert && (
                            <button
                              onClick={() => handleRevert(activeFamily, row)}
                              title="Revert to member defaults"
                              className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-(--primary-gold) dark:hover:bg-zinc-800"
                            >
                              <RotateCcw size={16} />
                            </button>
                          )}
                          {row.source === "manual" && (
                            <button
                              onClick={() =>
                                setDeleteTarget({ family: activeFamily, row })
                              }
                              title="Delete manual row"
                              className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
              <Trash2 size={22} />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Remove manual row?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500">
              This will remove the manual entry from your session roster. It
              won&apos;t affect any member records in the database.
            </p>
            {deleteTarget.row.nick_name && (
              <p className="mt-3 rounded-xl bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {deleteTarget.row.nick_name}
              </p>
            )}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteManual}
                className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
              >
                Remove Row
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
