"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import WelcomePopup from "@/components/WelcomePopup";
import { GiPolarStar, GiWingedScepter, GiFruitTree } from "react-icons/gi";
import { FaBolt } from "react-icons/fa";

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const EVENT_DATE = new Date("2026-08-10T00:00:00");
const EVENT_FAMILIES = [
  { family: "Family of Dominion", father: "Brother Emmanuel Godwin", mother: "Sister Divine Edosomwan", icon: GiWingedScepter, colorClass: "text-purple-500 drop-shadow-[0_0_14px_rgba(168,85,247,0.85)]" },
  { family: "Family of Light", father: "Brother Paul Etop", mother: "Sister Sarah Cyril", icon: GiPolarStar, colorClass: "text-yellow-500 drop-shadow-[0_0_14px_rgba(234,179,8,0.85)]" },
  { family: "Family of Power", father: "Brother Victor Omolu", mother: "Sister Fortune Umoh", icon: FaBolt, colorClass: "text-red-500 drop-shadow-[0_0_14px_rgba(239,68,68,0.85)]" },
  { family: "Family of Virtue", father: "Brother Henry Igani", mother: "Sister Mercy Alexander", icon: GiFruitTree, colorClass: "text-green-500 drop-shadow-[0_0_14px_rgba(34,197,94,0.85)]" },
];
const WALL_PREVIEW_FRAMES = ["Frame 1", "Frame 2", "Frame 3", "Frame 4", "Frame 5", "Frame 6"];

function getCountdown(now: Date): Countdown {
  const distance = EVENT_DATE.getTime() - now.getTime();

  if (distance <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((distance / (1000 * 60)) % 60);
  const seconds = Math.floor((distance / 1000) % 60);

  return { days, hours, minutes, seconds };
}

export default function Home() {
  const [countdown, setCountdown] = useState<Countdown>(() => getCountdown(new Date()));

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getCountdown(new Date()));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const countdownBlocks = useMemo(
    () => [
      { label: "Days", value: countdown.days },
      { label: "Hours", value: countdown.hours },
      { label: "Minutes", value: countdown.minutes },
      { label: "Seconds", value: countdown.seconds },
    ],
    [countdown],
  );

  return (
    <main className="flex w-full flex-col gap-10 px-3 py-8 sm:px-4 md:px-20 relative">
      <WelcomePopup />

      <section className="rounded-2xl border border-(--primary-gold)/40 bg-linear-to-br from-(--primary-gold)/20 via-transparent to-(--primary-gold)/5 p-8">
        <p className="text-primary-gold text-sm uppercase tracking-[0.2em]">August 10, 2026</p>
        <h1 className="mt-3 text-4xl font-bold md:text-5xl">35th Anniversary Celebration</h1>
        <p className="mt-3 max-w-2xl text-lg">
          The Family Love Built; Bearers of the Seal of the Universal Monarch
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-4">
          {countdownBlocks.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-(--primary-gold)/40 bg-black/5 p-4 text-center dark:bg-white/5"
            >
              <p className="text-3xl font-bold">{String(item.value).padStart(2, "0")}</p>
              <p className="mt-1 text-xs uppercase tracking-widest">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-(--primary-gold)/35 p-6 ">
        <h2 className="text-2xl font-bold">Event Families</h2>
        <p className="mt-2">
          Meet the families serving at the event, each with a father and a mother.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {EVENT_FAMILIES.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.family}
                className="relative overflow-hidden rounded-xl border border-(--primary-gold)/35 bg-black/5 p-5 dark:bg-white/5"
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-black/10 dark:bg-white/10 ${item.colorClass}`}>
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="text-lg font-bold text-primary-gold">{item.family}</h3>
                <div className="mt-3 space-y-1">
                  <p className="text-sm">
                    <span className="font-semibold text-zinc-500 dark:text-zinc-400">Father:</span> {item.father}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold text-zinc-500 dark:text-zinc-400">Mother:</span> {item.mother}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-(--primary-gold)/35 p-6 mb-10">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-bold">Wall of Fame</h2>
          <Link className="text-primary-gold font-semibold underline underline-offset-4" href="/wall-of-fame">
            See all
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {WALL_PREVIEW_FRAMES.map((frame, idx) => (
            <div
              key={frame}
              className={`wall-frame wall-frame-portrait flex aspect-3/4 items-center justify-center rounded-xl border border-(--primary-gold)/40 p-2 ${idx === 5 ? "lg:hidden" : ""}`}
            >
              <div className="wall-frame-inner flex h-full w-full items-center justify-center rounded-md border border-(--primary-gold)/45">
                <span className="text-4xl font-bold text-primary-gold">?</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
