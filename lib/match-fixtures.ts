import {
  applySemiFinalDraws,
  DEBATE_TOPICS,
} from "@/lib/competitions";

export type ScoringMode = "goals" | "sets" | "games" | "winner";

export type SportTab =
  | "Football"
  | "Volleyball"
  | "Table Tennis"
  | "Track Events"
  | "Chess"
  | "Scrabble";

export type ExtracurricularTab = "Debate" | "Essay Writing" | "Pageantry";

export type ScoreableEventTab =
  | "Football"
  | "Volleyball"
  | "Table Tennis"
  | "Chess"
  | "Scrabble"
  | "Debate";

export interface SportMatch {
  id: string;
  type: SportTab;
  round: string;
  date: string;
  time: string;
  isFinal?: boolean;
  teamA?: string;
  teamB?: string;
  participants?: string;
  isGraded?: boolean;
  gender?: "male" | "female" | "mixed";
}

export interface ExtracurricularMatch {
  id: string;
  type: ExtracurricularTab;
  round: string;
  date: string;
  time: string;
  isFinal?: boolean;
  teamA?: string;
  teamB?: string;
  participants?: string;
  isGraded?: boolean;
  info?: string;
  topic?: string;
}

export const SPORT_TABS: SportTab[] = [
  "Football",
  "Volleyball",
  "Table Tennis",
  "Track Events",
  "Chess",
  "Scrabble",
];

export const SCOREABLE_EVENT_TABS: ScoreableEventTab[] = [
  "Football",
  "Volleyball",
  "Table Tennis",
  "Chess",
  "Scrabble",
  "Debate",
];

export const EXTRACURRICULAR_TABS: ExtracurricularTab[] = [
  "Debate",
  "Essay Writing",
  "Pageantry",
];

const SCORING_MODE_BY_TYPE: Record<ScoreableEventTab, ScoringMode> = {
  Football: "goals",
  Volleyball: "sets",
  "Table Tennis": "games",
  Chess: "winner",
  Scrabble: "winner",
  Debate: "winner",
};

export function getScoringMode(type: string): ScoringMode | null {
  if (type in SCORING_MODE_BY_TYPE) {
    return SCORING_MODE_BY_TYPE[type as ScoreableEventTab];
  }
  return null;
}

export function isWinnerMode(type: string): boolean {
  return getScoringMode(type) === "winner";
}

export function scoringModeLabel(mode: ScoringMode): string {
  switch (mode) {
    case "goals":
      return "Goals";
    case "sets":
      return "Sets";
    case "games":
      return "Games";
    case "winner":
      return "Winner";
  }
}

/** Public / admin label for who progressed based on round. */
export function winnerOutcomeLabel(round: string): string {
  const lower = round.toLowerCase();
  if (lower.includes("semi")) return "Advances";
  if (lower.includes("3rd")) return "3rd place";
  if (lower.includes("final")) return "Champion";
  return "Winner";
}

