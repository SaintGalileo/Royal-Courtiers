export type CompetitionFamily = "Virtue" | "Power" | "Dominion" | "Light";

export type CompetitionCategory =
  | "Sports Arena"
  | "Board Games"
  | "Choral Competitions"
  | "Extracurricular Competitions";

export type EventName =
  | "Football"
  | "Volleyball"
  | "Badminton"
  | "Table Tennis"
  | "Track Events"
  | "Sack Race (Junior)"
  | "Egg Race (Junior)"
  | "Filling the Basket (Junior)"
  | "Chess"
  | "Scrabble"
  | "Ludo"
  | "Composition Competition"
  | "Solo"
  | "Duet"
  | "Singing Competition"
  | "Debate"
  | "Essay Writing"
  | "Pageantry";

export type CompetitionEventInfo = {
  name: EventName;
  category: CompetitionCategory;
  about: string;
  howItWorks: string[];
  registration: string[];
  formatNotes?: string[];
  grandFinaleNote?: boolean;
  pageantryGrandFinaleNote?: boolean;
};

export type EventPointsInfo = {
  /** Maximum points for 1st place in this event (or per scored unit). */
  maxPoints: number;
  /** Short label, e.g. "per race" or "total". */
  unit?: string;
  /** Extra lines explaining how points split across sub-events. */
  breakdown?: string[];
};

export const SUBMISSION_DEADLINE = "July 1, 2026";

export const CHORAL_GRAND_FINALE_NOTE =
  "Winners of the Solo and Duet competitions will perform again during the Grand Finale.";

export const PAGEANTRY_GRAND_FINALE_NOTE =
  "Pageantry winners will be crowned FACE OF THE SERAPHS during the Grand Finale.";

/** How placement maps to points earned (of the event maximum). */
export const SCORING_PLACEMENTS =
  "1st place = 100% · 2nd = 80% · 3rd = 60% · 4th = 40%";

/** Points allotted per competition event (matches the live scoresheet). Choral excluded — independent scoring. */
export const EVENT_POINTS: Partial<Record<EventName, EventPointsInfo>> = {
  Football: { maxPoints: 100, unit: "total" },
  Volleyball: { maxPoints: 50, unit: "total" },
  Badminton: { maxPoints: 50, unit: "total" },
  "Table Tennis": {
    maxPoints: 50,
    unit: "per category",
    breakdown: [
      "Table Tennis (Male) — 50 pts",
      "Table Tennis (Female) — 50 pts",
    ],
  },
  "Track Events": {
    maxPoints: 50,
    unit: "per race",
    breakdown: [
      "100m, 200m, 400m & 4 × 100m relay — each scored separately",
      "Male and female categories scored independently (up to 8 races × 50 pts)",
    ],
  },
  "Sack Race (Junior)": {
    maxPoints: 50,
    unit: "per category",
    breakdown: ["Junior Male — 50 pts", "Junior Female — 50 pts"],
  },
  "Egg Race (Junior)": {
    maxPoints: 50,
    unit: "per category",
    breakdown: ["Junior Male — 50 pts", "Junior Female — 50 pts"],
  },
  "Filling the Basket (Junior)": {
    maxPoints: 50,
    unit: "per category",
    breakdown: ["Junior Male — 50 pts", "Junior Female — 50 pts"],
  },
  Chess: { maxPoints: 50, unit: "total" },
  Scrabble: { maxPoints: 50, unit: "total" },
  Ludo: { maxPoints: 50, unit: "total" },
  Debate: { maxPoints: 100, unit: "total" },
  "Essay Writing": { maxPoints: 50, unit: "total" },
  Pageantry: { maxPoints: 200, unit: "total" },
};

export function getEventPoints(eventName: string): EventPointsInfo | undefined {
  return EVENT_POINTS[eventName as EventName];
}

export const FAMILY_CULTURES: Record<
  CompetitionFamily,
  { culture: string; label: string }
> = {
  Dominion: { label: "Family of Dominion", culture: "Igbo" },
  Light: { label: "Family of Light", culture: "Benin" },
  Power: { label: "Family of Power", culture: "Yoruba" },
  Virtue: { label: "Family of Virtue", culture: "Efik / Ibibio" },
};

export const FAMILY_STYLES: Record<
  CompetitionFamily,
  { bgColor: string; borderColor: string; textColor: string; initial: string }
> = {
  Virtue: {
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/40",
    textColor: "text-green-700 dark:text-green-400",
    initial: "V",
  },
  Power: {
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/40",
    textColor: "text-red-700 dark:text-red-400",
    initial: "P",
  },
  Dominion: {
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/40",
    textColor: "text-purple-700 dark:text-purple-400",
    initial: "D",
  },
  Light: {
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/40",
    textColor: "text-yellow-700 dark:text-yellow-400",
    initial: "L",
  },
};

