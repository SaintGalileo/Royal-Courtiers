export const FAMILIES = ["Dominion", "Light", "Power", "Virtue"] as const;

export type FamilyName = (typeof FAMILIES)[number];

export const CATEGORIES = {
  "Sports Arena": [
    "Football",
    "Volleyball",
    "Table Tennis (Male)",
    "Table Tennis (Female)",
    "100m (Male)",
    "100m (Female)",
    "200m (Male)",
    "200m (Female)",
    "400m (Male)",
    "400m (Female)",
    "4 × 100m Relay (Male)",
    "4 × 100m Relay (Female)",
    // "Sack Race (Junior Male)",
    // "Sack Race (Junior Female)",
    // "Egg Race (Junior Male)",
    // "Egg Race (Junior Female)",
    // "Filling the Basket (Junior Male)",
    // "Filling the Basket (Junior Female)",
    "Chess",
    "Scrabble",
  ],
  "Extracurricular Competitions": ["Debate", "Essay Writing", "Pageantry"],
} as const;

export type CategoryName = keyof typeof CATEGORIES;

export type ScoresType = Record<
  string,
  Record<string, Record<string, number>>
>;

export const CONDUCT_STARTING_POINTS = 50;

export const ROSTER_SUBMISSION_DEADLINE = "July 18, 2026";

export const PENALTY_TYPES = {
  lateRosterSubmission: {
    label: "Late roster submission",
    points: -5,
    description: `All participants must be submitted together by ${ROSTER_SUBMISSION_DEADLINE}.`,
    scope: "family" as const,
  },
  unregisteredParticipant: {
    label: "Unregistered participant",
    points: -10,
    description:
      "A competitor took part without being on the submitted roster.",
    scope: "event" as const,
  },
  lateness: {
    label: "Lateness",
    points: -5,
    description:
      "Arrived late to a scheduled event or missed a submission deadline (e.g. essay).",
    scope: "event" as const,
  },
  noShow: {
    label: "No-show",
    points: -10,
    description:
      "More than 30 minutes late, or failed to appear for a scheduled event.",
    scope: "event" as const,
  },
  unsportingConduct: {
    label: "Unsporting conduct",
    points: -10,
    description:
      "Ejection, fighting, refusing officials, or similar misconduct.",
    scope: "event" as const,
  },
} as const;

export type PenaltyTypeKey = keyof typeof PENALTY_TYPES;

export type EventPenaltyTypeKey = {
  [K in PenaltyTypeKey]: (typeof PENALTY_TYPES)[K]["scope"] extends "event"
    ? K
    : never;
}[PenaltyTypeKey];

export type FamilyPenaltyTypeKey = {
  [K in PenaltyTypeKey]: (typeof PENALTY_TYPES)[K]["scope"] extends "family"
    ? K
    : never;
}[PenaltyTypeKey];

export const EVENT_PENALTY_TYPE_KEYS = (
  Object.keys(PENALTY_TYPES) as PenaltyTypeKey[]
).filter((key) => PENALTY_TYPES[key].scope === "event") as EventPenaltyTypeKey[];

export const FAMILY_PENALTY_TYPE_KEYS = (
  Object.keys(PENALTY_TYPES) as PenaltyTypeKey[]
).filter(
  (key) => PENALTY_TYPES[key].scope === "family",
) as FamilyPenaltyTypeKey[];

/** Per-event penalties (excludes unified family-level penalties). */
export type PenaltiesType = Record<
  string,
  Record<string, Record<string, EventPenaltyTypeKey[]>>
>;

export type FamilyPenaltiesType = Partial<
  Record<FamilyName, FamilyPenaltyTypeKey[]>
>;

export type ScoresheetData = {
  scores: ScoresType;
  penalties?: PenaltiesType;
  familyPenalties?: FamilyPenaltiesType;
};

export function getMaxScore(event: string): number {
  if (event === "Football") return 100;
  if (event === "Volleyball") return 100;
  if (event === "Debate") return 200;
  if (event === "Essay Writing") return 100;
  if (event === "Pageantry") return 200;
  return 50;
}

export function getPositionFromScore(score: number, maxScore: number): string {
  if (!score) return "";
  if (score >= maxScore) return "1";
  if (score >= maxScore * 0.8) return "2";
  if (score >= maxScore * 0.6) return "3";
  if (score >= maxScore * 0.4) return "4";
  return "";
}

