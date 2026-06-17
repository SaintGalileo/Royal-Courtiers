import {
  lookupShirtSize,
  MAX_CHEST_INCHES,
  MIN_CHEST_INCHES,
  SHIRT_SIZE_CHART,
} from "@/lib/shirt-sizes";
import {
  calculateAge,
  FAMILY_OPTIONS,
  isLegacyShirtSizeRow,
  type Family,
  type MemberSeed,
  type RosterRow,
} from "@/lib/t-shirts";

export type Sex = "male" | "female" | "unknown";

export type AgeBand = {
  key: string;
  label: string;
  minAge: number;
  maxAge: number;
};

/**
 * Growth-sensitive bands for children and teens; everyone 20+ shares one
 * smoothed adult pool because chest size stabilises once growth stops.
 */
export const AGE_BANDS: AgeBand[] = [
  { key: "child-6-9", label: "Child 6–9", minAge: 6, maxAge: 9 },
  { key: "child-10-12", label: "Child 10–12", minAge: 10, maxAge: 12 },
  { key: "teen-13-15", label: "Younger teen 13–15", minAge: 13, maxAge: 15 },
  { key: "teen-16-19", label: "Older teen 16–19", minAge: 16, maxAge: 19 },
  { key: "adult-20+", label: "Adult 20+", minAge: 20, maxAge: 120 },
];

const ADULT_BAND = AGE_BANDS[AGE_BANDS.length - 1];

/**
 * Approximate anthropometric chest-circumference values (inches) by band and
 * sex, used as a research anchor that gets blended with measured member data.
 * Teen-to-adult bands carry a baked-in +1 inch bump over raw estimates (they
 * read too small in practice); this is SEPARATE from the +1 inch error buffer
 * applied during estimation. Tune these in one place.
 */
export const RESEARCH_CHEST_INCHES: Record<
  string,
  { male: number; female: number }
> = {
  "child-6-9": { male: 27, female: 27 },
  "child-10-12": { male: 30, female: 30 },
  "teen-13-15": { male: 35, female: 34 },
  "teen-16-19": { male: 39, female: 36 },
  "adult-20+": { male: 42, female: 39 },
};

export const DEFAULT_CHEST_BUFFER_INCHES = 1;

/** No verified members below this age; younger DOB values are treated as invalid. */
export const MIN_COMMUNITY_AGE = 6;

/**
 * How many inches a legacy size's chest midpoint must exceed the age-band
 * expectation before we conclude the age is unreliable (member likely lied).
 * ~2.5 size brackets.
 */
export const ABNORMAL_DISPROPORTION_INCHES = 5;

/** Upper chest used when capping abnormal cases at XL (XL covers 42–44 in). */
const XL_CAP_CHEST_INCHES = 43;

/** Pseudo-count for shrinkage: thin bands lean on research, big samples dominate. */
const SHRINKAGE_K = 4;

export function normalizeSex(gender: string | null | undefined): Sex {
  const value = gender?.trim().toLowerCase() ?? "";
  if (value === "brother" || value === "male" || value === "m") return "male";
  if (value === "sister" || value === "female" || value === "f") return "female";
  return "unknown";
}

export function getAgeBandFromAge(age: number | null): AgeBand {
  const resolvedAge = age ?? ADULT_BAND.minAge;
  return (
    AGE_BANDS.find(
      (band) => resolvedAge >= band.minAge && resolvedAge <= band.maxAge,
    ) ?? ADULT_BAND
  );
}

export function isAgeUnreliable(age: number | null): boolean {
  return age == null || age < MIN_COMMUNITY_AGE;
}

export type BandSexStats = {
  mean: number;
  count: number;
};

export type MeasuredBucket = {
  male: BandSexStats | null;
  female: BandSexStats | null;
  combined: BandSexStats | null;
};

export type ChestAverages = {
  /** Measured-member averages keyed by band key, split by sex plus combined. */
  measured: Record<string, MeasuredBucket>;
};

export type LegacySizeEstimate = {
  rowKey: string;
  nickName: string;
  family: Family;
  age: number | null;
  sex: Sex;
  bandLabel: string;
  previousLabel: string;
  chest: number;
  label: string;
  expected: number;
  source: "band" | "legacy-cap";
};

export type ApplyLegacyEstimatesResult = {
  rosters: Record<Family, RosterRow[]>;
  updatedCount: number;
  skippedCount: number;
  estimates: LegacySizeEstimate[];
  averages: ChestAverages;
};

function roundToHalf(value: number): number {
  return Math.round(value * 2) / 2;
}