export const SEMI_FINAL_DRAWS: Record<
  string,
  {
    sf1: [CompetitionFamily, CompetitionFamily];
    sf2: [CompetitionFamily, CompetitionFamily];
  }
> = {
  Football: { sf1: ["Virtue", "Power"], sf2: ["Light", "Dominion"] },
  Volleyball: { sf1: ["Dominion", "Power"], sf2: ["Virtue", "Light"] },
  Badminton: { sf1: ["Virtue", "Dominion"], sf2: ["Power", "Light"] },
  "Table Tennis": { sf1: ["Power", "Light"], sf2: ["Dominion", "Virtue"] },
  Chess: { sf1: ["Light", "Power"], sf2: ["Virtue", "Dominion"] },
  Scrabble: { sf1: ["Light", "Dominion"], sf2: ["Power", "Virtue"] },
  Ludo: { sf1: ["Dominion", "Light"], sf2: ["Virtue", "Power"] },
  Debate: { sf1: ["Light", "Virtue"], sf2: ["Dominion", "Power"] },
};

/** Debate motions keyed by fixture id */
export const DEBATE_TOPICS: Record<string, string> = {
  "e-sf1-debate":
    "Is something good because God commands it, or does God command it because it is good?",
  "e-sf2-debate":
    "If God is unchanging (immutable), this means that the god of the Old Testament is not the same as the Father whom Christ spoke of. True/False.",
  "e-3rd-debate": "Which is a Greater Threat to Faith: Doubt or Certainty?",
  "e-final-debate": "Unconditional Love: Does It Really Exist?",
};

