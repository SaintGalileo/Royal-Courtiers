import {
  COMPETITION_FAMILIES,
  type CompetitionFamily,
  type EventName,
} from "@/lib/competitions";
import type { SupabaseClient } from "@supabase/supabase-js";

export type RosterSlot = {
  role?: string;
  name: string;
  secondName?: string;
};

export type RosterSlotData = {
  role?: string;
  name: string;
  memberId?: string | null;
  secondName?: string;
  secondMemberId?: string | null;
};

export type SupplementaryEntry = {
  name: string;
  memberId?: string | null;
};

export type FamilyRoster = Record<CompetitionFamily, RosterSlot[]>;

export type FamilyRosterData = Record<CompetitionFamily, RosterSlotData[]>;

export type CompetitionRostersData = {
  rosters: Partial<Record<EventName, FamilyRosterData>>;
  supplementary: Partial<
    Record<EventName, Record<CompetitionFamily, SupplementaryEntry[]>>
  >;
  /** Open (non-family) rosters for choral events. */
  openRosters: Partial<Record<EventName, RosterSlotData[]>>;
};

export const PARTICIPANTS_PENDING_NOTE =
  "Participant names will be published in due course.";

export const ROSTER_FAMILIES: CompetitionFamily[] = [...COMPETITION_FAMILIES];

const FAMILIES = ROSTER_FAMILIES;

function slots(...roles: string[]): RosterSlot[] {
  return roles.map((role) => ({ role, name: "TBA" }));
}

function forAllFamilies(template: RosterSlot[]): FamilyRoster {
  return Object.fromEntries(
    FAMILIES.map((family) => [
      family,
      template.map((slot) => ({ ...slot })),
    ]),
  ) as FamilyRoster;
}

const footballSlots = slots(
  "Player 1",
  "Player 2",
  "Player 3",
  "Player 4",
  "Player 5",
  "Player 6",
  "Player 7",
  "Player 8",
  "Player 9",
  "Player 10",
);

const volleyballSlots = slots(
  "Brother 1",
  "Brother 2",
  "Brother 3",
  "Brother 4",
  "Brother 5",
  "Brother 6",
  "Sister 1",
  "Sister 2",
  "Sister 3",
  "Sister 4",
  "Sister 5",
  "Sister 6",
);

const tableTennisSlots = slots("Male", "Female");

const trackSlots = slots(
  "100m Male",
  "100m Female",
  "200m Male",
  "200m Female",
  "400m Male",
  "400m Female",
  "4 × 100m Relay Male — Leg 1",
  "4 × 100m Relay Male — Leg 2",
  "4 × 100m Relay Male — Leg 3",
  "4 × 100m Relay Male — Leg 4",
  "4 × 100m Relay Female — Leg 1",
  "4 × 100m Relay Female — Leg 2",
  "4 × 100m Relay Female — Leg 3",
  "4 × 100m Relay Female — Leg 4",
);

const singlePlayerSlots = slots("Player");
const debateSlots = slots("Debater 1", "Debater 2", "Debater 3");
const siblingPairSlots = slots("Brother", "Sister");

/** Per-family participant slots. Replace "TBA" with real names when families submit. */
export const COMPETITION_ROSTERS: Partial<Record<EventName, FamilyRoster>> = {
  Football: forAllFamilies(footballSlots),
  Volleyball: forAllFamilies(volleyballSlots),
  "Table Tennis": forAllFamilies(tableTennisSlots),
  "Track Events": forAllFamilies(trackSlots),
  Chess: forAllFamilies(singlePlayerSlots),
  Scrabble: forAllFamilies(singlePlayerSlots),
  Debate: forAllFamilies(debateSlots),
  "Essay Writing": forAllFamilies(siblingPairSlots),
  Pageantry: forAllFamilies(siblingPairSlots),
};

/** Non-choral events that have competition rosters. */
export const ROSTER_EVENT_NAMES = Object.keys(
  COMPETITION_ROSTERS,
) as EventName[];

/** Choral events with unlimited open entries (not family-scoped). */
export const CHORAL_UNLIMITED_EVENTS: EventName[] = [
  "Composition Competition",
  "Solo",
  "Duet",
];

