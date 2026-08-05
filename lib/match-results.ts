export type MatchResultStatus = "pending" | "final";

export type MatchResult = {
  scoreA: number;
  scoreB: number;
  status: MatchResultStatus;
  /** Football penalty-kick tiebreaker (only set when regulation is drawn). */
  penaltyA?: number;
  penaltyB?: number;
};

/** Map of matchId → result */
export type MatchResultsData = Record<string, MatchResult>;

export function createEmptyMatchResults(): MatchResultsData {
  return {};
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function normalizeNonNegInt(value: number): number {
  return Math.max(0, Math.floor(value));
}

export function hasPenaltyShootout(result: MatchResult): boolean {
  return (
    result.scoreA === result.scoreB &&
    isFiniteNumber(result.penaltyA) &&
    isFiniteNumber(result.penaltyB)
  );
}

export function hasDecisiveWinner(
  result: MatchResult,
  allowPenaltyShootout = false,
): boolean {
  if (result.scoreA !== result.scoreB) return true;
  return (
    allowPenaltyShootout &&
    hasPenaltyShootout(result) &&
    result.penaltyA !== result.penaltyB
  );
}

export function parseMatchResults(raw: unknown): MatchResultsData {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return createEmptyMatchResults();
  }

  const out: MatchResultsData = {};
  for (const [matchId, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;
    const entry = value as Record<string, unknown>;
    if (!isFiniteNumber(entry.scoreA) || !isFiniteNumber(entry.scoreB)) continue;
    const status: MatchResultStatus =
      entry.status === "final" ? "final" : "pending";

    const scoreA = normalizeNonNegInt(entry.scoreA);
    const scoreB = normalizeNonNegInt(entry.scoreB);
    const result: MatchResult = { scoreA, scoreB, status };

    if (
      scoreA === scoreB &&
      isFiniteNumber(entry.penaltyA) &&
      isFiniteNumber(entry.penaltyB)
    ) {
      result.penaltyA = normalizeNonNegInt(entry.penaltyA);
      result.penaltyB = normalizeNonNegInt(entry.penaltyB);
    }

    out[matchId] = result;
  }
  return out;
}

export function serializeMatchResults(data: MatchResultsData): MatchResultsData {
  const out: MatchResultsData = {};
  for (const [matchId, result] of Object.entries(data)) {
    // Unchecked admin entries are drafts only and must not be persisted.
    if (result.status !== "final") continue;

    const scoreA = normalizeNonNegInt(result.scoreA);
    const scoreB = normalizeNonNegInt(result.scoreB);
    const next: MatchResult = {
      scoreA,
      scoreB,
      status: "final",
    };
    if (
      scoreA === scoreB &&
      isFiniteNumber(result.penaltyA) &&
      isFiniteNumber(result.penaltyB)
    ) {
      next.penaltyA = normalizeNonNegInt(result.penaltyA);
      next.penaltyB = normalizeNonNegInt(result.penaltyB);
    }
    out[matchId] = next;
  }
  return out;
}

export function getMatchResult(
  data: MatchResultsData,
  matchId: string,
): MatchResult | undefined {
  return data[matchId];
}

export function setMatchResult(
  data: MatchResultsData,
  matchId: string,
  result: MatchResult,
): MatchResultsData {
  const scoreA = normalizeNonNegInt(result.scoreA);
  const scoreB = normalizeNonNegInt(result.scoreB);
  const next: MatchResult = {
    scoreA,
    scoreB,
    status: result.status,
  };
  if (
    scoreA === scoreB &&
    isFiniteNumber(result.penaltyA) &&
    isFiniteNumber(result.penaltyB)
  ) {
    next.penaltyA = normalizeNonNegInt(result.penaltyA);
    next.penaltyB = normalizeNonNegInt(result.penaltyB);
  }
  return {
    ...data,
    [matchId]: next,
  };
}

export function clearMatchResult(
  data: MatchResultsData,
  matchId: string,
): MatchResultsData {
  const next = { ...data };
  delete next[matchId];
  return next;
}

/** Public schedule shows a score only when the result is marked final. */
export function isPublishedResult(
  result: MatchResult | undefined,
): result is MatchResult {
  return Boolean(result && result.status === "final");
}

export function formatMatchScore(result: MatchResult): string {
  const base = `${result.scoreA} – ${result.scoreB}`;
  if (hasPenaltyShootout(result)) {
    return `${base} (${result.penaltyA}–${result.penaltyB} pens)`;
  }
  return base;
}

/** Winner side for winner-mode events (Chess / Scrabble / Debate). Stored as 1–0 or 0–1. */
export type WinnerSide = "A" | "B";

export function getWinnerSide(result: MatchResult): WinnerSide | null {
  if (!hasDecisiveWinner(result, true)) return null;
  if (hasPenaltyShootout(result)) {
    return (result.penaltyA ?? 0) > (result.penaltyB ?? 0) ? "A" : "B";
  }
  return result.scoreA > result.scoreB ? "A" : "B";
}

export function resultFromWinner(
  side: WinnerSide,
  status: MatchResultStatus = "final",
): MatchResult {
  return {
    scoreA: side === "A" ? 1 : 0,
    scoreB: side === "B" ? 1 : 0,
    status,
  };
}