export const COMPETITION_EVENTS: Record<EventName, CompetitionEventInfo> = {
  Football: {
    name: "Football",
    category: "Sports Arena",
    about:
      "Families face off in a small-sided football tournament. Only five players are on the pitch at a time, so speed, teamwork, and stamina all matter. Each half lasts 20 minutes. In the event of a draw, the match goes straight to penalty kicks.",
    howItWorks: [
      "Four families enter a knockout bracket starting with two semi-finals.",
      "Each semi-final is played over two legs (home-and-away style) before the final.",
      "The two semi-final winners meet in the Grand Final; the losers play for 3rd place.",
    ],
    registration: [
      "Register 10 players per family.",
      "Only 5 may be on the field at any moment.",
    ],
    formatNotes: [
      "5-a-side means five players per team on the pitch, this includes a goalkeeper that cannot use his hands if your family chooses to field one.",
      "Two-legged ties: the away family in the 1st leg hosts the 2nd leg — team order flips to show home and away.",
    ],
  },
  Volleyball: {
    name: "Volleyball",
    category: "Sports Arena",
    about:
      "Each family fields a mixed team of brothers and sisters. The aim is to keep the ball in play and send it over the net so it lands on the opponent's side. Only one set will be played and it lasts 21 points. In the event of a draw (20 points each), the match is decided by the first team to win 2 points.",
    howItWorks: [
      "Two semi-final matches decide which families reach the final.",
      "All matches are played on Sports Day (August 11).",
      "Winners advance; losing semi-finalists compete for 3rd place.",
    ],
    registration: [
      "Register 12 players: 6 brothers and 6 sisters.",
      "Only 6 play at once — 3 brothers and 3 sisters on court.",
    ],
    formatNotes: [
      "Mixed team: both brothers and sisters play together in the same match, not in separate boys-only or girls-only games.",
    ],
  },
  Badminton: {
    name: "Badminton",
    category: "Sports Arena",
    about:
      "Two families compete through a single pair who play badminton together over the net. Points are won when the shuttlecock lands on the opponent's side or they fail to return it. Only one set will be played and it lasts 21 points. In the event of a draw (20 points each), the match is decided by the first team to win 2 points.",
    howItWorks: [
      "Knockout semi-finals, then a final and a 3rd-place match.",
      "Played on Sports Day (August 11).",
    ],
    registration: ["Register one pair per family."],
    formatNotes: [
      "Mixed doubles: one brother and one sister play as partners on the same side of the court — they share the court and alternate shots.",
    ],
  },
  "Table Tennis": {
    name: "Table Tennis",
    category: "Sports Arena",
    about:
      "One-on-one table tennis matches between family representatives. Each family enters separate male and female players who compete in their own knockout brackets. Only one set will be played and it lasts 21 points. In the event of a draw (20 points each), the match is decided by the first team to win 5 points.",
    howItWorks: [
      "Male and female categories run independently with their own semi-finals and finals.",
      "Same family draw applies to both categories.",
      "Played on Sports Day (August 11).",
    ],
    registration: ["Register 1 male player and 1 female player per family."],
    formatNotes: [
      "Singles: each match is one player vs one player — no partners.",
    ],
  },
  "Track Events": {
    name: "Track Events",
    category: "Sports Arena",
    about:
      "Athletes from all four families race on the track in standard sprint and relay events. Everyone runs their own lane or leg; fastest times and placements win.",
    howItWorks: [
      "Finals are held for each distance — there are no separate family-vs-family knockouts.",
      "Events follow common athletics formats used worldwide.",
      "All four families may enter runners in every race.",
    ],
    registration: [
      "Families submit athletes for each event they wish to enter.",
      "Separate male and female races for every distance.",
    ],
    formatNotes: [
      "100m & 200m: short sprints in a straight or curved lane.",
      "400m: one full lap of the track.",
      "4 × 100m relay: four runners per team each run 100m and pass a baton to the next runner.",
    ],
  },
  "Sack Race (Junior)": {
    name: "Sack Race (Junior)",
    category: "Sports Arena",
    about:
      "A light-hearted race for younger participants who hop inside a sack from start to finish. First to cross the line wins.",
    howItWorks: [
      "Separate races for boys and girls.",
      "Held on Sports Day (August 11).",
    ],
    registration: [
      "Open to juniors only — under 13 years old (maximum age 12).",
      "Families nominate one eligible junior per category.",
    ],
  },
  "Egg Race (Junior)": {
    name: "Egg Race (Junior)",
    category: "Sports Arena",
    about:
      "Participants balance an egg on a spoon and race without using their hands to hold the egg. If the egg drops or participant holds the egg with their hands, they must return to the starting line to get a new egg. Fastest to the finish line wins.",
    howItWorks: [
      "Separate races for boys and girls.",
      "Held on Sports Day (August 11).",
    ],
    registration: [
      "Open to juniors only — under 13 years old (maximum age 12).",
      "Families nominate one eligible junior per category.",
    ],
  },
  "Filling the Basket (Junior)": {
    name: "Filling the Basket (Junior)",
    category: "Sports Arena",
    about:
      "A game where juniors transfer small balls one at a time from a basket on one end of a track and fill another basket on the other end as quickly as possible before returning the basket to the starting position. Speed, coordination and stamina are key.",
    howItWorks: [
      "Separate categories for boys and girls.",
      "Held on Sports Day (August 11).",
    ],
    registration: [
      "Open to juniors only — under 13 years old (maximum age 12).",
      "Families nominate one eligible junior per category.",
    ],
  },
  Chess: {
    name: "Chess",
    category: "Board Games",
    about:
      "One representative per family plays rapid chess (each player has 10 minutes to play) — the player with the highest score after 10 minutes wins.",
    howItWorks: [
      "Knockout semi-finals on August 10, then final and 3rd-place match.",
      "Venue: 26 Mbukpa Holy Chapel.",
    ],
    registration: ["Register 1 player per family."],
  },
  Scrabble: {
    name: "Scrabble",
    category: "Board Games",
    about:
      "Families send one player to build high-scoring words on the board using letter tiles drawn at random in a rapid game of scrabble (each player has 10 minutes to play) — the player with the highest score after 10 minutes wins.",
    howItWorks: [
      "Knockout semi-finals on August 10, then final and 3rd-place match.",
      "Venue: 26 Mbukpa Holy Chapel.",
    ],
    registration: ["Register 1 player per family."],
  },
  Ludo: {
    name: "Ludo",
    category: "Board Games",
    about:
      "The familiar board game where players roll dice and move pieces around the board to get all four home first.",
    howItWorks: [
      "Knockout semi-finals on August 10, then final and 3rd-place match.",
      "Venue: 26 Mbukpa Holy Chapel.",
    ],
    registration: ["Register 1 player per family."],
  },
  "Composition Competition": {
    name: "Composition Competition",
    category: "Choral Competitions",
    about:
      "Participants are timed and required to compose a musical piece on the spot. Judges look at the melody, lyrics, message, overall delivery, and score accordingly.",
    howItWorks: [
      "Open performance session on August 14 at 2:00 PM.",
      "Open to anyone — you do not need to belong to a particular family to enter.",
    ],
    registration: ["Reach out to the Choirmaster General for registration."],
  },
  Solo: {
    name: "Solo",
    category: "Choral Competitions",
    about:
      "One person sings alone on stage. Judges assess vocal quality, confidence, and how well the song is delivered.",
    howItWorks: [
      "Performance session on August 14 at 2:00 PM.",
      "Open to all participants regardless of family.",
      "The winner is invited to perform any song of their choice at the Grand Finale.",
    ],
    registration: ["Reach out to the Choirmaster General for registration."],
    grandFinaleNote: true,
  },
  Duet: {
    name: "Duet",
    category: "Choral Competitions",
    about:
      "Two people sing together as a pair. Judges listen for how well the two voices blend and whether the harmony supports the song.",
    howItWorks: [
      "Performance session on August 14 at 2:00 PM.",
      "Open to all participants regardless of family.",
      "The winning duet is invited to perform any song of their choice at the Grand Finale.",
    ],
    registration: ["Reach out to the Choirmaster General for registration."],
    grandFinaleNote: true,
  },
  "Singing Competition": {
    name: "Singing Competition",
    category: "Choral Competitions",
    about:
      "A group singing event where ensembles perform together. Unity of voice, musical arrangement, and worship impact are key.",
    howItWorks: [
      "Performance session on August 14 at 2:00 PM.",
      "Mandatory for all — not restricted by family.",
    ],
    registration: [
      "Reach out to the Choirmaster General for grouping if you don't already have a choir.",
    ],
  },
  Debate: {
    name: "Debate",
    category: "Extracurricular Competitions",
    about:
      "Families argue for or against assigned topics in a structured setting. Teams take turns presenting points and rebutting the other side.",
    howItWorks: [
      "Semi-finals on August 10; 3rd-place match on August 13; Grand Final on August 16.",
      "Two winning semi-finalists advance to the final.",
      "Each round has a fixed motion — see the schedule below for the topic at each stage.",
    ],
    registration: [
      "Register 3 debaters per family.",
      "At least one must be male and one must be female.",
    ],
    formatNotes: [
      "A motion is the statement your team argues for or against — e.g. “This family believes that…”",
      "Note that presented arguments may or may not depict the speaker's actual views. It is purely for the purpose of the debate.",
    ],
  },
  "Essay Writing": {
    name: "Essay Writing",
    category: "Extracurricular Competitions",
    about:
      "Families submit a written essay on a topic revealed after the Flag-off Ceremony. Judges read all entries and score them accordingly.",
    howItWorks: [
      "The topic is announced on Monday, August 10 after Morning Devotion.",
      "Essays must be submitted by 10:00 AM on Wednesday, August 12.",
      "Family representatives' scores will be summed up and equated to 100% to determine final score.",
      "Results will be announced during the Grand Finale.",
    ],
    registration: [
      "Register 2 writers per family: one brother and one sister.",
      "Each submits their own essay.",
    ],
  },
  Pageantry: {
    name: "Pageantry",
    category: "Extracurricular Competitions",
    about:
      "A two-part contest combining knowledge (quiz and spelling) with cultural presentation. Same contestants represent their families across both phases.",
    howItWorks: [
      "Phase 1 (August 12): Quiz and Spelling Bee at 26 Mbukpa Holy Chapel.",
      "Phase 2 (August 15): Cultural presentation during Cultural Day / Dinner Night.",
      "Scores from both phases contribute to the overall result.",
    ],
    registration: [
      "Open to all families.",
      "Families nominate 2 contestants (a brother and a sister) through their Family Head.",
    ],
    formatNotes: [
      "Phase 2 is where each family presents the Nigerian culture assigned to them — see Cultural Day Representation below.",
    ],
    pageantryGrandFinaleNote: true,
  },
};