/** Fixed choirmaster slots for the Singing Competition (3 choirs max). */
export const SINGING_COMPETITION_SLOTS: RosterSlot[] = slots(
  "Choir 1 — Choirmaster",
  "Choir 2 — Choirmaster",
  "Choir 3 — Choirmaster",
);

/** All choral events that use open (non-family) rosters. */
export const CHORAL_ROSTER_EVENT_NAMES: EventName[] = [
  ...CHORAL_UNLIMITED_EVENTS,
  "Singing Competition",
];

/** Combined event tabs for the admin rosters page. */
export const ALL_ROSTER_EVENT_NAMES: EventName[] = [
  ...ROSTER_EVENT_NAMES,
  ...CHORAL_ROSTER_EVENT_NAMES,
];

export function isChoralRosterEvent(eventName: string): boolean {
  return CHORAL_ROSTER_EVENT_NAMES.includes(eventName as EventName);
}

export function isUnlimitedOpenRosterEvent(eventName: string): boolean {
  return CHORAL_UNLIMITED_EVENTS.includes(eventName as EventName);
}

export function getEventRoster(
  eventName: string,
): FamilyRoster | undefined {
  return COMPETITION_ROSTERS[eventName as EventName];
}

export function rosterHasPendingNames(roster: FamilyRoster): boolean {
  return FAMILIES.some((family) =>
    roster[family].some((slot) => slot.name === "TBA"),
  );
}

function emptySupplementaryForEvent(): Record<
  CompetitionFamily,
  SupplementaryEntry[]
> {
  return Object.fromEntries(
    FAMILIES.map((family) => [family, [] as SupplementaryEntry[]]),
  ) as Record<CompetitionFamily, SupplementaryEntry[]>;
}

function templateToSlotData(template: FamilyRoster): FamilyRosterData {
  return Object.fromEntries(
    FAMILIES.map((family) => [
      family,
      template[family].map((slot) => ({
        role: slot.role,
        name: slot.name,
        memberId: null,
      })),
    ]),
  ) as FamilyRosterData;
}

function singingTemplateToSlotData(): RosterSlotData[] {
  return SINGING_COMPETITION_SLOTS.map((slot) => ({
    role: slot.role,
    name: slot.name,
    memberId: null,
  }));
}