function clampChest(value: number): number {
  return Math.min(MAX_CHEST_INCHES, Math.max(MIN_CHEST_INCHES, value));
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function statsFromValues(values: number[]): BandSexStats | null {
  const m = mean(values);
  return m == null ? null : { mean: m, count: values.length };
}

function normalizeLegacyLabel(label: string): string {
  const trimmed = label.trim().toUpperCase();
  const aliases: Record<string, string> = {
    XXL: "2XL",
    XXXL: "3XL",
    XXXXL: "4XL",
  };
  return aliases[trimmed] ?? label.trim();
}

function legacyLabelMidpoint(label: string): number | null {
  const normalized = normalizeLegacyLabel(label);
  const entry = SHIRT_SIZE_CHART.find((size) => size.label === normalized);
  if (!entry) return null;
  return (entry.min + entry.max) / 2;
}

function researchValue(bandKey: string, sex: Sex): number {
  const entry = RESEARCH_CHEST_INCHES[bandKey] ?? RESEARCH_CHEST_INCHES[ADULT_BAND.key];
  if (sex === "male") return entry.male;
  if (sex === "female") return entry.female;
  return (entry.male + entry.female) / 2;
}

export function buildChestAverages(members: MemberSeed[]): ChestAverages {
  const byBand: Record<
    string,
    { male: number[]; female: number[]; combined: number[] }
  > = {};
  for (const band of AGE_BANDS) {
    byBand[band.key] = { male: [], female: [], combined: [] };
  }

  for (const member of members) {
    if (member.shirt_chest_inches == null) continue;
    const chest = Number(member.shirt_chest_inches);
    if (!Number.isFinite(chest)) continue;

    const age = calculateAge(member.date_of_birth);
    // Require a trustworthy age so bogus DOBs don't pollute the averages.
    if (age == null || age < MIN_COMMUNITY_AGE) continue;

    const band = getAgeBandFromAge(age);
    const sex = normalizeSex(member.gender);
    const bucket = byBand[band.key];
    bucket.combined.push(chest);
    if (sex === "male") bucket.male.push(chest);
    else if (sex === "female") bucket.female.push(chest);
  }

  const measured = AGE_BANDS.reduce(
    (acc, band) => {
      const bucket = byBand[band.key];
      acc[band.key] = {
        male: statsFromValues(bucket.male),
        female: statsFromValues(bucket.female),
        combined: statsFromValues(bucket.combined),
      };
      return acc;
    },
    {} as Record<string, MeasuredBucket>,
  );

  return { measured };
}

function measuredStatsForSex(
  averages: ChestAverages,
  bandKey: string,
  sex: Sex,
): BandSexStats | null {
  const bucket = averages.measured[bandKey];
  if (!bucket) return null;
  if (sex === "male") return bucket.male ?? bucket.combined;
  if (sex === "female") return bucket.female ?? bucket.combined;
  return bucket.combined;
}

export type ExpectedChest = {
  value: number;
  research: number;
  measuredMean: number | null;
  measuredCount: number;
};

/**
 * Blended expected chest for a band+sex: shrinks the measured mean toward the
 * research baseline so thin samples stay anchored and large samples dominate.
 */
export function expectedChest(
  averages: ChestAverages,
  band: AgeBand,
  sex: Sex,
): ExpectedChest {
  const research = researchValue(band.key, sex);
  const measured = measuredStatsForSex(averages, band.key, sex);
  const count = measured?.count ?? 0;
  const measuredMean = measured?.mean ?? null;
  const value =
    (count * (measuredMean ?? research) + SHRINKAGE_K * research) /
    (count + SHRINKAGE_K);
  return { value, research, measuredMean, measuredCount: count };
}

export function estimateChestInchesForRow(
  row: RosterRow,
  averages: ChestAverages,
  chestBufferInches = DEFAULT_CHEST_BUFFER_INCHES,
): {
  chest: number;
  label: string;
  bandLabel: string;
  sex: Sex;
  expected: number;
  source: LegacySizeEstimate["source"];
} | null {
  const sex = normalizeSex(row.gender);
  const ageReliable = !isAgeUnreliable(row.age);
  const legacyMid = legacyLabelMidpoint(row.shirt_size);

  const ageBand = ageReliable ? getAgeBandFromAge(row.age) : null;
  const ageExpected = ageBand
    ? expectedChest(averages, ageBand, sex).value
    : null;

  // Age is untrustworthy if it's missing/too young, or the legacy size is wildly
  // larger than what the stated age band would predict (member likely lied).
  const disproportionate =
    legacyMid != null &&
    ageExpected != null &&
    legacyMid - ageExpected >= ABNORMAL_DISPROPORTION_INCHES;
  const abnormal = !ageReliable || disproportionate;

  let chest: number;
  let expectedUsed: number;
  let source: LegacySizeEstimate["source"];
  let bandLabel: string;

  if (abnormal) {
    // Ignore age. Trust the legacy size, add the buffer, then cap at XL.
    const fallback =
      ageExpected ?? expectedChest(averages, ADULT_BAND, sex).value;
    const base = legacyMid ?? fallback;
    expectedUsed = base;
    chest = Math.min(base + chestBufferInches, XL_CAP_CHEST_INCHES);
    source = "legacy-cap";
    bandLabel = `Legacy ${normalizeLegacyLabel(row.shirt_size)} (age ignored, capped XL)`;
  } else {
    expectedUsed = ageExpected as number;
    chest = expectedUsed + chestBufferInches;
    source = "band";
    bandLabel = `${(ageBand as AgeBand).label} · ${sex}`;
  }

  chest = clampChest(roundToHalf(chest));
  const label = lookupShirtSize(chest);
  if (!label) return null;

  return { chest, label, bandLabel, sex, expected: expectedUsed, source };
}

export function applyLegacySizeEstimatesToRosters(
  rosters: Record<Family, RosterRow[]>,
  members: MemberSeed[],
  options: { chestBufferInches?: number; families?: Family[] } = {},
): ApplyLegacyEstimatesResult {
  const chestBufferInches =
    options.chestBufferInches ?? DEFAULT_CHEST_BUFFER_INCHES;
  // Averages always use the full measured dataset for accuracy, even when only
  // a subset of families is being updated.
  const averages = buildChestAverages(members);
  const targetFamilies = new Set(options.families ?? FAMILY_OPTIONS);
  const estimates: LegacySizeEstimate[] = [];
  let updatedCount = 0;
  let skippedCount = 0;

  const next = FAMILY_OPTIONS.reduce(
    (acc, family) => {
      if (!targetFamilies.has(family)) {
        acc[family] = rosters[family] ?? [];
        return acc;
      }
      acc[family] = (rosters[family] ?? []).map((row) => {
        if (!isLegacyShirtSizeRow(row)) {
          return row;
        }

        const estimate = estimateChestInchesForRow(
          row,
          averages,
          chestBufferInches,
        );
        if (!estimate) {
          skippedCount++;
          return row;
        }

        updatedCount++;
        estimates.push({
          rowKey: row.rowKey,
          nickName: row.nick_name,
          family,
          age: row.age,
          sex: estimate.sex,
          bandLabel: estimate.bandLabel,
          previousLabel: row.shirt_size,
          chest: estimate.chest,
          label: estimate.label,
          expected: estimate.expected,
          source: estimate.source,
        });

        return {
          ...row,
          shirt_chest_inches: estimate.chest,
          shirt_size: estimate.label,
        };
      });
      return acc;
    },
    {} as Record<Family, RosterRow[]>,
  );

  return {
    rosters: next,
    updatedCount,
    skippedCount,
    estimates,
    averages,
  };
}

export function formatEstimateReport(
  result: ApplyLegacyEstimatesResult,
  chestBufferInches = DEFAULT_CHEST_BUFFER_INCHES,
): string {
  const lines = [
    "Legacy shirt size estimates (gender + age-band, research-blended)",
    `Error buffer: +${chestBufferInches} in`,
    `Invalid-age guard: ages below ${MIN_COMMUNITY_AGE} ignore age and use legacy size, capped at XL`,
    `Abnormal guard: legacy size > expected by ${ABNORMAL_DISPROPORTION_INCHES} in ignores age, capped at XL`,
    `Updated: ${result.updatedCount}`,
    `Skipped: ${result.skippedCount}`,
    "",
    "Blended expected chest by band (measured shrunk toward research):",
  ];

  const sexes: Sex[] = ["male", "female"];
  for (const band of AGE_BANDS) {
    const parts = sexes.map((sex) => {
      const exp = expectedChest(result.averages, band, sex);
      return `${sex} ${exp.value.toFixed(1)} in (n=${exp.measuredCount}, research ${exp.research})`;
    });
    lines.push(`  ${band.label}: ${parts.join(" · ")}`);
  }

  if (result.estimates.length > 0) {
    lines.push("", "Estimates:");
    for (const estimate of result.estimates) {
      lines.push(
        `  ${estimate.nickName} [${estimate.family}] · ${estimate.bandLabel} · ${estimate.previousLabel} → ${estimate.chest} (${estimate.label}) · expected ${estimate.expected.toFixed(1)} (${estimate.source})`,
      );
    }
  }

  return lines.join("\n");
}
