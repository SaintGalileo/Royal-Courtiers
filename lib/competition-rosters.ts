import type { CompetitionFamily, EventName } from "@/lib/competitions";

export type RosterSlot = {
  role?: string;
  name: string;
};

export type FamilyRoster = Record<CompetitionFamily, RosterSlot[]>;

export const PARTICIPANTS_PENDING_NOTE =
  "Participant names will be published in due course.";

const FAMILIES: CompetitionFamily[] = [
  "Virtue",
  "Power",
  "Dominion",
  "Light",
];

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

/** Per-family participant slots. Replace "TBA" with real names when families submit. Choral excluded. */
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
