export const SHIRT_SIZE_CHART = [
  { label: "5C", min: 20, max: 24 },
  { label: "4C", min: 24, max: 26 },
  { label: "3C", min: 26, max: 28 },
  { label: "2C", min: 28, max: 30 },
  { label: "C", min: 30, max: 32 },
  { label: "XXS", min: 32, max: 34 },
  { label: "XS", min: 34, max: 36 },
  { label: "S", min: 36, max: 38 },
  { label: "M", min: 38, max: 40 },
  { label: "L", min: 40, max: 42 },
  { label: "XL", min: 42, max: 44 },
  { label: "2XL", min: 44, max: 46 },
  { label: "3XL", min: 46, max: 48 },
  { label: "4XL", min: 48, max: 50 },
  { label: "5XL", min: 50, max: 52 },
  { label: "6XL", min: 52, max: 54 },
] as const;

export type ShirtSizeLabel = (typeof SHIRT_SIZE_CHART)[number]["label"];

export const SHIRT_SIZES = SHIRT_SIZE_CHART.map((s) => s.label);

export const MIN_CHEST_INCHES = 20;
export const MAX_CHEST_INCHES = 54;

export function lookupShirtSize(chest: number): string | null {
  const matches = SHIRT_SIZE_CHART.filter(
    (entry) => chest >= entry.min && chest <= entry.max,
  );
  if (matches.length === 0) return null;
  return matches.reduce((best, entry) =>
    entry.min > best.min ? entry : best,
  ).label;
}

export function formatShirtSizeDisplay(
  chest: number | null | undefined,
  label: string | null | undefined,
): string {
  if (chest != null && label) {
    const formatted =
      chest % 1 === 0 ? String(chest) : chest.toFixed(1).replace(/\.0$/, "");
    return `${formatted} (${label})`;
  }
  if (label) return label;
  return "N/A";
}

export function parseLegacyShirtSize(value: string): {
  chest: number | null;
  label: string | null;
} {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return { chest: null, label: null };

  const combined = trimmed.match(/^([\d.]+)\s*\(([^)]+)\)$/);
  if (combined) {
    const chest = parseFloat(combined[1]);
    const label = combined[2].trim();
    return {
      chest: Number.isFinite(chest) ? chest : null,
      label: label || null,
    };
  }

  return { chest: null, label: trimmed };
}

export function validateChestInches(value: string): {
  valid: boolean;
  chest: number | null;
  label: string | null;
  error: string | null;
} {
  const trimmed = value.trim();
  if (!trimmed) {
    return { valid: false, chest: null, label: null, error: "Chest measurement is required." };
  }

  const chest = parseFloat(trimmed);
  if (!Number.isFinite(chest)) {
    return { valid: false, chest: null, label: null, error: "Enter a valid number." };
  }

  if (chest % 0.5 !== 0) {
    return {
      valid: false,
      chest: null,
      label: null,
      error: "Use whole or half inches (e.g. 25 or 25.5).",
    };
  }

  if (chest < MIN_CHEST_INCHES || chest > MAX_CHEST_INCHES) {
    return {
      valid: false,
      chest: null,
      label: null,
      error: `Chest must be between ${MIN_CHEST_INCHES} and ${MAX_CHEST_INCHES} inches.`,
    };
  }

  const label = lookupShirtSize(chest);
  if (!label) {
    return {
      valid: false,
      chest: null,
      label: null,
      error: "Could not determine a size for this measurement.",
    };
  }

  return { valid: true, chest, label, error: null };
}