export function scoreFromPosition(position: string, maxScore: number): number {
  if (position === "1") return maxScore;
  if (position === "2") return maxScore * 0.8;
  if (position === "3") return maxScore * 0.6;
  if (position === "4") return maxScore * 0.4;
  return 0;
}

export type ScoresheetEventRef = {
  category: CategoryName;
  event: string;
};

export type FamilyPlacement = {
  family: FamilyName;
  position: 1 | 2 | 3 | 4;
  points: number;
};

const POSITION_LABELS: Record<1 | 2 | 3 | 4, string> = {
  1: "1st",
  2: "2nd",
  3: "3rd",
  4: "4th",
};

export function formatPlacementLabel(position: 1 | 2 | 3 | 4): string {
  return POSITION_LABELS[position];
}

/** Map a track fixture round + gender onto the scoresheet event key. */
export function getTrackScoresheetEvent(
  round?: string,
  gender?: "male" | "female" | "mixed",
): string | null {
  if (!round || !gender || gender === "mixed") return null;
  const genderLabel = gender === "male" ? "Male" : "Female";
  const normalized = round.replace(/\s+Final$/i, "").trim();
  if (/^100m$/i.test(normalized)) return `100m (${genderLabel})`;
  if (/^200m$/i.test(normalized)) return `200m (${genderLabel})`;
  if (/^400m$/i.test(normalized)) return `400m (${genderLabel})`;
  if (/4\s*[×x]\s*100m\s*Relay/i.test(normalized)) {
    return `4 × 100m Relay (${genderLabel})`;
  }
  return null;
}

/**
 * Resolve the scoresheet category/event for a graded fixture card.
 * Returns null for head-to-head matches and events not on the family scoresheet (e.g. Choral).
 */
export function getScoresheetEventForFixture(fixture: {
  type: string;
  round?: string;
  gender?: "male" | "female" | "mixed";
  isGraded?: boolean;
}): ScoresheetEventRef | null {
  if (!fixture.isGraded) return null;

  if (fixture.type === "Track Events") {
    const event = getTrackScoresheetEvent(fixture.round, fixture.gender);
    if (!event) return null;
    return { category: "Sports Arena", event };
  }

  if (fixture.type === "Essay Writing") {
    return {
      category: "Extracurricular Competitions",
      event: "Essay Writing",
    };
  }

  if (fixture.type === "Pageantry") {
    return {
      category: "Extracurricular Competitions",
      event: "Pageantry",
    };
  }

  return null;
}

/**
 * Whether this fixture card should display scoresheet standings.
 * Essay results appear on the submission card; Pageantry on the final phase.
 */
export function fixtureShowsScoresheetResults(fixture: {
  type: string;
  id?: string;
  isGraded?: boolean;
  isFinal?: boolean;
}): boolean {
  if (!fixture.isGraded) return false;
  if (fixture.type === "Essay Writing") {
    return fixture.id === "e-submit-essay";
  }
  if (fixture.type === "Pageantry") {
    return Boolean(fixture.isFinal) || fixture.id === "e-pageant2";
  }
  return true;
}

/** Build ordered family placements from scoresheet points for one event. */
export function getFamilyPlacementsForEvent(
  scores: ScoresType,
  category: string,
  event: string,
): FamilyPlacement[] {
  const maxScore = getMaxScore(event);
  const eventScores = scores[category]?.[event];
  if (!eventScores) return [];

  const placements: FamilyPlacement[] = [];
  for (const family of FAMILIES) {
    const points = eventScores[family] ?? 0;
    const pos = getPositionFromScore(points, maxScore);
    if (pos !== "1" && pos !== "2" && pos !== "3" && pos !== "4") continue;
    placements.push({
      family,
      position: Number(pos) as 1 | 2 | 3 | 4,
      points,
    });
  }

  return placements.sort((a, b) => a.position - b.position);
}

export function createEmptyScores(): ScoresType {
  const initial: ScoresType = {};
  Object.entries(CATEGORIES).forEach(([cat, events]) => {
    initial[cat] = {};
    events.forEach((ev) => {
      initial[cat][ev] = {};
      FAMILIES.forEach((fam) => {
        initial[cat][ev][fam] = 0;
      });
    });
  });
  return initial;
}

export function createEmptyPenalties(): PenaltiesType {
  return {};
}

export function createEmptyFamilyPenalties(): FamilyPenaltiesType {
  return {};
}

