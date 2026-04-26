"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import WelcomePopup from "@/components/WelcomePopup";
import {
  GiPolarStar,
  GiWingedScepter,
  GiFruitTree,
  GiDove,
} from "react-icons/gi";
import { FaBolt } from "react-icons/fa";
import { ChevronDown } from "lucide-react";

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const EVENT_DATE = new Date("2026-08-10T00:00:00");

const EVENT_FAMILIES = [
  {
    family: "Family of Dominion",
    father: "Brother David Abeng",
    mother: "Sister Divine Edosomwan",
    icon: GiWingedScepter,
    colorClass: "text-purple-500 drop-shadow-[0_0_14px_rgba(168,85,247,0.85)]",
  },
  {
    family: "Family of Light",
    father: "Brother Paul Etop",
    mother: "Sister Sarah Cyril",
    icon: GiPolarStar,
    colorClass: "text-yellow-500 drop-shadow-[0_0_14px_rgba(234,179,8,0.85)]",
  },
  {
    family: "Family of Power",
    father: "Brother Victor Omolu",
    mother: "Sister Fortune Umoh",
    icon: FaBolt,
    colorClass: "text-red-500 drop-shadow-[0_0_14px_rgba(239,68,68,0.85)]",
  },
  {
    family: "Family of Virtue",
    father: "Brother Henry Igani",
    mother: "Sister Mercy Alexander",
    icon: GiFruitTree,
    colorClass: "text-green-500 drop-shadow-[0_0_14px_rgba(34,197,94,0.85)]",
  },
];

const HERO_IMAGES = [
  "/virgins/three.jpg",
  "/virgins/one.jpg",
  "/virgins/two.jpg",
];

const WALL_PREVIEW_FRAMES = [
  "Frame 1",
  "Frame 2",
  "Frame 3",
  "Frame 4",
  "Frame 5",
  "Frame 6",
];

function getCountdown(now: Date): Countdown {
  const distance = EVENT_DATE.getTime() - now.getTime();
  if (distance <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((distance / (1000 * 60)) % 60),
    seconds: Math.floor((distance / 1000) % 60),
  };
}

function CountdownDigit({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center">
      <div className="relative overflow-hidden">
        <span className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none tabular-nums">
          {display}
        </span>
      </div>
      <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-white/50">
        {label}
      </span>
    </div>
  );
}

export default function Home() {
  const [countdown, setCountdown] = useState<Countdown>(() =>
    getCountdown(new Date()),
  );
  const [currentSlide, setCurrentSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState<number | null>(null);
  const [isFading, setIsFading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown tick
  useEffect(() => {
    const timer = setInterval(
      () => setCountdown(getCountdown(new Date())),
      1000,
    );
    return () => clearInterval(timer);
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      goToSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const goToSlide = (nextFn: (prev: number) => number) => {
    setCurrentSlide((prev) => {
      const next = nextFn(prev);
      setPrevSlide(prev);
      setIsFading(true);
      setTimeout(() => {
        setIsFading(false);
        setPrevSlide(null);
      }, 900);
      return next;
    });
  };

  const countdownBlocks = useMemo(
    () => [
      { label: "Days", value: countdown.days },
      { label: "Hrs", value: countdown.hours },
      { label: "Min", value: countdown.minutes },
      { label: "Sec", value: countdown.seconds },
    ],
    [countdown],
  );

  return (
    <main className="flex w-full flex-col">
      <WelcomePopup />

      {/* ─── HERO ─── */}
      <section className="relative w-full h-screen overflow-hidden">
        {/* Slide images */}
        {HERO_IMAGES.map((src, idx) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
            style={{
              backgroundImage: `url(${src})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              animation:
                idx === currentSlide
                  ? "kenBurns 10s ease-in-out infinite alternate"
                  : "none",
            }}
          />
        ))}

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 z-20 bg-gradient-to-b from-black/55 via-black/20 to-black/70" />

        {/* Hero content */}
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center text-center px-4">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.35em] text-(--primary-gold) mb-4">
            August 10, 2026
          </p>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white leading-tight max-w-4xl">
            35th Anniversary
            <span className="block text-(--primary-gold) italic font-serif">
              Celebration
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base sm:text-lg text-white/75 leading-relaxed">
            <p className="text-xl -mb-8">The Family Love Built </p>
            <br /> Bearers of the Seal of the Universal Monarch
          </p>

          <div className="mt-10 flex items-center gap-4">
            <Link
              href="/create-account"
              className="btn-primary rounded-full px-7 py-3 text-sm font-bold shadow-lg shadow-black/30 transition-transform active:scale-95"
            >
              Join a Family
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-white/30 bg-white/10 backdrop-blur-sm px-7 py-3 text-sm font-bold text-white hover:bg-white/20 transition-all"
            >
              Log In
            </Link>
          </div>
        </div>

        {/* ─── COUNTDOWN — pinned bottom-right ─── */}
        <div className="absolute bottom-8 right-6 sm:right-10 z-40">
          <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black/40 backdrop-blur-md px-6 py-4 shadow-2xl">
            {/* Gold top accent line */}
            <div className="absolute top-0 left-4 right-4 h-[1.5px] bg-gradient-to-r from-transparent via-(--primary-gold) to-transparent" />

            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-(--primary-gold) text-center mb-3">
              Countdown
            </p>

            <div className="flex items-center gap-4">
              {countdownBlocks.map((item, i) => (
                <div key={item.label} className="flex items-center gap-4">
                  <CountdownDigit value={item.value} label={item.label} />
                  {i < countdownBlocks.length - 1 && (
                    <span className="text-white/30 text-2xl font-thin mb-3">
                      :
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Gold bottom accent line */}
            <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-(--primary-gold)/50 to-transparent" />
          </div>
        </div>

        {/* Carousel dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2">
          {HERO_IMAGES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(() => idx)}
              className={`rounded-full transition-all duration-300 ${
                idx === currentSlide
                  ? "w-6 h-2 bg-(--primary-gold)"
                  : "w-2 h-2 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 translate-y-8 flex flex-col items-center gap-1 text-white/40 animate-bounce">
          <ChevronDown size={20} />
        </div>
      </section>

      {/* ─── REST OF PAGE ─── */}
      <div className="flex w-full flex-col gap-10 px-3 py-12 sm:px-4 md:px-20">
        {/* Event Families */}
        <section className="rounded-2xl border border-(--primary-gold)/35 p-6">
          <h2 className="text-2xl font-bold">Event Families</h2>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            Meet the families serving at the event, each with a father and a
            mother.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {EVENT_FAMILIES.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.family}
                  className="relative overflow-hidden rounded-xl border border-(--primary-gold)/35 bg-black/5 p-5 dark:bg-white/5"
                >
                  <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-black/10 dark:bg-white/10 ${item.colorClass}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-(--primary-gold)">
                    {item.family}
                  </h3>
                  <div className="mt-3 space-y-1">
                    <p className="text-sm">
                      <span className="font-semibold text-zinc-500 dark:text-zinc-400">
                        Father:
                      </span>{" "}
                      {item.father}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold text-zinc-500 dark:text-zinc-400">
                        Mother:
                      </span>{" "}
                      {item.mother}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Hall of Fame */}
        <section className="rounded-2xl border border-(--primary-gold)/35 p-6 mb-10">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-bold">Hall of Fame</h2>
            <Link
              className="text-(--primary-gold) font-semibold underline underline-offset-4"
              href="/hall-of-fame"
            >
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
                  <span className="text-4xl font-bold text-(--primary-gold)">
                    ?
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
