"use client";

import { useState } from "react";
import { toast } from "sonner";
import ShirtSizeInput, { validateChestInches } from "@/components/ShirtSizeInput";
import { getErrorMessage } from "@/lib/save-member-shirt-size";

type UpdateShirtSizeModalProps = {
  onSave: (chest: number, label: string) => Promise<void>;
  onDismiss: () => void;
};

export default function UpdateShirtSizeModal({
  onSave,
  onDismiss,
}: UpdateShirtSizeModalProps) {
  const [chestValue, setChestValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const validation = validateChestInches(chestValue);
    if (!validation.valid || validation.chest == null || !validation.label) {
      toast.error(validation.error ?? "Invalid chest measurement.");
      return;
    }

    setIsSaving(true);
    try {
      await onSave(validation.chest, validation.label);
    } catch (err) {
      toast.error(getErrorMessage(err) || "Failed to save shirt size. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-(--primary-gold)/40 bg-white p-7 text-zinc-900 shadow-2xl dark:bg-zinc-950 dark:text-zinc-100">
        <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-(--primary-gold)/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-(--primary-gold)/8 blur-2xl" />

        <div className="relative space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">Update Your Shirt Size</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              We now use chest measurements to assign anniversary polo sizes. Enter
              your chest measurement in inches and we will assign the correct size
              automatically.
            </p>
          </div>

          <ShirtSizeInput value={chestValue} onChange={setChestValue} />

          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary flex-1 rounded-lg px-5 py-2.5 text-sm font-bold tracking-wide disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Size"}
            </button>
            <button
              type="button"
              onClick={onDismiss}
              disabled={isSaving}
              className="flex-1 rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 disabled:opacity-50"
            >
              Remind me later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
