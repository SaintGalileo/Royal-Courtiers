"use client";

import { SacredRecord, UserProgress } from "@/services/sacred-records";
import DayNode, { DayState } from "./DayNode";
import { motion } from "framer-motion";

interface ProgressPathProps {
  records: SacredRecord[];
  userProgress: UserProgress[];
  onNodeClick: (record: SacredRecord) => void;
}

export default function ProgressPath({
  records,
  userProgress,
  onNodeClick,
}: ProgressPathProps) {
  // Sort records by day_number
  const sortedRecords = [...records].sort((a, b) => a.day_number - b.day_number);

  // Find the current active day (first incomplete day)
  const lastCompletedDay = userProgress
    .filter(p => p.completed)
    .reduce((max, p) => Math.max(max, p.day_number), 0);
    
  const activeDay = lastCompletedDay + 1;
  const offsets = sortedRecords.map((_, i) => [0, 80, -80, 90, -90, 70, -70, 0][i % 8]);

  return (
    <div className="relative mx-auto flex w-full max-w-xl flex-col items-center py-12 px-4 space-y-16 sm:space-y-20">
      {/* Background SVG path for the line */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <svg
          className="h-full w-full"
          viewBox={`0 0 400 ${sortedRecords.length * 100}`}
          preserveAspectRatio="none"
        >
          <path
            d={sortedRecords.map((_, i) => {
              const x = 200 + offsets[i];
              const y = i * 100 + 50; // Approximating spacing
              if (i === 0) return `M ${x} ${y}`;
              const prevX = 200 + offsets[i-1];
              const prevY = (i-1) * 100 + 50;
              const cpY1 = prevY + 50;
              const cpY2 = y - 50;
              return `C ${prevX} ${cpY1}, ${x} ${cpY2}, ${x} ${y}`;
            }).join(' ')}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray="8 12"
            className="text-zinc-200 dark:text-zinc-800"
          />
        </svg>
      </div>

      {sortedRecords.map((record, index) => {
        const dayNum = record.day_number;
        const progress = userProgress.find(p => p.day_number === dayNum);
        
        let state: DayState = "locked";
        if (progress?.completed) {
          state = "completed";
        } else if (dayNum === activeDay) {
          state = "active";
        }

        const offset = offsets[index];

        return (
          <div key={record.id} className="relative z-10">
            
            <DayNode
              dayNumber={dayNum}
              state={state}
              onClick={() => onNodeClick(record)}
              offset={offset}
            />
            
            {/* Add decorative labels or stars for certain milestones */}
            {index % 7 === 0 && index !== 0 && (
              <div 
                className="absolute -right-24 top-1/2 -translate-y-1/2 flex items-center gap-2 text-xs font-bold text-zinc-400"
                style={{ transform: `translateX(${offset + 80}px) translateY(-50%)` }}
              >
                <div className="h-px w-8 bg-zinc-200 dark:bg-zinc-800" />
                Week {Math.ceil(index / 7)}
              </div>
            )}
          </div>
        );
      })}

      {/* Completion cap stone */}
      <div className="mt-8 rounded-2xl border-4 border-dashed border-zinc-100 bg-zinc-50 p-8 text-center dark:border-zinc-900 dark:bg-zinc-950/20">
        <p className="text-sm font-bold text-zinc-400">Unlock more daily records by staying consistent.</p>
      </div>
    </div>
  );
}