export const SPORT_MATCHES: SportMatch[] = applySemiFinalDraws([
  // Football
  {
    id: "fb-sf1",
    type: "Football",
    round: "Semi-Final 1",
    date: "Jul 31",
    time: "10:00 A.M.",
    teamA: "TBD",
    teamB: "TBD",
  },
  {
    id: "fb-sf2",
    type: "Football",
    round: "Semi-Final 2",
    date: "Jul 31",
    time: "11:00 A.M.",
    teamA: "TBD",
    teamB: "TBD",
  },
  {
    id: "fb-3rd",
    type: "Football",
    round: "3rd Place Match",
    date: "Aug 4",
    time: "10:00 A.M.",
    teamA: "Runner Up 1",
    teamB: "Runner Up 2",
    isFinal: true,
  },
  {
    id: "fb-final",
    type: "Football",
    round: "Grand Final",
    date: "Aug 12",
    time: "09:00 A.M.",
    teamA: "Winner SF1",
    teamB: "Winner SF2",
    isFinal: true,
  },

  // Volleyball (Mixed: 3 Male + 3 Female) - Aug 11 (Sports Day)
  {
    id: "vb-sf1",
    type: "Volleyball",
    round: "Semi-Final 1 · Mixed (3M + 3F)",
    date: "Aug 11",
    time: "",
    teamA: "TBD",
    teamB: "TBD",
    gender: "mixed",
  },
  {
    id: "vb-sf2",
    type: "Volleyball",
    round: "Semi-Final 2 · Mixed (3M + 3F)",
    date: "Aug 11",
    time: "",
    teamA: "TBD",
    teamB: "TBD",
    gender: "mixed",
  },
  {
    id: "vb-3rd",
    type: "Volleyball",
    round: "3rd Place Match · Mixed (3M + 3F)",
    date: "Aug 11",
    time: "",
    teamA: "Runner Up 1",
    teamB: "Runner Up 2",
    gender: "mixed",
  },
  {
    id: "vb-final",
    type: "Volleyball",
    round: "Grand Final · Mixed (3M + 3F)",
    date: "Aug 11",
    time: "",
    teamA: "Winner SF1",
    teamB: "Winner SF2",
    isFinal: true,
    gender: "mixed",
  },

  // Table Tennis (Singles — Male & Female) - Aug 11 (Sports Day)
  {
    id: "tt-sf1-m",
    type: "Table Tennis",
    round: "Semi-Final 1",
    date: "Aug 11",
    time: "",
    teamA: "TBD",
    teamB: "TBD",
    gender: "male",
  },
  {
    id: "tt-sf2-m",
    type: "Table Tennis",
    round: "Semi-Final 2",
    date: "Aug 11",
    time: "",
    teamA: "TBD",
    teamB: "TBD",
    gender: "male",
  },
  {
    id: "tt-sf1-f",
    type: "Table Tennis",
    round: "Semi-Final 1",
    date: "Aug 11",
    time: "",
    teamA: "TBD",
    teamB: "TBD",
    gender: "female",
  },
  {
    id: "tt-sf2-f",
    type: "Table Tennis",
    round: "Semi-Final 2",
    date: "Aug 11",
    time: "",
    teamA: "TBD",
    teamB: "TBD",
    gender: "female",
  },
  {
    id: "tt-3rd-m",
    type: "Table Tennis",
    round: "3rd Place Match",
    date: "Aug 11",
    time: "",
    teamA: "Runner Up 1",
    teamB: "Runner Up 2",
    gender: "male",
  },
  {
    id: "tt-3rd-f",
    type: "Table Tennis",
    round: "3rd Place Match",
    date: "Aug 11",
    time: "",
    teamA: "Runner Up 1",
    teamB: "Runner Up 2",
    gender: "female",
  },
  {
    id: "tt-final-m",
    type: "Table Tennis",
    round: "Grand Final",
    date: "Aug 11",
    time: "",
    teamA: "Winner SF1",
    teamB: "Winner SF2",
    isFinal: true,
    gender: "male",
  },
  {
    id: "tt-final-f",
    type: "Table Tennis",
    round: "Grand Final",
    date: "Aug 11",
    time: "",
    teamA: "Winner SF1",
    teamB: "Winner SF2",
    isFinal: true,
    gender: "female",
  },

  // Track Events - Aug 11 (Sports Day)
  {
    id: "tr-100m-final-m",
    type: "Track Events",
    round: "100m Final",
    date: "Aug 11",
    time: "",
    participants: "All Families",
    isGraded: true,
    isFinal: true,
    gender: "male",
  },
  {
    id: "tr-100m-final-f",
    type: "Track Events",
    round: "100m Final",
    date: "Aug 11",
    time: "",
    participants: "All Families",
    isGraded: true,
    isFinal: true,
    gender: "female",
  },
  {
    id: "tr-200m-final-m",
    type: "Track Events",
    round: "200m Final",
    date: "Aug 11",
    time: "",
    participants: "All Families",
    isGraded: true,
    isFinal: true,
    gender: "male",
  },
  {
    id: "tr-200m-final-f",
    type: "Track Events",
    round: "200m Final",
    date: "Aug 11",
    time: "",
    participants: "All Families",
    isGraded: true,
    isFinal: true,
    gender: "female",
  },
  {
    id: "tr-400m-final-m",
    type: "Track Events",
    round: "400m Final",
    date: "Aug 11",
    time: "",
    participants: "All Families",
    isGraded: true,
    isFinal: true,
    gender: "male",
  },
  {
    id: "tr-400m-final-f",
    type: "Track Events",
    round: "400m Final",
    date: "Aug 11",
    time: "",
    participants: "All Families",
    isGraded: true,
    isFinal: true,
    gender: "female",
  },
  {
    id: "tr-relay-final-m",
    type: "Track Events",
    round: "4 × 100m Relay Final",
    date: "Aug 11",
    time: "",
    participants: "All Families",
    isGraded: true,
    isFinal: true,
    gender: "male",
  },
  {
    id: "tr-relay-final-f",
    type: "Track Events",
    round: "4 × 100m Relay Final",
    date: "Aug 11",
    time: "",
    participants: "All Families",
    isGraded: true,
    isFinal: true,
    gender: "female",
  },

  // Indoor Games (Chess, Scrabble) - Aug 10
  {
    id: "ch-sf1",
    type: "Chess",
    round: "Semi-Final 1",
    date: "Aug 10",
    time: "02:00 P.M.",
    teamA: "TBD",
    teamB: "TBD",
  },
  {
    id: "ch-sf2",
    type: "Chess",
    round: "Semi-Final 2",
    date: "Aug 10",
    time: "02:00 P.M.",
    teamA: "TBD",
    teamB: "TBD",
  },
  {
    id: "ch-3rd",
    type: "Chess",
    round: "3rd Place Match",
    date: "Aug 10",
    time: "02:00 PM",
    teamA: "Runner Up 1",
    teamB: "Runner Up 2",
  },
  {
    id: "ch-final",
    type: "Chess",
    round: "Grand Final",
    date: "Aug 10",
    time: "02:00 P.M.",
    teamA: "Winner SF1",
    teamB: "Winner SF2",
    isFinal: true,
  },
  {
    id: "sc-sf1",
    type: "Scrabble",
    round: "Semi-Final 1",
    date: "Aug 10",
    time: "02:00 PM",
    teamA: "TBD",
    teamB: "TBD",
  },
  {
    id: "sc-sf2",
    type: "Scrabble",
    round: "Semi-Final 2",
    date: "Aug 10",
    time: "02:00 P.M.",
    teamA: "TBD",
    teamB: "TBD",
  },
  {
    id: "sc-3rd",
    type: "Scrabble",
    round: "3rd Place Match",
    date: "Aug 10",
    time: "02:00 P.M.",
    teamA: "Runner Up 1",
    teamB: "Runner Up 2",
  },
  {
    id: "sc-final",
    type: "Scrabble",
    round: "Grand Final",
    date: "Aug 10",
    time: "02:00 PM",
    teamA: "Winner SF1",
    teamB: "Winner SF2",
    isFinal: true,
  },
] as SportMatch[]);