/** Empty document hydrated from slot templates (all TBA, empty supplementary). */
export function createEmptyCompetitionRostersData(): CompetitionRostersData {
  const rosters: CompetitionRostersData["rosters"] = {};
  const supplementary: CompetitionRostersData["supplementary"] = {};
  const openRosters: CompetitionRostersData["openRosters"] = {};

  for (const eventName of ROSTER_EVENT_NAMES) {
    const template = COMPETITION_ROSTERS[eventName];
    if (!template) continue;
    rosters[eventName] = templateToSlotData(template);
    supplementary[eventName] = emptySupplementaryForEvent();
  }

  for (const eventName of CHORAL_UNLIMITED_EVENTS) {
    openRosters[eventName] = [];
  }
  openRosters["Singing Competition"] = singingTemplateToSlotData();

  return { rosters, supplementary, openRosters };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseSlot(raw: unknown, fallbackRole?: string): RosterSlotData {
  if (!isPlainObject(raw)) {
    return { role: fallbackRole, name: "TBA", memberId: null };
  }
  const name =
    typeof raw.name === "string" && raw.name.trim()
      ? raw.name.trim()
      : "TBA";
  const role =
    typeof raw.role === "string"
      ? raw.role
      : fallbackRole;
  const memberId =
    typeof raw.memberId === "string"
      ? raw.memberId
      : raw.memberId === null
        ? null
        : null;
  return { role, name, memberId };
}

function mergeFamilySlots(
  template: RosterSlot[],
  stored: unknown,
): RosterSlotData[] {
  const storedList = Array.isArray(stored) ? stored : [];
  return template.map((slot, index) => {
    const matchByRole =
      slot.role != null
        ? storedList.find(
            (item) =>
              isPlainObject(item) &&
              typeof item.role === "string" &&
              item.role === slot.role,
          )
        : undefined;
    const match = matchByRole ?? storedList[index];
    const parsed = parseSlot(match, slot.role);
    return {
      role: slot.role,
      name: parsed.name,
      memberId: parsed.memberId ?? null,
    };
  });
}

function parseSupplementaryList(raw: unknown): SupplementaryEntry[] {
  if (!Array.isArray(raw)) return [];
  const result: SupplementaryEntry[] = [];
  for (const item of raw) {
    if (typeof item === "string" && item.trim()) {
      result.push({ name: item.trim(), memberId: null });
      continue;
    }
    if (!isPlainObject(item)) continue;
    const name =
      typeof item.name === "string" && item.name.trim()
        ? item.name.trim()
        : "";
    if (!name) continue;
    const memberId =
      typeof item.memberId === "string" ? item.memberId : null;
    result.push({ name, memberId });
  }
  return result;
}

function parseOpenSlotList(raw: unknown): RosterSlotData[] {
  if (!Array.isArray(raw)) return [];
  const result: RosterSlotData[] = [];
  for (const item of raw) {
    if (typeof item === "string" && item.trim()) {
      result.push({ name: item.trim(), memberId: null });
      continue;
    }
    if (!isPlainObject(item)) continue;
    const name =
      typeof item.name === "string" && item.name.trim()
        ? item.name.trim()
        : "";
    if (!name || name === "TBA") {
      // Keep TBA rows only when they carry a role (fixed singing slots).
      const role = typeof item.role === "string" ? item.role : undefined;
      if (!role) continue;
      result.push({
        role,
        name: "TBA",
        memberId:
          typeof item.memberId === "string" ? item.memberId : null,
      });
      continue;
    }
    const role = typeof item.role === "string" ? item.role : undefined;
    const memberId =
      typeof item.memberId === "string" ? item.memberId : null;
    const secondName =
      typeof item.secondName === "string" && item.secondName.trim()
        ? item.secondName.trim()
        : undefined;
    const secondMemberId =
      typeof item.secondMemberId === "string" ? item.secondMemberId : null;
    result.push({ role, name, memberId, secondName, secondMemberId });
  }
  return result;
}

/** Merge DB JSON onto templates so slot structure always matches code. */
export function parseCompetitionRostersData(
  raw: unknown,
): CompetitionRostersData {
  const base = createEmptyCompetitionRostersData();
  if (!isPlainObject(raw)) return base;

  const rawRosters = isPlainObject(raw.rosters) ? raw.rosters : {};
  const rawSupplementary = isPlainObject(raw.supplementary)
    ? raw.supplementary
    : {};
  const rawOpenRosters = isPlainObject(raw.openRosters)
    ? raw.openRosters
    : {};

  for (const eventName of ROSTER_EVENT_NAMES) {
    const template = COMPETITION_ROSTERS[eventName];
    if (!template) continue;

    const eventStored = isPlainObject(rawRosters[eventName])
      ? rawRosters[eventName]
      : {};

    base.rosters[eventName] = Object.fromEntries(
      FAMILIES.map((family) => [
        family,
        mergeFamilySlots(template[family], eventStored[family]),
      ]),
    ) as FamilyRosterData;

    const suppStored = isPlainObject(rawSupplementary[eventName])
      ? rawSupplementary[eventName]
      : {};

    base.supplementary[eventName] = Object.fromEntries(
      FAMILIES.map((family) => [
        family,
        parseSupplementaryList(suppStored[family]),
      ]),
    ) as Record<CompetitionFamily, SupplementaryEntry[]>;
  }

  for (const eventName of CHORAL_UNLIMITED_EVENTS) {
    base.openRosters[eventName] = parseOpenSlotList(
      rawOpenRosters[eventName],
    )
      .filter((slot) => slot.name !== "TBA")
      .map((slot) =>
        eventName === "Duet"
          ? {
              ...slot,
              secondName: slot.secondName?.trim() || "TBA",
              secondMemberId: slot.secondMemberId ?? null,
            }
          : slot,
      );
  }

  base.openRosters["Singing Competition"] = mergeFamilySlots(
    SINGING_COMPETITION_SLOTS,
    rawOpenRosters["Singing Competition"],
  );

  return base;
}

export function serializeCompetitionRostersData(
  data: CompetitionRostersData,
): CompetitionRostersData {
  return parseCompetitionRostersData(data);
}

/** Family roster view for public UI (drops memberId). */
export function getMergedEventRoster(
  data: CompetitionRostersData,
  eventName: string,
): FamilyRoster | undefined {
  const template = getEventRoster(eventName);
  if (!template) return undefined;

  const stored = data.rosters[eventName as EventName];
  return Object.fromEntries(
    FAMILIES.map((family) => [
      family,
      (stored?.[family] ?? template[family]).map((slot) => ({
        role: slot.role,
        name: slot.name?.trim() ? slot.name : "TBA",
      })),
    ]),
  ) as FamilyRoster;
}

/** Open (choral) roster view for public UI (drops memberId). */
export function getMergedOpenEventRoster(
  data: CompetitionRostersData,
  eventName: string,
): RosterSlot[] | undefined {
  if (!isChoralRosterEvent(eventName)) return undefined;

  const stored = data.openRosters[eventName as EventName] ?? [];

  if (eventName === "Singing Competition") {
    return mergeFamilySlots(SINGING_COMPETITION_SLOTS, stored).map((slot) => ({
      role: slot.role,
      name: slot.name?.trim() ? slot.name : "TBA",
    }));
  }

  return stored
    .filter((slot) => slot.name?.trim() && slot.name !== "TBA")
    .map((slot, index) => ({
      role:
        slot.role ??
        `${eventName === "Duet" ? "Duo" : "Entrant"} ${index + 1}`,
      name: slot.name.trim(),
      secondName:
        eventName === "Duet"
          ? slot.secondName?.trim() || "TBA"
          : undefined,
    }));
}

export async function fetchCompetitionRosters(
  supabase: SupabaseClient,
): Promise<CompetitionRostersData> {
  const { data, error } = await supabase
    .from("competition_rosters")
    .select("data")
    .eq("id", "current")
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch competition rosters:", error);
    return createEmptyCompetitionRostersData();
  }

  if (!data) return createEmptyCompetitionRostersData();
  return parseCompetitionRostersData(data.data);
}

