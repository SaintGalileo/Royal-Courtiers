import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const FAMILY_OPTIONS = [
  "Dominion",
  "Light",
  "Power",
  "Virtue",
  "Seraphs",
] as const;

export type Family = (typeof FAMILY_OPTIONS)[number];

export const SHIRT_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"] as const;

export const SESSION_STORAGE_KEY = "admin-t-shirts-session-v1";

const LEGACY_SESSION_KEYS = [
  "family-roster-session-v1",
  "family-roster-session-v2",
];

export type MemberSeed = {
  id: string;
  first_name: string;
  nick_name: string;
  date_of_birth: string | null;
  shirt_size: string;
  nation_of_residence: string;
  family: string;
};

export type RosterRow = {
  rowKey: string;
  source: "member" | "manual";
  memberId?: string;
  nick_name: string;
  age: number | null;
  shirt_size: string;
  nation_of_residence: string;
  defaultNickName?: string;
  defaultAge?: number | null;
  defaultShirtSize?: string;
  defaultNation?: string;
};

export type RosterSession = {
  rosters: Record<Family, RosterRow[]>;
  selectedNations: string[];
};

export type RosterSortKey =
  | "nick_name"
  | "age"
  | "shirt_size"
  | "nation_of_residence";

export type SortDirection = "asc" | "desc";

export type RosterSortConfig = {
  key: RosterSortKey;
  direction: SortDirection;
} | null;

function createRowKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `manual-${crypto.randomUUID()}`;
  }
  return `manual-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function shirtSizeOrder(size: string): number {
  const idx = SHIRT_SIZES.indexOf(size as (typeof SHIRT_SIZES)[number]);
  return idx === -1 ? SHIRT_SIZES.length : idx;
}

export function calculateAge(dob: string | null): number | null {
  if (!dob) return null;
  const today = new Date();
  const pastDate = new Date(dob);
  let age = today.getFullYear() - pastDate.getFullYear();
  const m = today.getMonth() - pastDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < pastDate.getDate())) {
    age--;
  }
  return age;
}

export function formatFamilyDisplayName(family: string): string {
  if (family === "Seraphs") return "Seraphs";
  return `Family of ${family}`;
}

export function memberToDefaultRow(member: MemberSeed): RosterRow {
  const nick = member.nick_name?.trim() || member.first_name;
  const age = calculateAge(member.date_of_birth);
  const nation = member.nation_of_residence || "";
  return {
    rowKey: member.id,
    source: "member",
    memberId: member.id,
    nick_name: nick,
    age,
    shirt_size: member.shirt_size || "M",
    nation_of_residence: nation,
    defaultNickName: nick,
    defaultAge: age,
    defaultShirtSize: member.shirt_size || "M",
    defaultNation: nation,
  };
}

export function resolveFamilyRoster(
  members: MemberSeed[],
  family: Family,
): RosterRow[] {
  const familyMembers = members.filter((m) => m.family === family);
  return sortByShirtSize(familyMembers.map(memberToDefaultRow));
}

export function resolveAllFamilyRosters(
  members: MemberSeed[],
): Record<Family, RosterRow[]> {
  return FAMILY_OPTIONS.reduce(
    (acc, family) => {
      acc[family] = resolveFamilyRoster(members, family);
      return acc;
    },
    {} as Record<Family, RosterRow[]>,
  );
}

export function sortByShirtSize(rows: RosterRow[]): RosterRow[] {
  const sizeIndex = new Map(SHIRT_SIZES.map((s, i) => [s, i]));

  return [...rows].sort((a, b) => {
    const aIdx = sizeIndex.get(a.shirt_size as (typeof SHIRT_SIZES)[number]);
    const bIdx = sizeIndex.get(b.shirt_size as (typeof SHIRT_SIZES)[number]);
    const aOrder = aIdx !== undefined ? aIdx : SHIRT_SIZES.length;
    const bOrder = bIdx !== undefined ? bIdx : SHIRT_SIZES.length;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.nick_name.localeCompare(b.nick_name);
  });
}

export function sortRosterRows(
  rows: RosterRow[],
  sortConfig: RosterSortConfig,
): RosterRow[] {
  if (!sortConfig) return [...rows];

  const { key, direction } = sortConfig;
  const factor = direction === "asc" ? 1 : -1;

  return [...rows].sort((a, b) => {
    if (key === "shirt_size") {
      const diff = shirtSizeOrder(a.shirt_size) - shirtSizeOrder(b.shirt_size);
      if (diff !== 0) return diff * factor;
      return a.nick_name.localeCompare(b.nick_name) * factor;
    }

    if (key === "age") {
      const aAge = a.age ?? -1;
      const bAge = b.age ?? -1;
      if (aAge !== bAge) return (aAge - bAge) * factor;
      return a.nick_name.localeCompare(b.nick_name) * factor;
    }

    const aVal = (a[key] ?? "").toString().toLowerCase();
    const bVal = (b[key] ?? "").toString().toLowerCase();
    return aVal.localeCompare(bVal) * factor;
  });
}

export const DEFAULT_ROSTER_SORT: RosterSortConfig = {
  key: "shirt_size",
  direction: "asc",
};

export function collectNations(
  rosters: Record<Family, RosterRow[]>,
): string[] {
  const nations = new Set<string>();
  for (const family of FAMILY_OPTIONS) {
    for (const row of rosters[family] ?? []) {
      const nation = row.nation_of_residence?.trim();
      if (nation) nations.add(nation);
    }
  }
  return Array.from(nations).sort((a, b) => a.localeCompare(b));
}

export function filterRowsByNations(
  rows: RosterRow[],
  selectedNations: string[],
  allNations: string[],
): RosterRow[] {
  if (selectedNations.length === 0) return [];
  if (selectedNations.length === allNations.length) return rows;
  const selected = new Set(
    selectedNations.map((n) => n.trim().toLowerCase()).filter(Boolean),
  );
  return rows.filter((row) => {
    const nation = row.nation_of_residence.trim().toLowerCase();
    if (!nation) return row.source === "manual";
    return selected.has(nation);
  });
}

export function filterAllRostersByNations(
  rosters: Record<Family, RosterRow[]>,
  selectedNations: string[],
  allNations: string[],
): Record<Family, RosterRow[]> {
  return FAMILY_OPTIONS.reduce(
    (acc, family) => {
      acc[family] = filterRowsByNations(
        rosters[family] ?? [],
        selectedNations,
        allNations,
      );
      return acc;
    },
    {} as Record<Family, RosterRow[]>,
  );
}

/** Nation filter for display — keeps a focused row visible while editing. */
export function filterRowsForDisplay(
  rows: RosterRow[],
  selectedNations: string[],
  allNations: string[],
  pinnedRowKey?: string | null,
): RosterRow[] {
  const filtered = filterRowsByNations(rows, selectedNations, allNations);
  if (!pinnedRowKey || filtered.some((r) => r.rowKey === pinnedRowKey)) {
    return filtered;
  }
  const pinned = rows.find((r) => r.rowKey === pinnedRowKey);
  return pinned ? [...filtered, pinned] : filtered;
}

export function buildSizeBreakdown(
  rows: { shirt_size: string }[],
): Record<string, number> {
  const breakdown: Record<string, number> = {};
  for (const size of SHIRT_SIZES) breakdown[size] = 0;
  for (const row of rows) {
    const key = row.shirt_size || "Unknown";
    breakdown[key] = (breakdown[key] ?? 0) + 1;
  }
  return breakdown;
}

export function buildSummary(family: string, rows: RosterRow[]) {
  const breakdown = buildSizeBreakdown(rows);
  const parts = SHIRT_SIZES.filter((s) => breakdown[s] > 0).map(
    (s) => `${s} (${breakdown[s]})`,
  );
  const displayName = formatFamilyDisplayName(family);
  const text = `${displayName} — Total strength: ${rows.length}. Size breakdown: ${parts.join(", ") || "None"}.`;
  return { total: rows.length, breakdown, text, displayName };
}

export function rosterToCsv(
  family: string,
  rows: RosterRow[],
  nationFilterLabel?: string,
): string {
  const { displayName, total, breakdown } = buildSummary(family, rows);
  const breakdownLine = SHIRT_SIZES.filter((s) => breakdown[s] > 0)
    .map((s) => `${s}=${breakdown[s]}`)
    .join(", ");

  const lines = [
    displayName,
    `Total Strength: ${total}`,
    `Size Breakdown: ${breakdownLine || "None"}`,
    ...(nationFilterLabel ? [`Nations: ${nationFilterLabel}`] : []),
    "",
    "Nickname,Age,T-Shirt Size,Nation of Residence",
    ...rows.map(
      (r) =>
        `"${r.nick_name.replace(/"/g, '""')}",${r.age ?? ""},${r.shirt_size},"${r.nation_of_residence.replace(/"/g, '""')}"`,
    ),
  ];
  return lines.join("\n");
}

export function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadAllFamiliesCsv(
  rosters: Record<Family, RosterRow[]>,
  nationFilterLabel?: string,
): void {
  const sections = FAMILY_OPTIONS.map((family) =>
    rosterToCsv(family, rosters[family] ?? [], nationFilterLabel),
  );
  downloadCsv("anniversary-tshirts-all-families.csv", sections.join("\n\n"));
}

function addFamilyToPdf(
  doc: jsPDF,
  family: string,
  rows: RosterRow[],
  nationFilterLabel?: string,
  startY = 20,
): number {
  const { displayName, text, total } = buildSummary(family, rows);
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(displayName, pageWidth / 2, startY, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const summaryText = nationFilterLabel
    ? `${text}\nNations: ${nationFilterLabel}`
    : text;
  const summaryLines = doc.splitTextToSize(summaryText, pageWidth - 28);
  doc.text(summaryLines, 14, startY + 10);

  const tableStartY = startY + 10 + summaryLines.length * 5 + 4;

  autoTable(doc, {
    startY: tableStartY,
    head: [["#", "Nickname", "Age", "T-Shirt Size", "Nation"]],
    body: rows.map((row, idx) => [
      String(idx + 1),
      row.nick_name,
      row.age !== null ? String(row.age) : "",
      row.shirt_size,
      row.nation_of_residence,
    ]),
    theme: "striped",
    headStyles: { fillColor: [180, 140, 50] },
    margin: { left: 14, right: 14 },
  });

  const finalY =
    (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
      ?.finalY ?? tableStartY + 20;

  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text(
    `Exported ${new Date().toLocaleString()} · ${total} members`,
    14,
    finalY + 8,
  );
  doc.setTextColor(0);

  return finalY;
}

export function downloadRosterPdf(
  family: string,
  rows: RosterRow[],
  nationFilterLabel?: string,
): void {
  const doc = new jsPDF();
  addFamilyToPdf(doc, family, rows, nationFilterLabel);
  const slug = family.toLowerCase().replace(/\s+/g, "-");
  doc.save(`anniversary-tshirts-${slug}.pdf`);
}

export function downloadAllFamiliesPdf(
  rosters: Record<Family, RosterRow[]>,
  nationFilterLabel?: string,
): void {
  const doc = new jsPDF();

  FAMILY_OPTIONS.forEach((family, index) => {
    if (index > 0) doc.addPage();
    addFamilyToPdf(doc, family, rosters[family] ?? [], nationFilterLabel, 20);
  });

  doc.save("anniversary-tshirts-all-families.pdf");
}

export function rowDiffersFromDefault(row: RosterRow): boolean {
  if (row.source !== "member") return false;
  return (
    row.nick_name !== row.defaultNickName ||
    row.age !== row.defaultAge ||
    row.shirt_size !== row.defaultShirtSize ||
    row.nation_of_residence !== row.defaultNation
  );
}

export function createManualRow(): RosterRow {
  return {
    rowKey: createRowKey(),
    source: "manual",
    nick_name: "",
    age: null,
    shirt_size: "",
    nation_of_residence: "",
  };
}

export function mergeSessionRosters(
  defaults: Record<Family, RosterRow[]>,
  sessionRosters: Record<Family, RosterRow[]>,
): Record<Family, RosterRow[]> {
  return FAMILY_OPTIONS.reduce(
    (acc, family) => {
      const defaultRows = defaults[family] ?? [];
      const sessionRows = sessionRosters[family] ?? [];
      const sessionByMemberId = new Map(
        sessionRows
          .filter((r) => r.memberId)
          .map((r) => [r.memberId as string, r]),
      );
      const manualRows = sessionRows.filter((r) => r.source === "manual");

      const memberRows = defaultRows.map((row) => {
        const override = row.memberId
          ? sessionByMemberId.get(row.memberId)
          : undefined;
        return override ?? row;
      });

      acc[family] = [...manualRows, ...memberRows];
      return acc;
    },
    {} as Record<Family, RosterRow[]>,
  );
}

export function loadSession(): RosterSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RosterSession;
  } catch {
    return null;
  }
}

export function saveSession(session: RosterSession): boolean {
  if (typeof window === "undefined") return false;
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    return true;
  } catch {
    return false;
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    for (const key of LEGACY_SESSION_KEYS) {
      sessionStorage.removeItem(key);
    }
  } catch {
    // ignore
  }
}

export function rostersHaveEdits(
  rosters: Record<Family, RosterRow[]>,
  defaults: Record<Family, RosterRow[]>,
): boolean {
  for (const family of FAMILY_OPTIONS) {
    const current = rosters[family] ?? [];
    const defaultRows = defaults[family] ?? [];

    if (current.some((r) => r.source === "manual")) return true;
    if (current.length !== defaultRows.length) return true;

    for (const row of current) {
      if (row.source === "member" && rowDiffersFromDefault(row)) return true;
    }
  }
  return false;
}

export function formatNationFilterLabel(
  selectedNations: string[],
  allNations: string[],
): string {
  if (selectedNations.length === 0) return "None selected";
  if (selectedNations.length === allNations.length) return "All nations";
  return selectedNations.join(", ");
}
