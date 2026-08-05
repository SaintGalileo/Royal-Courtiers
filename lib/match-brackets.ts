import {
  getWinnerSide,
  isPublishedResult,
  type MatchResultsData,
} from "@/lib/match-results";

type MatchWithIdAndTeams = {
  id: string;
  teamA?: string;
  teamB?: string;
};

/** Knockout brackets: SF winners → Final, SF losers → 3rd place. */
export const BRACKET_PROGRESSIONS = [
  {
    sf1: "fb-sf1",
    sf2: "fb-sf2",
    third: "fb-3rd",
    final: "fb-final",
  },
  {
    sf1: "vb-sf1",
    sf2: "vb-sf2",
    third: "vb-3rd",
    final: "vb-final",
  },
  {
    sf1: "tt-sf1-m",
    sf2: "tt-sf2-m",
    third: "tt-3rd-m",
    final: "tt-final-m",
  },
  {
    sf1: "tt-sf1-f",
    sf2: "tt-sf2-f",
    third: "tt-3rd-f",
    final: "tt-final-f",
  },
  {
    sf1: "ch-sf1",
    sf2: "ch-sf2",
    third: "ch-3rd",
    final: "ch-final",
  },
  {
    sf1: "sc-sf1",
    sf2: "sc-sf2",
    third: "sc-3rd",
    final: "sc-final",
  },
  {
    sf1: "e-sf1-debate",
    sf2: "e-sf2-debate",
    third: "e-3rd-debate",
    final: "e-final-debate",
  },
] as const;

function resolveWinnerLoser(
  match: MatchWithIdAndTeams | undefined,
  results: MatchResultsData,
): { winner: string; loser: string } | null {
  if (!match?.teamA || !match?.teamB) return null;
  const result = results[match.id];
  if (!isPublishedResult(result)) return null;
  const side = getWinnerSide(result);
  if (!side) return null;
  return side === "A"
    ? { winner: match.teamA, loser: match.teamB }
    : { winner: match.teamB, loser: match.teamA };
}

/**
 * Fill 3rd-place and Final fixtures from published semi-final results.
 * Partial fills are allowed (e.g. only SF1 published → Final teamA set).
 */
export function applyPublishedBracketAdvancement<T extends MatchWithIdAndTeams>(
  matches: T[],
  results: MatchResultsData,
): T[] {
  if (!results || Object.keys(results).length === 0) return matches;

  const byId = new Map(matches.map((m) => [m.id, m]));
  const overrides = new Map<string, { teamA?: string; teamB?: string }>();

  for (const bracket of BRACKET_PROGRESSIONS) {
    const sf1 = resolveWinnerLoser(byId.get(bracket.sf1), results);
    const sf2 = resolveWinnerLoser(byId.get(bracket.sf2), results);

    if (sf1 || sf2) {
      overrides.set(bracket.final, {
        teamA: sf1?.winner ?? "Winner SF1",
        teamB: sf2?.winner ?? "Winner SF2",
      });
      overrides.set(bracket.third, {
        teamA: sf1?.loser ?? "Runner Up 1",
        teamB: sf2?.loser ?? "Runner Up 2",
      });
    }
  }

  if (overrides.size === 0) return matches;

  return matches.map((match) => {
    const next = overrides.get(match.id);
    if (!next) return match;
    return { ...match, ...next };
  });
}