export const EXTRACURRICULAR_MATCHES: ExtracurricularMatch[] =
  applySemiFinalDraws([
    // Debate (Matchup)
    {
      id: "e-sf1-debate",
      type: "Debate",
      date: "Aug 10",
      round: "Semi-Final 1",
      teamA: "TBD",
      teamB: "TBD",
      time: "04:00 PM",
      topic: DEBATE_TOPICS["e-sf1-debate"],
    },
    {
      id: "e-sf2-debate",
      type: "Debate",
      date: "Aug 10",
      round: "Semi-Final 2",
      teamA: "TBD",
      teamB: "TBD",
      time: "05:00 PM",
      topic: DEBATE_TOPICS["e-sf2-debate"],
    },
    {
      id: "e-3rd-debate",
      type: "Debate",
      date: "Aug 13",
      round: "3rd Place Match",
      teamA: "Runner Up 1",
      teamB: "Runner Up 2",
      time: "05:30 PM",
      info: "Holy Father's Vestry",
      topic: DEBATE_TOPICS["e-3rd-debate"],
    },
    {
      id: "e-final-debate",
      type: "Debate",
      date: "Aug 16",
      round: "Grand Final",
      teamA: "Winner SF1",
      teamB: "Winner SF2",
      time: "",
      isFinal: true,
      topic: DEBATE_TOPICS["e-final-debate"],
    },

    // Essay Writing (Graded)
    {
      id: "e-topic-essay",
      type: "Essay Writing",
      date: "Aug 10",
      round: "Topic Announcement",
      participants: "All Families",
      time: "11:30 AM",
      isGraded: true,
      info: "Topic announced after Morning Devotion",
    },
    {
      id: "e-submit-essay",
      type: "Essay Writing",
      date: "Aug 12",
      round: "Submission Deadline",
      participants: "All Families",
      time: "10:00 AM",
      isGraded: true,
      info: "Essays to be submitted on or before 10 a.m.",
    },

    // Pageantry
    {
      id: "e-pageant1",
      type: "Pageantry",
      date: "Aug 12",
      round: "Phase 1 (Quiz / Spelling Bee)",
      participants: "All Families",
      time: "01:00 PM",
      isGraded: true,
    },
    {
      id: "e-pageant2",
      type: "Pageantry",
      date: "Aug 15",
      round: "Phase 2 (Cultural Day)",
      participants: "All Families",
      time: "07:00 PM",
      isGraded: true,
      isFinal: true,
    },
  ] as ExtracurricularMatch[]);

