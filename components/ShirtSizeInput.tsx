"use client";

import {
  formatShirtSizeDisplay,
  MAX_CHEST_INCHES,
  MIN_CHEST_INCHES,
  validateChestInches,
} from "@/lib/shirt-sizes";

type ShirtSizeInputProps = {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  compact?: boolean;
  showPreview?: boolean;
};

export default function ShirtSizeInput({
  value,
  onChange,
  id = "shirt-chest-inches",
  compact = false,
  showPreview = true,
}: ShirtSizeInputProps) {
  const validation = validateChestInches(value);
  const preview =
    validation.valid && validation.chest != null && validation.label
      ? formatShirtSizeDisplay(validation.chest, validation.label)
      : null;

  return (
    <div className={compact ? "space-y-1" : "space-y-2"}>
      <label
        htmlFor={id}
        className={
          compact
            ? "text-[10px] font-black uppercase tracking-widest text-zinc-500"
            : "text-sm font-semibold"
        }
      >
        Chest measurement (inches)
      </label>
      <input
        id={id}
        type="number"
        min={MIN_CHEST_INCHES}
        max={MAX_CHEST_INCHES}
        step={0.5}
        inputMode="decimal"
        placeholder="e.g. 38"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={
          compact
            ? "w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-(--primary-gold) dark:border-zinc-700 dark:bg-zinc-900"
            : "w-full rounded-md border border-zinc-400 bg-white/50 px-3 py-2 dark:border-zinc-700 dark:bg-black/50 outline-none focus:border-(--primary-gold) transition-colors"
        }
      />
      {!compact && (
        <p className="text-xs text-zinc-500">
          Measure around the fullest part of your chest, in inches.
        </p>
      )}
      {value.trim() && validation.error && (
        <p className="text-xs text-red-600 dark:text-red-400">{validation.error}</p>
      )}
      {showPreview && preview && (
        <p className="text-sm font-semibold text-(--primary-gold)">
          Your size: {preview}
        </p>
      )}
    </div>
  );
}

export { validateChestInches };