/** Maps a track match round + gender to the roster role prefix(es) for that race. */
export function getTrackRaceRolePrefix(
  round: string,
  gender?: "male" | "female" | "mixed",
): string | null {
  if (!gender || gender === "mixed") return null;

  const genderLabel = gender === "male" ? "Male" : "Female";
  const normalized = round.replace(/\s+Final$/i, "").trim();

  if (/^100m$/i.test(normalized)) return `100m ${genderLabel}`;
  if (/^200m$/i.test(normalized)) return `200m ${genderLabel}`;
  if (/^400m$/i.test(normalized)) return `400m ${genderLabel}`;
  if (/4\s*[×x]\s*100m\s*Relay/i.test(normalized)) {
    return `4 × 100m Relay ${genderLabel}`;
  }
  return null;
}

/** Filter family slots to the relevant race (track) or gender category when context is provided. */
export function filterRosterSlots(
  slots: RosterSlot[],
  options: {
    eventName: string;
    round?: string;
    gender?: "male" | "female" | "mixed";
  },
): RosterSlot[] {
  const { eventName, round, gender } = options;

  if (eventName === "Track Events" && round) {
    const prefix = getTrackRaceRolePrefix(round, gender);
    if (prefix) {
      return slots.filter(
        (slot) =>
          slot.role === prefix || slot.role?.startsWith(`${prefix} —`),
      );
    }
  }

  if (eventName === "Table Tennis" && gender && gender !== "mixed") {
    const role = gender === "male" ? "Male" : "Female";
    return slots.filter((slot) => slot.role === role);
  }

  return slots;
}

export function getRosterSubtitle(
  eventName: string,
  round?: string,
  gender?: "male" | "female" | "mixed",
): string {
  if (eventName === "Track Events" && round) {
    const prefix = getTrackRaceRolePrefix(round, gender);
    if (prefix) return `${prefix} — Participants`;
  }
  if (eventName === "Table Tennis" && gender && gender !== "mixed") {
    return `Table Tennis (${gender === "male" ? "Male" : "Female"}) — Participants`;
  }
  return `${eventName} — Participants`;
}

export function formatMemberDisplayName(member: {
  first_name?: string | null;
  last_name?: string | null;
  nick_name?: string | null;
}): string {
  const first = member.first_name?.trim() ?? "";
  const last = member.last_name?.trim() ?? "";
  const full = `${first} ${last}`.trim();
  return full || member.nick_name?.trim() || "Unknown";
}