import { applyPublishedBracketAdvancement } from "@/lib/match-brackets";
import type { MatchResultsData } from "@/lib/match-results";

/** Head-to-head fixtures that accept match scores (excludes graded events). */
export type ScoreableFixture = {
  id: string;
  type: ScoreableEventTab;
  round: string;
  date: string;
  time: string;
  teamA?: string;
  teamB?: string;
  isFinal?: boolean;
  gender?: "male" | "female" | "mixed";
  topic?: string;
};

export function getScoreableFixtures(
  type?: ScoreableEventTab,
  results?: MatchResultsData,
): ScoreableFixture[] {
  const sports = SPORT_MATCHES.filter(
    (m): m is SportMatch & { type: ScoreableEventTab } =>
      !m.isGraded &&
      (SCOREABLE_EVENT_TABS as string[]).includes(m.type) &&
      Boolean(m.teamA && m.teamB),
  ).map((m) => ({
    id: m.id,
    type: m.type as ScoreableEventTab,
    round: m.round,
    date: m.date,
    time: m.time,
    teamA: m.teamA,
    teamB: m.teamB,
    isFinal: m.isFinal,
    gender: m.gender,
  }));

  const debate = EXTRACURRICULAR_MATCHES.filter(
    (m): m is ExtracurricularMatch & { type: "Debate" } =>
      m.type === "Debate" && !m.isGraded && Boolean(m.teamA && m.teamB),
  ).map((m) => ({
    id: m.id,
    type: "Debate" as const,
    round: m.round,
    date: m.date,
    time: m.time,
    teamA: m.teamA,
    teamB: m.teamB,
    isFinal: m.isFinal,
    topic: m.topic,
  }));

  let all = [...sports, ...debate];
  if (results) {
    all = applyPublishedBracketAdvancement(all, results);
  }
  if (!type) return all;
  return all.filter((m) => m.type === type);
}
