"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Columns2,
  Download,
  FileText,
  Filter,
  Loader2,
  Plus,
  RotateCcw,
  Trash2,
  Undo2,
  Upload,
  Wand2,
  Wrench,
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
  DEFAULT_EXPORT_COLUMNS,
  EXPORT_COLUMN_OPTIONS,
  FAMILY_OPTIONS,
  type ExportColumn,
  type Family,
  type MemberSeed,
  type RosterRow,
  buildSummary,
  clearSession,
  collectNations,
  createManualRow,
  downloadAllFamiliesCsv,
  downloadAllFamiliesPdf,
  downloadCsv,
  downloadRosterPdf,
  filterAllRosters,
  filterRowsForDisplay,
  formatExportColumnsLabel,
  formatFamilyDisplayName,
  formatNationFilterLabel,
  formatRosterShirtSize,
  formatShirtSizeTypeFilterLabel,
  loadSession,
  memberToDefaultRow,
  DEFAULT_ROSTER_SORT,
  mergeSessionRosters,
  resolveAllFamilyRosters,
  resolveShirtSizeTypes,
  rosterToCsv,
  rostersHaveEdits,
  rowDiffersFromDefault,
  saveSession,
  SHIRT_SIZE_TYPE_LABELS,
  SHIRT_SIZE_TYPE_OPTIONS,
  sortRosterRows,
  type RosterSortConfig,
  type RosterSortKey,
  type ShirtSizeTypeFilter,
  type RosterSession,
} from "@/lib/t-shirts";
import { validateChestInches } from "@/lib/shirt-sizes";
import {
  applyLegacySizeEstimatesToRosters,
  DEFAULT_CHEST_BUFFER_INCHES,
  MIN_COMMUNITY_AGE,
} from "@/lib/estimate-legacy-shirt-sizes";

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

function renderSortHeader(
  label: string,
  sortKey: RosterSortKey,
  sortConfig: RosterSortConfig,
  onSort: (key: RosterSortKey) => void,
  className = "",
) {
  return (
    <th
      className={`cursor-pointer px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500 transition hover:bg-zinc-100/50 dark:hover:bg-zinc-800 ${className}`}
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortConfig?.key === sortKey &&
          (sortConfig.direction === "asc" ? (
            <ChevronUp size={14} />
          ) : (
            <ChevronDown size={14} />
          ))}
      </div>
    </th>
  );
}

