"use client";

import React from "react";
import {
  GiPolarStar,
  GiWingedScepter,
  GiFruitTree,
  GiDove,
} from "react-icons/gi";
import { FaBolt } from "react-icons/fa";
import type { ComponentType } from "react";
import { getOptimizedUrl } from "@/lib/cloudinary";

type IconType = ComponentType<{
  className?: string;
  style?: React.CSSProperties;
}>;

const familyStyles: Record<
  string,
  {
    color: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
    ringColor: string;
    glowColor: string;
    barColor: string;
    lineColor: string;
    icon: IconType;
  }
> = {
  Light: {
    color: "Gold",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/40",
    textColor: "text-yellow-700",
    ringColor: "border-yellow-400",
    glowColor: "ring-yellow-400/25",
    barColor: "bg-yellow-400/70",
    lineColor: "bg-yellow-400/30",
    icon: GiPolarStar,
  },
  Power: {
    color: "Red",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/40",
    textColor: "text-red-700",
    ringColor: "border-red-500",
    glowColor: "ring-red-400/20",
    barColor: "bg-red-500/70",
    lineColor: "bg-red-400/30",
    icon: FaBolt,
  },
  Dominion: {
    color: "Purple",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/40",
    textColor: "text-purple-700",
    ringColor: "border-purple-500",
    glowColor: "ring-purple-400/20",
    barColor: "bg-purple-500/70",
    lineColor: "bg-purple-400/30",
    icon: GiWingedScepter,
  },
  Virtue: {
    color: "Green",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/40",
    textColor: "text-green-700",
    ringColor: "border-green-500",
    glowColor: "ring-green-400/20",
    barColor: "bg-green-500/70",
    lineColor: "bg-green-400/30",
    icon: GiFruitTree,
  },
  Seraphs: {
    color: "Cyan",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/40",
    textColor: "text-cyan-700",
    ringColor: "border-cyan-500",
    glowColor: "ring-cyan-400/20",
    barColor: "bg-cyan-500/70",
    lineColor: "bg-cyan-400/30",
    icon: GiDove,
  },
};

interface BirthdayCardProps {
  firstName: string;
  lastName: string;
  family: string;
  photoUrl?: string;
  age: number;
  cardRef: React.RefObject<HTMLDivElement | null>;
}