export function createEmptyScoresheetData(): ScoresheetData {
  return {
    scores: createEmptyScores(),
    penalties: createEmptyPenalties(),
    familyPenalties: createEmptyFamilyPenalties(),
  };
}

function isFamilyName(name: string): name is FamilyName {
  return (FAMILIES as readonly string[]).includes(name);
}

function isEventPenaltyKey(key: string): key is EventPenaltyTypeKey {
  return (EVENT_PENALTY_TYPE_KEYS as readonly string[]).includes(key);
}

function isFamilyPenaltyKey(key: string): key is FamilyPenaltyTypeKey {
  return (FAMILY_PENALTY_TYPE_KEYS as readonly string[]).includes(key);
}

/** Pull late roster flags out of legacy per-event penalty lists. */
function normalizePenalties(
  penalties: PenaltiesType | undefined,
  familyPenalties: FamilyPenaltiesType | undefined,
): { penalties: PenaltiesType; familyPenalties: FamilyPenaltiesType } {
  const normalizedPenalties: PenaltiesType = {};
  const normalizedFamily: FamilyPenaltiesType = {
    ...(familyPenalties ?? {}),
  };

  if (!penalties) {
    return {
      penalties: normalizedPenalties,
      familyPenalties: normalizedFamily,
    };
  }

  Object.entries(penalties).forEach(([category, events]) => {
    normalizedPenalties[category] = {};
    Object.entries(events).forEach(([event, families]) => {
      normalizedPenalties[category][event] = {};
      Object.entries(families).forEach(([family, keys]) => {
        const eventKeys: EventPenaltyTypeKey[] = [];
        (keys as PenaltyTypeKey[]).forEach((key) => {
          if (key === "lateRosterSubmission" && isFamilyName(family)) {
            const existing = normalizedFamily[family] ?? [];
            if (!existing.includes("lateRosterSubmission")) {
              normalizedFamily[family] = [
                ...existing,
                "lateRosterSubmission",
              ];
            }
            return;
          }
          if (isEventPenaltyKey(key)) {
            eventKeys.push(key);
          }
        });
        if (eventKeys.length > 0) {
          normalizedPenalties[category][event][family] = eventKeys;
        }
      });
    });
  });

  return {
    penalties: normalizedPenalties,
    familyPenalties: normalizedFamily,
  };
}

/** Normalize legacy flat scores blob or full ScoresheetData from Supabase. */
export function parseScoresheetData(raw: unknown): ScoresheetData {
  if (!raw || typeof raw !== "object") {
    return createEmptyScoresheetData();
  }

  const obj = raw as Record<string, unknown>;

  if ("scores" in obj && obj.scores && typeof obj.scores === "object") {
    const scores = mergeWithDefaults(obj.scores as ScoresType);
    const { penalties, familyPenalties } = normalizePenalties(
      obj.penalties as PenaltiesType | undefined,
      obj.familyPenalties as FamilyPenaltiesType | undefined,
    );
    return { scores, penalties, familyPenalties };
  }

  return {
    scores: mergeWithDefaults(obj as ScoresType),
    penalties: createEmptyPenalties(),
    familyPenalties: createEmptyFamilyPenalties(),
  };
}

function mergeWithDefaults(partial: ScoresType): ScoresType {
  const base = createEmptyScores();
  Object.entries(CATEGORIES).forEach(([cat, events]) => {
    events.forEach((ev) => {
      FAMILIES.forEach((fam) => {
        const val = partial[cat]?.[ev]?.[fam];
        if (typeof val === "number") {
          base[cat][ev][fam] = val;
        }
      });
    });
  });
  return base;
}

export function serializeScoresheetData(data: ScoresheetData): ScoresheetData {
  const { penalties, familyPenalties } = normalizePenalties(
    data.penalties,
    data.familyPenalties,
  );
  return {
    scores: data.scores,
    penalties,
    familyPenalties,
  };
}

export function getPenaltiesForCell(
  penalties: PenaltiesType | undefined,
  category: string,
  event: string,
  family: string,
): EventPenaltyTypeKey[] {
  return penalties?.[category]?.[event]?.[family] ?? [];
}

export function getFamilyPenalties(
  familyPenalties: FamilyPenaltiesType | undefined,
  family: string,
): FamilyPenaltyTypeKey[] {
  if (!isFamilyName(family)) return [];
  return familyPenalties?.[family] ?? [];
}