export function getEventInfo(
  eventName: string,
): CompetitionEventInfo | undefined {
  return COMPETITION_EVENTS[eventName as EventName];
}

export function isCompetitionFamily(name: string): name is CompetitionFamily {
  return name in FAMILY_STYLES;
}

type MatchWithTeams = {
  type: string;
  round: string;
  teamA?: string;
  teamB?: string;
};

export function applySemiFinalDraws<T extends MatchWithTeams>(
  matches: T[],
): T[] {
  return matches.map((match) => {
    const draws = SEMI_FINAL_DRAWS[match.type];
    if (!draws || match.teamA !== "TBD" || match.teamB !== "TBD") return match;

    const round = match.round.toLowerCase();
    if (round.includes("semi-final 1") || round.startsWith("semi-final 1")) {
      return { ...match, teamA: draws.sf1[0], teamB: draws.sf1[1] };
    }
    if (round.includes("semi-final 2") || round.startsWith("semi-final 2")) {
      return { ...match, teamA: draws.sf2[0], teamB: draws.sf2[1] };
    }
    return match;
  });
}

/** Swap home/away for football 2nd legs (away team from 1st leg hosts). */
export function applyFootballSecondLegHomeAway<T extends MatchWithTeams>(
  matches: T[],
): T[] {
  return matches.map((match) => {
    if (match.type !== "Football" || !match.round.includes("2nd Leg")) {
      return match;
    }
    if (!match.teamA || !match.teamB) return match;
    return { ...match, teamA: match.teamB, teamB: match.teamA };
  });
}

export function hasSemiFinalDraw(eventName: EventName): boolean {
  return eventName in SEMI_FINAL_DRAWS;
}