export default function BirthdayCard({
  firstName,
  lastName,
  family,
  photoUrl,
  age,
  cardRef,
}: BirthdayCardProps) {
  const styleObj = familyStyles[family] || familyStyles["Light"];
  const Icon = styleObj.icon;
  const initials = `${firstName[0] ?? "U"}${lastName[0] ?? "M"}`.toUpperCase();

  return (
    <div className="flex items-center justify-center p-2 sm:p-3 md:p-4 bg-zinc-100 dark:bg-zinc-900 rounded-xl sm:rounded-2xl border border-zinc-200 dark:border-zinc-800">
      {/* Card — always a perfect square */}
      <div
        ref={cardRef}
        className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-amber-50 via-white to-rose-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 shadow-2xl transition-colors"
      >
        {/* Celebration particle background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Confetti dots */}
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${3 + Math.random() * 6}px`,
                height: `${3 + Math.random() * 6}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                backgroundColor: [
                  "#f59e0b",
                  "#ef4444",
                  "#8b5cf6",
                  "#22c55e",
                  "#ec4899",
                  "#3b82f6",
                  "#f97316",
                ][i % 7],
                opacity: 0.12 + Math.random() * 0.15,
              }}
            />
          ))}
          {/* Star decorations */}
          {[...Array(8)].map((_, i) => (
            <div
              key={`star-${i}`}
              className="absolute text-(--primary-gold)"
              style={{
                top: `${10 + Math.random() * 80}%`,
                left: `${5 + Math.random() * 90}%`,
                fontSize: `${8 + Math.random() * 14}px`,
                opacity: 0.08 + Math.random() * 0.1,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            >
              ✦
            </div>
          ))}
        </div>

        {/* Royal borders */}
        <div className="absolute inset-[2.5%] border border-(--primary-gold)/25 rounded-lg pointer-events-none z-1" />
        <div className="absolute inset-[3.5%] border-2 border-(--primary-gold)/10 rounded-sm pointer-events-none z-1" />

        {/* All content */}
        <div className="absolute inset-[5%] z-10 flex flex-col items-center justify-between py-[4%] px-[3%] overflow-hidden">
          {/* ── Header ── */}
          <div className="flex flex-col items-center gap-1">
            <p
              className="font-bold uppercase text-primary-gold whitespace-nowrap tracking-[0.25em]"
              style={{ fontSize: "clamp(6px, 1.8vw, 9px)" }}
            >
              🎂 Happy Birthday 🎂
            </p>
            <div
              className="h-px bg-primary-gold/40"
              style={{ width: "clamp(28px, 8%, 56px)" }}
            />
          </div>

          {/* ── Photo + Age Badge ── */}
          <div
            className="flex flex-col items-center shrink-0 w-full"
            style={{ gap: "clamp(5px, 1.5%, 12px)" }}
          >
            {/* Triple-ring photo with birthday glow */}
            <div className="relative">
              <div
                className={`rounded-full ring-[clamp(3.5px,1vw,7px)] ring-amber-400/30 flex items-center justify-center shrink-0 aspect-square`}
                style={{
                  width: "clamp(80px, 26vw, 140px)",
                  height: "clamp(80px, 26vw, 140px)",
                }}
              >
                <div
                  className={`w-full h-full rounded-full border-[clamp(2px,0.6vw,4.5px)] border-amber-400 p-[clamp(2.5px,0.8vw,5px)] bg-white dark:bg-zinc-950 flex items-center justify-center overflow-hidden`}
                >
                  <div
                    className={`w-full h-full rounded-full border-[clamp(1.5px,0.4vw,3.5px)] border-primary-gold overflow-hidden bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center font-black text-primary-gold shrink-0`}
                    style={{ fontSize: "clamp(18px, 6vw, 36px)" }}
                  >
                    {photoUrl ? (
                      <img
                        src={getOptimizedUrl(photoUrl)}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        style={{
                          objectPosition: "center center",
                          display: "block",
                        }}
                      />
                    ) : (
                      initials
                    )}
                  </div>
                </div>
              </div>

              {/* Age badge */}
              <div
                className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white font-black shadow-lg border-2 border-white dark:border-zinc-950"
                style={{
                  width: "clamp(28px, 8vw, 44px)",
                  height: "clamp(28px, 8vw, 44px)",
                  fontSize: "clamp(10px, 3vw, 16px)",
                }}
              >
                +1
              </div>
            </div>

            {/* Family pill */}
            <div
              className="flex flex-col items-center w-full"
              style={{ gap: "clamp(2px, 0.5%, 5px)" }}
            >
              <p
                className="font-bold mt-3 mb-1 uppercase text-zinc-400 dark:text-zinc-600 tracking-[0.25em]"
                style={{ fontSize: "clamp(5.5px, 1.3vw, 8px)" }}
              >
                From the Family of
              </p>

              <div
                className="flex items-center w-[90%]"
                style={{ gap: "clamp(4px, 1%, 10px)" }}
              >
                <div className={`flex-1 h-px ${styleObj.lineColor}`} />
                <div
                  className={`inline-flex items-center rounded-full ${styleObj.bgColor} ${styleObj.textColor} border-[1.5px] ${styleObj.borderColor} font-black whitespace-nowrap`}
                  style={{
                    gap: "clamp(3px, 0.8%, 5px)",
                    padding: "clamp(3px, 0.8%, 6px) clamp(8px, 2.5%, 18px)",
                    fontSize: "clamp(6.5px, 1.6vw, 11px)",
                  }}
                >
                  <Icon
                    style={{
                      width: "clamp(8px, 1.8%, 13px)",
                      height: "clamp(8px, 1.8%, 13px)",
                      flexShrink: 0,
                    }}
                  />
                  {family}
                </div>
                <div className={`flex-1 h-px ${styleObj.lineColor}`} />
              </div>
            </div>
          </div>

          {/* ── Name ── */}
          <div className="flex flex-col items-center w-full">
            <h2
              className="font-black tracking-tight text-zinc-900 dark:text-zinc-100 uppercase leading-none break-words text-center max-w-[90%]"
              style={{ fontSize: "clamp(13px, 4.5vw, 28px)" }}
            >
              {firstName} {lastName}
            </h2>
          </div>

          {/* ── Birthday Message ── */}
          <div
            className="flex flex-col items-center"
            style={{ gap: "clamp(2px, 0.5%, 3px)" }}
          >
            <p
              className="font-medium text-zinc-500 dark:text-zinc-400 text-center leading-tight"
              style={{ fontSize: "clamp(6px, 1.6vw, 11px)" }}
            >
              Wishing you a{" "}
              <span className="font-bold text-(--primary-gold)">
                blessed & wonderful
              </span>{" "}
              birthday!
            </p>
            <p
              className="font-bold text-zinc-400 dark:text-zinc-600 text-center"
              style={{ fontSize: "clamp(6px, 1.5vw, 10px)" }}
            >
              🎉 May this new year of life bring you joy, grace & fulfilment! 🎉
            </p>
            <p
              className="font-bold uppercase text-zinc-300 dark:text-zinc-700 tracking-[0.2em] mt-1"
              style={{ fontSize: "clamp(5.5px, 1.2vw, 8px)" }}
            >
              144,000 Virgins Body
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