export default function AdminTShirtsPage() {
  const [members, setMembers] = useState<MemberSeed[]>([]);
  const [rosters, setRosters] = useState<Record<Family, RosterRow[]>>(() =>
    resolveAllFamilyRosters([]),
  );
  const [selectedNations, setSelectedNations] = useState<string[]>([]);
  const [selectedShirtSizeTypes, setSelectedShirtSizeTypes] = useState<
    ShirtSizeTypeFilter[]
  >([...SHIRT_SIZE_TYPE_OPTIONS]);
  const [exportColumns, setExportColumns] = useState<ExportColumn[]>([
    ...DEFAULT_EXPORT_COLUMNS,
  ]);
  const [showNationFilter, setShowNationFilter] = useState(false);
  const [showExportColumns, setShowExportColumns] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [activeFamilyIndex, setActiveFamilyIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{
    family: Family;
    row: RosterRow;
  } | null>(null);
  const [showUndoConfirm, setShowUndoConfirm] = useState(false);
  const [sortConfig, setSortConfig] =
    useState<RosterSortConfig>(DEFAULT_ROSTER_SORT);
  const [focusedRowKey, setFocusedRowKey] = useState<string | null>(null);
  const touchStartX = useRef<number | null>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionImportRef = useRef<HTMLInputElement>(null);

  const supabase = useMemo(() => createClient(), []);
  const activeFamily = FAMILY_OPTIONS[activeFamilyIndex];
  const allNations = useMemo(() => collectNations(rosters), [rosters]);
  const nationFilterLabel = formatNationFilterLabel(
    selectedNations,
    allNations,
  );
  const shirtSizeTypeFilterLabel = formatShirtSizeTypeFilterLabel(
    selectedShirtSizeTypes,
  );
  const exportColumnsLabel = formatExportColumnsLabel(exportColumns);
  const exportOptions = useMemo(
    () => ({
      nationFilterLabel,
      shirtSizeTypeFilterLabel,
      exportColumns,
    }),
    [nationFilterLabel, shirtSizeTypeFilterLabel, exportColumns],
  );
  const isExportColumnsCustom =
    exportColumns.length !== DEFAULT_EXPORT_COLUMNS.length ||
    DEFAULT_EXPORT_COLUMNS.some((column) => !exportColumns.includes(column));

  const filteredRosters = useMemo(
    () =>
      filterAllRosters(rosters, {
        selectedNations,
        allNations,
        selectedShirtSizeTypes,
      }),
    [rosters, selectedNations, allNations, selectedShirtSizeTypes],
  );

  const exportRosters = useMemo(() => {
    const result = {} as Record<Family, RosterRow[]>;
    for (const family of FAMILY_OPTIONS) {
      const filtered = filteredRosters[family] ?? [];
      result[family] = sortRosterRows(filtered, sortConfig);
    }
    return result;
  }, [filteredRosters, sortConfig]);

  const familyRows = rosters[activeFamily] ?? [];
  const filteredFamilyRows = filteredRosters[activeFamily] ?? [];

  const activeRows = useMemo(
    () =>
      sortRosterRows(
        filterRowsForDisplay(
          familyRows,
          selectedNations,
          allNations,
          focusedRowKey,
          selectedShirtSizeTypes,
        ),
        sortConfig,
      ),
    [
      familyRows,
      selectedNations,
      allNations,
      focusedRowKey,
      selectedShirtSizeTypes,
      sortConfig,
    ],
  );

  const isNationFilterActive =
    allNations.length > 0 && selectedNations.length < allNations.length;
  const isShirtSizeTypeFilterActive =
    selectedShirtSizeTypes.length < SHIRT_SIZE_TYPE_OPTIONS.length;
  const isFilterActive = isNationFilterActive || isShirtSizeTypeFilterActive;
  const totalTeeCount = useMemo(
    () =>
      FAMILY_OPTIONS.reduce(
        (sum, family) => sum + (filteredRosters[family]?.length ?? 0),
        0,
      ),
    [filteredRosters],
  );
  const summary = buildSummary(activeFamily, filteredFamilyRows);
  const style = familyStyles[activeFamily];
  const FamilyIcon = style?.icon ?? GiPolarStar;

  const defaultRosters = useMemo(
    () => resolveAllFamilyRosters(members),
    [members],
  );

  const hasEdits = useMemo(
    () => rostersHaveEdits(rosters, defaultRosters),
    [rosters, defaultRosters],
  );

  const persistSession = useCallback(
    (
      nextRosters: Record<Family, RosterRow[]>,
      nations: string[],
      shirtSizeTypes: ShirtSizeTypeFilter[],
      columns: ExportColumn[],
    ) => {
      const saved = saveSession({
        rosters: nextRosters,
        selectedNations: nations,
        selectedShirtSizeTypes: shirtSizeTypes,
        exportColumns: columns,
      });
      if (!saved) {
        toast.error(
          "Could not save session changes. Edits work until you refresh.",
        );
      }
    },
    [],
  );

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("members")
        .select(
          "id, first_name, nick_name, date_of_birth, shirt_size, shirt_chest_inches, nation_of_residence, gender, family",
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
        const merged = mergeSessionRosters(defaults, session.rosters);
        const nations = session.selectedNations?.length
          ? session.selectedNations
          : collectNations(merged);
        const shirtSizeTypes = resolveShirtSizeTypes(
          session.selectedShirtSizeTypes,
        );
        const columns = session.exportColumns?.length
          ? session.exportColumns
          : [...DEFAULT_EXPORT_COLUMNS];
        setRosters(merged);
        setSelectedNations(nations);
        setSelectedShirtSizeTypes(shirtSizeTypes);
        setExportColumns(columns);
      } else {
        const nations = collectNations(defaults);
        const shirtSizeTypes = [...SHIRT_SIZE_TYPE_OPTIONS];
        const columns = [...DEFAULT_EXPORT_COLUMNS];
        setRosters(defaults);
        setSelectedNations(nations);
        setSelectedShirtSizeTypes(shirtSizeTypes);
        setExportColumns(columns);
        persistSession(defaults, nations, shirtSizeTypes, columns);
      }

      setIsLoading(false);
    }
    fetchData();
  }, [supabase, persistSession]);

  const updateRosters = useCallback(
    (updater: (prev: Record<Family, RosterRow[]>) => Record<Family, RosterRow[]>) => {
      setRosters((prev) => {
        const next = updater(prev);
        persistSession(next, selectedNations, selectedShirtSizeTypes, exportColumns);
        return next;
      });
    },
    [persistSession, selectedNations, selectedShirtSizeTypes, exportColumns],
  );

  const updateFamilyRow = useCallback(
  (
    family: Family,
    rowKey: string,
    updater: (row: RosterRow) => RosterRow,
  ) => {
    updateRosters((prev) => ({
      ...prev,
      [family]: (prev[family] ?? []).map((r) =>
        r.rowKey === rowKey ? updater(r) : r,
      ),
    }));
  },
  [updateRosters],
);

  const handleFieldChange = (
    family: Family,
    rowKey: string,
    field: keyof Pick<
      RosterRow,
      "nick_name" | "age" | "shirt_size" | "shirt_chest_inches" | "nation_of_residence"
    >,
    value: string,
  ) => {
    updateFamilyRow(family, rowKey, (r) => {
      if (field === "age") {
        const parsed = value === "" ? null : parseInt(value, 10);
        return { ...r, age: Number.isNaN(parsed) ? null : parsed };
      }
      return { ...r, [field]: value };
    });
  };

  const handleShirtChestChange = (
    family: Family,
    rowKey: string,
    value: string,
  ) => {
    updateFamilyRow(family, rowKey, (r) => {
      if (value.trim() === "") {
        return { ...r, shirt_chest_inches: null, shirt_size: "" };
      }

      const validation = validateChestInches(value);
      if (validation.valid && validation.chest != null && validation.label) {
        return {
          ...r,
          shirt_chest_inches: validation.chest,
          shirt_size: validation.label,
        };
      }

      const parsed = parseFloat(value);
      return {
        ...r,
        shirt_chest_inches: Number.isFinite(parsed) ? parsed : null,
      };
    });
  };

  const handleSort = (key: RosterSortKey) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const handleRevert = (family: Family, row: RosterRow) => {
    if (row.source !== "member" || !row.memberId) return;
    const member = members.find((m) => m.id === row.memberId);
    if (!member) return;
    const defaults = memberToDefaultRow(member);
    updateRosters((prev) => ({
      ...prev,
      [family]: (prev[family] ?? []).map((r) =>
        r.rowKey === row.rowKey ? defaults : r,
      ),
    }));
    toast.success("Reverted to member defaults");
  };

  const handleAddRow = (family: Family) => {
    const newRow = createManualRow();
    setSortConfig(null);
    updateRosters((prev) => ({
      ...prev,
      [family]: [newRow, ...(prev[family] ?? [])],
    }));
    toast.success("Manual row added at top");
  };

  const confirmDeleteManual = () => {
    if (!deleteTarget) return;
    const { family, row } = deleteTarget;
    updateRosters((prev) => ({
      ...prev,
      [family]: (prev[family] ?? []).filter((r) => r.rowKey !== row.rowKey),
    }));
    setDeleteTarget(null);
    toast.success("Row removed");
  };

  const persistNationSelection = useCallback(
    (next: string[]) => {
      setSelectedNations(next);
      setRosters((current) => {
        persistSession(current, next, selectedShirtSizeTypes, exportColumns);
        return current;
      });
    },
    [persistSession, selectedShirtSizeTypes, exportColumns],
  );

  const persistShirtSizeTypeSelection = useCallback(
    (next: ShirtSizeTypeFilter[]) => {
      setSelectedShirtSizeTypes(next);
      setRosters((current) => {
        persistSession(current, selectedNations, next, exportColumns);
        return current;
      });
    },
    [persistSession, selectedNations, exportColumns],
  );

  const persistExportColumnSelection = useCallback(
    (next: ExportColumn[]) => {
      setExportColumns(next);
      setRosters((current) => {
        persistSession(current, selectedNations, selectedShirtSizeTypes, next);
        return current;
      });
    },
    [persistSession, selectedNations, selectedShirtSizeTypes],
  );

  const toggleNation = (nation: string) => {
    const next = selectedNations.includes(nation)
      ? selectedNations.filter((n) => n !== nation)
      : [...selectedNations, nation];
    persistNationSelection(next);
  };

  const selectAllNations = () => {
    persistNationSelection(allNations);
  };

  const clearNationFilter = () => {
    persistNationSelection([]);
  };

  const toggleShirtSizeType = (type: ShirtSizeTypeFilter) => {
    const next = selectedShirtSizeTypes.includes(type)
      ? selectedShirtSizeTypes.filter((value) => value !== type)
      : [...selectedShirtSizeTypes, type];
    persistShirtSizeTypeSelection(next);
  };

  const selectAllShirtSizeTypes = () => {
    persistShirtSizeTypeSelection([...SHIRT_SIZE_TYPE_OPTIONS]);
  };

  const clearShirtSizeTypeFilter = () => {
    persistShirtSizeTypeSelection([]);
  };

  const toggleExportColumn = (column: ExportColumn) => {
    const isSelected = exportColumns.includes(column);
    if (isSelected && exportColumns.length === 1) {
      toast.error("At least one export column must stay selected");
      return;
    }
    const next = isSelected
      ? exportColumns.filter((col) => col !== column)
      : [...exportColumns, column];
    persistExportColumnSelection(next);
  };

  const selectAllExportColumns = () => {
    persistExportColumnSelection([...DEFAULT_EXPORT_COLUMNS]);
  };

  const confirmUndoAllEdits = () => {
    const nations = collectNations(defaultRosters);
    const shirtSizeTypes = [...SHIRT_SIZE_TYPE_OPTIONS];
    const columns = [...DEFAULT_EXPORT_COLUMNS];
    clearSession();
    setRosters(defaultRosters);
    setSelectedNations(nations);
    setSelectedShirtSizeTypes(shirtSizeTypes);
    setExportColumns(columns);
    setSortConfig(DEFAULT_ROSTER_SORT);
    setShowUndoConfirm(false);
    toast.success("All session edits cleared — restored from member data");
  };

  const handleEstimateLegacyForFamily = (family: Family) => {
    const result = applyLegacySizeEstimatesToRosters(rosters, members, {
      chestBufferInches: DEFAULT_CHEST_BUFFER_INCHES,
      families: [family],
    });

    if (result.updatedCount === 0) {
      toast.info(
        `No legacy sizes left to estimate in ${formatFamilyDisplayName(family)}.`,
      );
      return;
    }

    updateRosters(() => result.rosters);
    toast.success(
      `Estimated ${result.updatedCount} legacy size${result.updatedCount === 1 ? "" : "s"} in ${formatFamilyDisplayName(family)} from measured-member averages. Review rows marked “Edited for export”.`,
    );
  };

  const handleSessionImport = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const parsed = JSON.parse(await file.text()) as RosterSession;
      if (!parsed.rosters) {
        throw new Error("Session file is missing roster data.");
      }

      const merged = mergeSessionRosters(defaultRosters, parsed.rosters);
      const nations = parsed.selectedNations?.length
        ? parsed.selectedNations
        : collectNations(merged);
      const shirtSizeTypes = resolveShirtSizeTypes(parsed.selectedShirtSizeTypes);
      const columns = parsed.exportColumns?.length
        ? parsed.exportColumns
        : [...DEFAULT_EXPORT_COLUMNS];

      setRosters(merged);
      setSelectedNations(nations);
      setSelectedShirtSizeTypes(shirtSizeTypes);
      setExportColumns(columns);
      persistSession(merged, nations, shirtSizeTypes, columns);
      toast.success("Imported t-shirt session file");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not import session file.",
      );
    }
  };

  const handleRowFocus = (rowKey: string) => {
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    setFocusedRowKey(rowKey);
  };

  const handleRowBlur = () => {
    blurTimeoutRef.current = setTimeout(() => setFocusedRowKey(null), 150);
  };

  const goToFamily = (index: number) => {
    setFocusedRowKey(null);
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
    const rows = exportRosters[activeFamily] ?? [];
    downloadCsv(
      `anniversary-tshirts-${slug}.csv`,
      rosterToCsv(activeFamily, rows, exportOptions),
    );
    toast.success("CSV downloaded");
  };

  const exportFamilyPdf = () => {
    const rows = exportRosters[activeFamily] ?? [];
    downloadRosterPdf(activeFamily, rows, exportOptions);
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
          <input
            ref={sessionImportRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleSessionImport}
          />
          <button
            onClick={() => setShowUndoConfirm(true)}
            disabled={!hasEdits}
            title="Undo all session edits"
            className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 shadow-xs transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <Undo2 size={16} />
            Undo All
          </button>
          <button
            onClick={() => setShowTools((v) => !v)}
            title="Bulk sizing tools"
            aria-label="Bulk sizing tools"
            aria-expanded={showTools}
            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-xs transition ${
              showTools
                ? "border-(--primary-gold) bg-(--primary-gold)/10 text-(--primary-gold)"
                : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            }`}
          >
            <Wrench size={16} />
          </button>
          <button
            onClick={() => setShowNationFilter((v) => !v)}
            title="Filter roster"
            aria-label="Filter roster"
            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-xs transition ${
              showNationFilter || isFilterActive
                ? "border-(--primary-gold) bg-(--primary-gold)/10 text-(--primary-gold)"
                : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            }`}
          >
            <Filter size={16} />
          </button>
          <button
            onClick={() => setShowExportColumns((v) => !v)}
            title="Choose export columns"
            aria-label="Choose export columns"
            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-xs transition ${
              showExportColumns || isExportColumnsCustom
                ? "border-(--primary-gold) bg-(--primary-gold)/10 text-(--primary-gold)"
                : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            }`}
          >
            <Columns2 size={16} />
          </button>
          <button
            onClick={() => {
              downloadAllFamiliesCsv(exportRosters, exportOptions);
              toast.success("All families CSV downloaded");
            }}
            className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 shadow-xs transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <Download size={16} />
            Export All CSV
          </button>
          <button
            onClick={() => {
              downloadAllFamiliesPdf(exportRosters, exportOptions);
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
            {isFilterActive ? "Filtered count" : "All families"}
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

      {showTools && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Bulk Sizing Tools
              </h3>
              <p className="text-xs text-zinc-500">
                Session-only helpers for filling legacy sizes before export.
              </p>
            </div>
            <button
              onClick={() => setShowTools(false)}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Close bulk sizing tools"
            >
              <X size={16} />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col justify-between gap-3 rounded-xl border border-zinc-100 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-950/50">
              <div>
                <div className="flex items-center gap-2">
                  <Wand2 size={16} className="text-(--primary-gold)" />
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Estimate legacy sizes
                  </h4>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                  Runs on the family currently shown ({formatFamilyDisplayName(activeFamily)})
                  — switch families to do each table on its own. Fills label-only
                  sizes from the average chest of measured members in the same age
                  band and gender (blended with research baselines, computed across
                  all families), plus +{DEFAULT_CHEST_BUFFER_INCHES} in for error.
                  Bad DOBs (under {MIN_COMMUNITY_AGE}) or legacy sizes wildly larger
                  than the age suggests ignore age and fall back to the legacy size,
                  capped at XL. Rows appear as edited for export.
                </p>
              </div>
              <button
                onClick={() => handleEstimateLegacyForFamily(activeFamily)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <Wand2 size={14} />
                Estimate {activeFamily}
              </button>
            </div>
            <div className="flex flex-col justify-between gap-3 rounded-xl border border-zinc-100 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-950/50">
              <div>
                <div className="flex items-center gap-2">
                  <Upload size={16} className="text-(--primary-gold)" />
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Import session file
                  </h4>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                  Load a JSON session from{" "}
                  <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-[10px] dark:bg-zinc-800">
                    npm run estimate-legacy-sizes:session
                  </code>
                  . Merges with current member data.
                </p>
              </div>
              <button
                onClick={() => sessionImportRef.current?.click()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <Upload size={14} />
                Choose JSON file
              </button>
            </div>
          </div>
        </div>
      )}

      {showExportColumns && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Export Columns
              </h3>
              <p className="text-xs text-zinc-500">
                Choose which fields appear in CSV and PDF exports. The table
                always shows every column. Currently: {exportColumnsLabel}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={selectAllExportColumns}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-(--primary-gold) hover:bg-(--primary-gold)/10"
              >
                Select All
              </button>
              <button
                onClick={() => setShowExportColumns(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {EXPORT_COLUMN_OPTIONS.map((option) => {
              const checked = exportColumns.includes(option.key);
              return (
                <button
                  key={option.key}
                  onClick={() => toggleExportColumn(option.key)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                    checked
                      ? "border-(--primary-gold) bg-(--primary-gold)/10 text-(--primary-gold)"
                      : "border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {showNationFilter && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Filters
              </h3>
              <p className="text-xs text-zinc-500">
                Applies to the table, totals, and exports.
              </p>
            </div>
            <button
              onClick={() => setShowNationFilter(false)}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Nation of Residence
                  </h4>
                  <p className="text-xs text-zinc-500">{nationFilterLabel}</p>
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

            <div className="border-t border-zinc-100 pt-4 dark:border-zinc-800">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Shirt Size Type
                  </h4>
                  <p className="text-xs text-zinc-500">
                    {shirtSizeTypeFilterLabel}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllShirtSizeTypes}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-(--primary-gold) hover:bg-(--primary-gold)/10"
                  >
                    Select All
                  </button>
                  <button
                    onClick={clearShirtSizeTypeFilter}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {SHIRT_SIZE_TYPE_OPTIONS.map((type) => {
                  const checked = selectedShirtSizeTypes.includes(type);
                  return (
                    <button
                      key={type}
                      onClick={() => toggleShirtSizeType(type)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                        checked
                          ? "border-(--primary-gold) bg-(--primary-gold)/10 text-(--primary-gold)"
                          : "border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400"
                      }`}
                    >
                      {SHIRT_SIZE_TYPE_LABELS[type]}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                Legacy sizes use the old label-only field. Chest measurements
                include an entered inch value and mapped size.
              </p>
            </div>
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
                {isFilterActive && (
                  <p className="mt-1 text-xs text-zinc-500">
                    Showing {filteredFamilyRows.length} of {familyRows.length}
                    {isNationFilterActive && <> · Nations: {nationFilterLabel}</>}
                    {isShirtSizeTypeFilterActive && (
                      <> · Size types: {shirtSizeTypeFilterLabel}</>
                    )}
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
                onClick={() => handleEstimateLegacyForFamily(activeFamily)}
                title={`Estimate legacy sizes for ${formatFamilyDisplayName(activeFamily)} only`}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                <Wand2 size={14} />
                Estimate
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
                {renderSortHeader(
                  "Nickname",
                  "nick_name",
                  sortConfig,
                  handleSort,
                )}
                {renderSortHeader("Age", "age", sortConfig, handleSort, "w-24")}
                {renderSortHeader(
                  "T-Shirt Size",
                  "shirt_size",
                  sortConfig,
                  handleSort,
                  "w-32",
                )}
                {renderSortHeader(
                  "Nation of Residence",
                  "nation_of_residence",
                  sortConfig,
                  handleSort,
                )}
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
                    {familyRows.length === 0
                      ? "No members in this family yet. Use Add Row for manual entries."
                      : "No members match the current filters. Adjust the filters or add a manual row."}
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
                            onFocus={() => handleRowFocus(row.rowKey)}
                            onBlur={handleRowBlur}
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
                          onFocus={() => handleRowFocus(row.rowKey)}
                          onBlur={handleRowBlur}
                          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-(--primary-gold) dark:border-zinc-700 dark:bg-zinc-950"
                          placeholder="—"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <input
                            type="number"
                            min={20}
                            max={54}
                            step={0.5}
                            value={row.shirt_chest_inches ?? ""}
                            onChange={(e) =>
                              handleShirtChestChange(
                                activeFamily,
                                row.rowKey,
                                e.target.value,
                              )
                            }
                            onFocus={() => handleRowFocus(row.rowKey)}
                            onBlur={handleRowBlur}
                            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-(--primary-gold) dark:border-zinc-700 dark:bg-zinc-950"
                            placeholder={
                              row.shirt_size && row.shirt_chest_inches == null
                                ? `Legacy: ${row.shirt_size}`
                                : "Chest (in)"
                            }
                          />
                          {(row.shirt_chest_inches != null || row.shirt_size) && (
                            <p className="text-[10px] font-semibold text-(--primary-gold)">
                              {formatRosterShirtSize(row)}
                            </p>
                          )}
                        </div>
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
                          onFocus={() => handleRowFocus(row.rowKey)}
                          onBlur={handleRowBlur}
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

      {showUndoConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowUndoConfirm(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <Undo2 size={22} />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Undo all edits?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500">
              This clears every manual row and export-only change in this
              browser session. Member records in the database are not affected.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowUndoConfirm(false)}
                className="flex-1 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmUndoAllEdits}
                className="flex-1 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600"
              >
                Undo All
              </button>
            </div>
          </div>
        </div>
      )}

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
