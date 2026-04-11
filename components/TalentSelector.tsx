"use client";

import { useEffect, useState } from "react";
import { X, Plus, Check } from "lucide-react";

export const TALENT_OPTIONS = [
  "Singing",
  "Dancing",
  "Preaching",
  "Spiritual Vision",
  "Healing",
  "Instrumentalist",
  "Intercession",
  "Teaching",
  "Evangelism",
];

interface TalentSelectorProps {
  selectedTalents: string[];
  onChange: (talents: string[]) => void;
}

export default function TalentSelector({ selectedTalents, onChange }: TalentSelectorProps) {
  const [customInput, setCustomInput] = useState("");
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  const toggleTalent = (talent: string) => {
    if (selectedTalents.includes(talent)) {
      onChange(selectedTalents.filter((t) => t !== talent));
    } else {
      onChange([...selectedTalents, talent]);
    }
  };

  const addCustomTalent = () => {
    const trimmed = customInput.trim();
    if (trimmed && !selectedTalents.includes(trimmed)) {
      onChange([...selectedTalents, trimmed]);
      setCustomInput("");
      setIsAddingCustom(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomTalent();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {TALENT_OPTIONS.map((talent) => {
          const isSelected = selectedTalents.includes(talent);
          return (
            <button
              key={talent}
              type="button"
              onClick={() => toggleTalent(talent)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                isSelected
                  ? "border-(--primary-gold) bg-(--primary-gold)/10 text-(--primary-gold) shadow-sm"
                  : "border-zinc-300 bg-white/50 text-zinc-600 hover:border-zinc-400 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-black/50 dark:text-zinc-400 dark:hover:bg-zinc-900"
              }`}
            >
              {talent}
              {isSelected && <Check className="h-3 w-3" />}
            </button>
          );
        })}

        {/* Custom Talents not in the predefined list */}
        {selectedTalents
          .filter((t) => !TALENT_OPTIONS.includes(t))
          .map((talent) => (
            <button
              key={talent}
              type="button"
              onClick={() => toggleTalent(talent)}
              className="inline-flex items-center gap-1.5 rounded-full border border-(--primary-gold) bg-(--primary-gold)/10 px-4 py-1.5 text-sm font-medium text-(--primary-gold) shadow-sm transition-all duration-200"
            >
              {talent}
              <X className="h-3 w-3" />
            </button>
          ))}

        {isAddingCustom ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                if (!customInput.trim()) setIsAddingCustom(false);
              }}
              placeholder="Type talent..."
              className="rounded-full border border-(--primary-gold) bg-white px-4 py-1.5 text-sm outline-none dark:bg-zinc-900 dark:text-zinc-100"
            />
            <button
              type="button"
              onClick={addCustomTalent}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-(--primary-gold) text-white hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsAddingCustom(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-zinc-400 px-4 py-1.5 text-sm font-medium text-zinc-500 hover:border-zinc-500 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-900 transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            Other
          </button>
        )}
      </div>

      {selectedTalents.length > 0 && (
        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
          <span>Selected talents: {selectedTalents.join(", ")}</span>
        </div>
      )}
    </div>
  );
}