export function hasFamilyPenalty(
  familyPenalties: FamilyPenaltiesType | undefined,
  family: string,
  key: FamilyPenaltyTypeKey,
): boolean {
  return getFamilyPenalties(familyPenalties, family).includes(key);
}

function sumPenaltyPoints(keys: PenaltyTypeKey[]): number {
  return keys.reduce((sum, key) => sum + PENALTY_TYPES[key].points, 0);
}

export function countFamilyIncidents(
  penalties: PenaltiesType | undefined,
  familyPenalties: FamilyPenaltiesType | undefined,
  family: string,
): number {
  let count = getFamilyPenalties(familyPenalties, family).length;
  if (!penalties) return count;

  Object.values(penalties).forEach((categoryPenalties) => {
    Object.values(categoryPenalties).forEach((eventPenalties) => {
      const list = eventPenalties[family];
      if (list) count += list.length;
    });
  });
  return count;
}

export function getConductScore(
  penalties: PenaltiesType | undefined,
  familyPenalties: FamilyPenaltiesType | undefined,
  family: string,
): number {
  let total = CONDUCT_STARTING_POINTS + sumPenaltyPoints(
    getFamilyPenalties(familyPenalties, family),
  );

  if (!penalties) return Math.max(0, total);

  Object.values(penalties).forEach((categoryPenalties) => {
    Object.values(categoryPenalties).forEach((eventPenalties) => {
      const list = eventPenalties[family];
      if (!list) return;
      total += sumPenaltyPoints(list);
    });
  });

  return Math.max(0, total);
}

export function getCompetitionTotal(scores: ScoresType, family: string): number {
  let total = 0;
  Object.values(scores).forEach((categoryScores) => {
    Object.values(categoryScores).forEach((eventScores) => {
      total += eventScores[family] || 0;
    });
  });
  return total;
}

export function getFamilyTotal(
  scores: ScoresType,
  penalties: PenaltiesType | undefined,
  familyPenalties: FamilyPenaltiesType | undefined,
  family: string,
): number {
  return (
    getCompetitionTotal(scores, family) +
    getConductScore(penalties, familyPenalties, family)
  );
}

export function setEventPenaltyChecked(
  data: ScoresheetData,
  category: string,
  event: string,
  family: string,
  penaltyKey: EventPenaltyTypeKey,
  checked: boolean,
): ScoresheetData {
  const current = getPenaltiesForCell(data.penalties, category, event, family);
  const nextList = checked
    ? current.includes(penaltyKey)
      ? current
      : [...current, penaltyKey]
    : current.filter((key) => key !== penaltyKey);

  return {
    ...data,
    penalties: {
      ...data.penalties,
      [category]: {
        ...data.penalties?.[category],
        [event]: {
          ...data.penalties?.[category]?.[event],
          [family]: nextList,
        },
      },
    },
  };
}

export function setFamilyPenaltyChecked(
  data: ScoresheetData,
  family: FamilyName,
  penaltyKey: FamilyPenaltyTypeKey,
  checked: boolean,
): ScoresheetData {
  const current = getFamilyPenalties(data.familyPenalties, family);
  const nextList = checked
    ? current.includes(penaltyKey)
      ? current
      : [...current, penaltyKey]
    : current.filter((key) => key !== penaltyKey);

  return {
    ...data,
    familyPenalties: {
      ...data.familyPenalties,
      [family]: nextList,
    },
  };
}

export function getFamilyIncidentLines(
  penalties: PenaltiesType | undefined,
  familyPenalties: FamilyPenaltiesType | undefined,
  family: string,
): string[] {
  const lines: string[] = [];

  getFamilyPenalties(familyPenalties, family).forEach((key) => {
    const { label, points } = PENALTY_TYPES[key];
    lines.push(`Roster (${ROSTER_SUBMISSION_DEADLINE}): ${label} (${points})`);
  });

  if (!penalties) return lines;

  Object.entries(CATEGORIES).forEach(([category, events]) => {
    events.forEach((event) => {
      getPenaltiesForCell(penalties, category, event, family).forEach(
        (key) => {
          const { label, points } = PENALTY_TYPES[key];
          lines.push(`${event}: ${label} (${points})`);
        },
      );
    });
  });

  return lines;
}

/** @deprecated Use EVENT_PENALTY_TYPE_KEYS */
export const PENALTY_TYPE_KEYS = EVENT_PENALTY_TYPE_KEYS;
