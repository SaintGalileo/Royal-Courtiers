"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { SacredRecord, UserProgress } from "@/services/sacred-records";
import DayNode, { DayState } from "./DayNode";
import { Trophy } from "lucide-react";
import { getDayLockMessage } from "@/lib/sacred-records-game";
interface ProgressPathProps {
  records: SacredRecord[];
  userProgress: UserProgress[];
  maxCalendarDay: number;
  onNodeClick: (record: SacredRecord) => void;
  effectsPaused?: boolean;
}

const NODE_SPACING = 140;
const VIEW_WIDTH = 400;
const CENTER_X = 200;
const FADE_RANGE_PX = 110;

type FadeStyle = { scale: number; opacity: number };

function horizonStyle(screenY: number, horizonY: number): FadeStyle {
  const dist = screenY - horizonY;
  if (dist <= 0) return { scale: 0, opacity: 0 };
  if (dist >= FADE_RANGE_PX) return { scale: 1, opacity: 1 };
  const t = dist / FADE_RANGE_PX;
  return {
    scale: 0.15 + t * 0.85,
    opacity: t,
  };
}

function fadeArraysEqual(a: FadeStyle[], b: FadeStyle[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((s, i) => s.scale === b[i].scale && s.opacity === b[i].opacity);
}

function readHorizonY(scrollRoot: HTMLElement): number {
  const horizonEl = scrollRoot.querySelector(
    "[data-sacred-horizon]",
  ) as HTMLElement | null;
  return horizonEl
    ? horizonEl.getBoundingClientRect().top
    : scrollRoot.getBoundingClientRect().top + 80;
}

export default function ProgressPath({
  records,
  userProgress,
  maxCalendarDay,
  onNodeClick,
  effectsPaused = false,
}: ProgressPathProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [scrollRoot, setScrollRoot] = useState<HTMLElement | null>(null);
  const [nodeStyles, setNodeStyles] = useState<FadeStyle[]>([]);
  const [segStyles, setSegStyles] = useState<FadeStyle[]>([]);

  const sortedRecords = useMemo(
    () => [...records].sort((a, b) => a.day_number - b.day_number),
    [records],
  );

  const completedDayNumbers = new Set(
    userProgress.filter((p) => p.completed).map((p) => p.day_number),
  );

  const offsets = sortedRecords.map(
    (_, i) => [0, 64, -64, 72, -72, 56, -56, 0][i % 8],
  );

  const pathHeight = Math.max(
    sortedRecords.length * NODE_SPACING,
    NODE_SPACING,
  );

  const activeIndex = sortedRecords.findIndex((record, index) => {
    const displayDay = index + 1;
    if (completedDayNumbers.has(record.day_number)) return false;
    if (displayDay > maxCalendarDay) return false;
    const prevDone =
      index === 0 ||
      completedDayNumbers.has(sortedRecords[index - 1].day_number);
    return prevDone;
  });

  const allComplete =
    sortedRecords.length > 0 &&
    sortedRecords.every((r) => completedDayNumbers.has(r.day_number));

  const rafRef = useRef<number | null>(null);
  const effectsPausedRef = useRef(effectsPaused);

  useEffect(() => {
    effectsPausedRef.current = effectsPaused;
  }, [effectsPaused]);

  useEffect(() => {
    const el = rootRef.current?.closest(
      "[data-sacred-scroll]",
    ) as HTMLElement | null;
    setScrollRoot(el);
  }, []);

  const updateFades = useCallback(() => {
    if (!scrollRoot || effectsPausedRef.current) return;
    const horizonY = readHorizonY(scrollRoot);

    const nextNodes = sortedRecords.map((_, i) => {
      const el = nodeRefs.current[i];
      if (!el) return { scale: 1, opacity: 1 };
      const rect = el.getBoundingClientRect();
      return horizonStyle(rect.top + rect.height / 2, horizonY);
    });
    setNodeStyles((prev) =>
      fadeArraysEqual(prev, nextNodes) ? prev : nextNodes,
    );

    if (nextNodes.length < 2) {
      setSegStyles((prev) => (prev.length === 0 ? prev : []));
      return;
    }

    const nextSegs = nextNodes.slice(0, -1).map((a, i) => {
      const b = nextNodes[i + 1];
      return {
        scale: Math.min(a.scale, b.scale),
        opacity: Math.min(a.opacity, b.opacity),
      };
    });
    setSegStyles((prev) =>
      fadeArraysEqual(prev, nextSegs) ? prev : nextSegs,
    );
  }, [scrollRoot, sortedRecords]);

  const scheduleFadeUpdate = useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      updateFades();
    });
  }, [updateFades]);

  // Initial measure after layout (refs need a frame to attach).
  useEffect(() => {
    if (!scrollRoot || effectsPaused) return;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => updateFades());
    });
    return () => cancelAnimationFrame(id);
  }, [scrollRoot, sortedRecords.length, effectsPaused, updateFades]);

  useEffect(() => {
    if (!scrollRoot) return;

    updateFades();
    scrollRoot.addEventListener("scroll", scheduleFadeUpdate, { passive: true });
    window.addEventListener("resize", scheduleFadeUpdate);

    return () => {
      scrollRoot.removeEventListener("scroll", scheduleFadeUpdate);
      window.removeEventListener("resize", scheduleFadeUpdate);
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [scrollRoot, updateFades, scheduleFadeUpdate]);

  // Resume fades after a modal/explainer closes.
  useEffect(() => {
    if (!scrollRoot || effectsPaused) return;
    scheduleFadeUpdate();
  }, [effectsPaused, scrollRoot, scheduleFadeUpdate]);

  return (
    <div
      ref={rootRef}
      className="relative mx-auto flex w-full max-w-xl flex-col items-center px-2 pt-24 pb-6 sm:px-4"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-8 bottom-24 z-0"
        aria-hidden="true"
      >
        <svg
          ref={svgRef}
          className="h-full w-full text-(--primary-gold)/25 dark:text-(--primary-gold)/20"
          viewBox={`0 0 ${VIEW_WIDTH} ${pathHeight}`}
          preserveAspectRatio="none"
        >
          {sortedRecords.slice(1).map((_, i) => {
            const x0 = CENTER_X + offsets[i];
            const y0 = i * NODE_SPACING + NODE_SPACING / 2;
            const x1 = CENTER_X + offsets[i + 1];
            const y1 = (i + 1) * NODE_SPACING + NODE_SPACING / 2;
            const midY = (y0 + y1) / 2;
            const midX = (x0 + x1) / 2;
            const style = segStyles[i] ?? { scale: 1, opacity: 1 };

            return (
              <g
                key={`seg-${i}`}
                opacity={style.opacity}
                transform={`translate(${midX} ${midY}) scale(${style.scale}) translate(${-midX} ${-midY})`}
              >
                <path
                  d={`M ${x0} ${y0} C ${x0} ${midY}, ${x1} ${midY}, ${x1} ${y1}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray="6 10"
                  strokeLinecap="round"
                />
              </g>
            );
          })}
        </svg>
      </div>

      <div
        className="relative z-10 flex w-full flex-col items-center"
        style={{ gap: `${NODE_SPACING - 96}px` }}
      >
        {sortedRecords.map((record, index) => {
          const displayDay = index + 1;
          const isCompleted = completedDayNumbers.has(record.day_number);
          const prevDone =
            index === 0 ||
            completedDayNumbers.has(sortedRecords[index - 1].day_number);
          const calendarOpen = displayDay <= maxCalendarDay;

          let state: DayState = "locked";
          if (isCompleted) {
            state = "completed";
          } else if (calendarOpen && prevDone && index === activeIndex) {
            state = "active";
          }

          const style = nodeStyles[index] ?? { scale: 1, opacity: 1 };
          const gone = style.opacity <= 0.01;
          const lockMessage =
            state === "locked"
              ? getDayLockMessage(displayDay, maxCalendarDay, prevDone)
              : null;

          return (
            <div
              key={record.id}
              ref={(el) => {
                nodeRefs.current[index] = el;
              }}
              className="relative flex justify-center py-2 will-change-transform"
              style={{
                transform: `scale(${style.scale})`,
                opacity: style.opacity,
                pointerEvents: gone ? "none" : undefined,
                transition: "transform 80ms linear, opacity 80ms linear",
              }}
            >
              <DayNode
                dayNumber={displayDay}
                state={state}
                onClick={() => onNodeClick(record)}
                onLockedClick={() => {
                  if (!lockMessage) return;
                  toast.info(`Day ${displayDay} locked`, {
                    description: lockMessage,
                    duration: 7000,
                  });
                }}
                offset={offsets[index]}
              />
            </div>
          );
        })}
      </div>

      <div
        className={`mt-12 w-full max-w-sm rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
          allComplete
            ? "border-(--primary-gold)/50 bg-(--primary-gold)/10"
            : "border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-950/40"
        }`}
      >
        {allComplete ? (
          <>
            <Trophy className="mx-auto mb-2 h-7 w-7 text-(--primary-gold)" />
            <p className="text-sm font-bold text-(--primary-gold)">
              Path complete — well done!
            </p>
          </>
        ) : maxCalendarDay === 0 ? (
          <p className="text-sm font-medium text-zinc-400">
            Knowledge bubbles unlock when the countdown reaches 14 days to go.
          </p>
        ) : (
          <p className="text-sm font-medium text-zinc-400">
            Day {maxCalendarDay} is today&apos;s bubble — complete earlier days
            in order to catch up.
          </p>
        )}
      </div>
    </div>
  );
}
