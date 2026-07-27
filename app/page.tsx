"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import WelcomePopup from "@/components/WelcomePopup";
import SacredScrollFab from "@/components/SacredScrollFab";
import { GiPolarStar, GiWingedScepter, GiFruitTree } from "react-icons/gi";
import { FaBolt } from "react-icons/fa";
import { ChevronDown, Cake, Gift } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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
    fatherImage:
      "https://res.cloudinary.com/dgmo4mkhk/image/upload/v1776934848/photo_2026-04-23_10-00-57_rhas9s.jpg",
    motherImage: "/family-heads/divine.png",
  },
  {
    family: "Family of Light",
    father: "Brother Paul Etop",
    mother: "Sister Sarah Cyril",
    icon: GiPolarStar,
    colorClass: "text-yellow-500 drop-shadow-[0_0_14px_rgba(234,179,8,0.85)]",
    fatherImage: "/family-heads/linho.png",
    motherImage: "/family-heads/sarah.jpeg",
  },
  {
    family: "Family of Power",
    father: "Brother Victor Omolu",
    mother: "Sister Fortune Umoh",
    icon: FaBolt,
    colorClass: "text-red-500 drop-shadow-[0_0_14px_rgba(239,68,68,0.85)]",
    fatherImage: "/family-heads/bassey.png",
    motherImage: "/family-heads/fortune.png",
  },
  {
    family: "Family of Virtue",
    father: "Brother Henry Igani",
    mother: "Sister Mercy Alexander",
    icon: GiFruitTree,
    colorClass: "text-green-500 drop-shadow-[0_0_14px_rgba(34,197,94,0.85)]",
    fatherImage: "/family-heads/henry.png",
    motherImage: "/family-heads/malexa.jpg",
  },
];

const PORTRAIT_IMAGES = [
  "/virgins/portrait/prime.jpg",
  "/virgins/portrait/1.jpg",
  "/virgins/portrait/2.jpg",
  "/virgins/portrait/3.jpg",
  "/virgins/portrait/4.jpg",
  "/virgins/portrait/5.jpg",
  "/virgins/portrait/6.jpg",
  "/virgins/portrait/7.jpg",
  "/virgins/portrait/IMG-20220820-WA0032.jpg",
  "/virgins/portrait/IMG-20220820-WA0034.jpg",
  "/virgins/portrait/IMG_1333.jpeg",
  "/virgins/portrait/IMG_3746-1.jpeg",
  "/virgins/portrait/IMG_3770.jpeg",
  "/virgins/portrait/IMG_7640.jpg",
  "/virgins/portrait/IMG_7675.jpg",
  "/virgins/portrait/IMG_8164.jpeg",
  "/virgins/portrait/IMG_8186.jpeg",
  "/virgins/portrait/image_2026-05-22_20-05-59.png",
  "/virgins/portrait/image_2026-05-22_20-09-13.png",
  "/virgins/portrait/image_2026-05-22_20-11-09.png",
  "/virgins/portrait/image_2026-05-22_20-11-32.png",
  "/virgins/portrait/image_2026-05-22_20-11-55.png",
  "/virgins/portrait/image_2026-05-22_20-12-05.png",
  "/virgins/portrait/image_2026-05-22_20-12-17.png",
  "/virgins/portrait/image_2026-05-22_20-12-27.png",
  "/virgins/portrait/image_2026-05-22_20-12-42.png",
  "/virgins/portrait/image_2026-05-22_20-12-51.png",
  "/virgins/portrait/image_2026-05-22_20-12-58.png",
  "/virgins/portrait/image_2026-05-22_20-40-45.png",
  "/virgins/portrait/image_2026-05-22_20-41-42.png",
  "/virgins/portrait/image_2026-05-22_22-28-02.png",
  "/virgins/portrait/image_2026-05-22_22-28-11.png",
  "/virgins/portrait/image_2026-05-22_22-28-25.png",
  "/virgins/portrait/one.jpg",
  "/virgins/portrait/photo_2026-05-22_17-48-33.jpg",
  "/virgins/portrait/photo_2026-05-22_18-02-29.jpg",
  "/virgins/portrait/photo_2026-05-22_18-02-37.jpg",
  "/virgins/portrait/photo_2026-05-22_18-02-40.jpg",
  "/virgins/portrait/photo_2026-05-22_18-02-49.jpg",
  "/virgins/portrait/photo_2026-05-22_18-02-51.jpg",
  "/virgins/portrait/photo_2026-05-22_18-03-06.jpg",
  "/virgins/portrait/photo_2026-05-22_18-03-07.jpg",
  "/virgins/portrait/photo_2026-05-22_18-03-09.jpg",
  "/virgins/portrait/photo_2026-05-22_18-03-12.jpg",
  "/virgins/portrait/photo_2026-05-22_18-39-41.jpg",
  "/virgins/portrait/photo_2026-05-22_18-40-07.jpg",
  "/virgins/portrait/photo_2026-05-22_20-40-04.jpg",
  "/virgins/portrait/photo_2026-05-22_20-54-00.jpg",
  "/virgins/portrait/photo_2026-05-22_20-54-02.jpg",
  "/virgins/portrait/photo_2026-05-22_20-54-08.jpg",
  "/virgins/portrait/photo_2026-05-22_20-54-12.jpg",
  "/virgins/portrait/photo_2026-05-22_20-54-15.jpg",
  "/virgins/portrait/photo_2026-05-22_20-54-17.jpg",
  "/virgins/portrait/two.jpg",
  "/virgins/portrait/FB_IMG_1507888524333.jpg",
  "/virgins/portrait/FB_IMG_1520297335824.jpg",
  "/virgins/portrait/IMG_20240331_160057.jpg",
  "/virgins/portrait/IMG-20180814-WA0027.jpg",
  "/virgins/portrait/IMG-20181224-WA0010.jpg",
  "/virgins/portrait/IMG-20190814-WA0012.jpg",
];

const LANDSCAPE_IMAGES = [
  "/virgins/landscape/prime.JPG",
  "/virgins/landscape/1.JPG",
  "/virgins/landscape/2.JPG",
  "/virgins/landscape/3.JPG",
  "/virgins/landscape/4.JPG",
  "/virgins/landscape/5.png",
  "/virgins/landscape/IMG-20240331-WA0032.jpg",
  "/virgins/landscape/IMG-20250810-WA0096.jpg",
  "/virgins/landscape/IMG-20260210-WA0004.jpg",
  "/virgins/landscape/IMG-20260304-WA0006.jpg",
  "/virgins/landscape/IMG_1336.jpeg",
  "/virgins/landscape/IMG_4714.jpg",
  "/virgins/landscape/IMG_4720.jpg",
  "/virgins/landscape/IMG_7582.jpg",
  "/virgins/landscape/IMG_7586.jpg",
  "/virgins/landscape/IMG_8097.jpeg",
  "/virgins/landscape/IMG_8120.jpeg",
  "/virgins/landscape/IMG_8122.jpeg",
  "/virgins/landscape/IMG_8137.jpeg",
  "/virgins/landscape/image_2026-05-22_20-04-49.png",
  "/virgins/landscape/image_2026-05-22_20-05-16.png",
  "/virgins/landscape/image_2026-05-22_20-06-39.png",
  "/virgins/landscape/image_2026-05-22_20-08-08.png",
  "/virgins/landscape/image_2026-05-22_20-08-31.png",
  "/virgins/landscape/image_2026-05-22_20-09-38.png",
  "/virgins/landscape/image_2026-05-22_20-10-02.png",
  "/virgins/landscape/image_2026-05-22_20-10-36.png",
  "/virgins/landscape/image_2026-05-22_20-14-25.png",
  "/virgins/landscape/image_2026-05-23_15-10-49.png",
  "/virgins/landscape/photo_2026-05-22_17-45-15.jpg",
  "/virgins/landscape/photo_2026-05-22_17-46-06.jpg",
  "/virgins/landscape/photo_2026-05-22_17-46-12.jpg",
  "/virgins/landscape/photo_2026-05-22_17-46-29.jpg",
  "/virgins/landscape/photo_2026-05-22_17-47-11.jpg",
  "/virgins/landscape/photo_2026-05-22_17-47-54.jpg",
  "/virgins/landscape/photo_2026-05-22_17-48-03.jpg",
  "/virgins/landscape/photo_2026-05-22_18-39-56.jpg",
  "/virgins/landscape/photo_2026-05-22_18-40-02.jpg",
  "/virgins/landscape/photo_2026-05-22_18-40-04.jpg",
  "/virgins/landscape/photo_2026-05-22_18-40-09.jpg",
  "/virgins/landscape/photo_2026-05-22_18-40-15.jpg",
  "/virgins/landscape/photo_2026-05-22_18-40-25.jpg",
  "/virgins/landscape/photo_2026-05-22_18-40-30.jpg",
  "/virgins/landscape/photo_2026-05-22_18-40-32.jpg",
  "/virgins/landscape/photo_2026-05-22_20-40-00.jpg",
  "/virgins/landscape/photo_2026-05-22_20-40-11.jpg",
  "/virgins/landscape/photo_2026-05-22_20-40-14.jpg",
  "/virgins/landscape/photo_2026-05-22_20-54-21.jpg",
  "/virgins/landscape/photo_2026-05-22_20-54-25.jpg",
  "/virgins/landscape/2348062740412_status_2da5cef952d14ff8bb39019e90f15b6a.jpg",
  "/virgins/landscape/FB_IMG_1520297572268.jpg",
  "/virgins/landscape/FB_IMG_1520297674677.jpg",
  "/virgins/landscape/FB_IMG_1520297685709.jpg",
  "/virgins/landscape/FB_IMG_1590083208446.jpg",
  "/virgins/landscape/FB_IMG_1698508837938.jpg",
  "/virgins/landscape/IMG_20181230_182706.jpg",
  "/virgins/landscape/IMG-20170427-WA0029.jpg",
  "/virgins/landscape/IMG-20171004-WA0007.jpg",
  "/virgins/landscape/IMG-20180816-WA0011.jpg",
  "/virgins/landscape/IMG-20180816-WA0014.jpg",
  "/virgins/landscape/IMG-20180816-WA0017.jpg",
  "/virgins/landscape/IMG-20190504-WA0061.jpg",
  "/virgins/landscape/IMG-20190526-WA0003.jpg",
  "/virgins/landscape/IMG-20190815-WA0024.jpg",
  "/virgins/landscape/IMG-20190815-WA0060.jpg",
];

const FIXED_PORTRAIT = [
  "/virgins/portrait/prime.jpg",
  "/virgins/portrait/1.jpg",
  "/virgins/portrait/2.jpg",
  "/virgins/portrait/3.jpg",
  "/virgins/portrait/4.jpg",
  "/virgins/portrait/5.jpg",
  "/virgins/portrait/6.jpg",
  "/virgins/portrait/7.jpg",
];

const FIXED_LANDSCAPE = [
  "/virgins/landscape/prime.JPG",
  "/virgins/landscape/1.JPG",
  "/virgins/landscape/2.JPG",
  "/virgins/landscape/3.JPG",
  "/virgins/landscape/4.JPG",
  "/virgins/landscape/5.png",
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

function shuffleImages(images: string[], fixed: string[]) {
  const remaining = images.filter((img) => !fixed.includes(img));
  const shuffled = [...remaining];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return [...fixed, ...shuffled];
}

function toRomanNumeral(value: number): string {
  if (value <= 0) return "";
  const numerals: [number, string][] = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let n = value;
  let result = "";
  for (const [num, sym] of numerals) {
    while (n >= num) {
      result += sym;
      n -= num;
    }
  }
  return result;
}

function formatCarouselCounter(value: number, landscape: boolean): string {
  return landscape ? toRomanNumeral(value) : String(value).padStart(2, "0");
}

function CountdownDigit({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center w-12 sm:w-16">
      <div className="relative overflow-hidden">
        <span className="text-3xl sm:text-4xl font-black text-white tracking-tighter leading-none tabular-nums block">
          {display}
        </span>
      </div>
      <span className="mt-1 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
        {label}
      </span>
    </div>
  );
}

type BirthdayMember = {
  id: string;
  first_name: string;
  last_name: string;
  family: string;
  photo_url?: string;
  date_of_birth: string;
};

export default function Home() {
  const [countdown, setCountdown] = useState<Countdown>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState<number | null>(null);
  const [, setIsFading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [birthdayMembers, setBirthdayMembers] = useState<BirthdayMember[]>([]);
  const supabase = useMemo(() => createClient(), []);
  const [isPortrait, setIsPortrait] = useState(true);
  const [shuffledPortrait, setShuffledPortrait] = useState<string[]>([]);
  const [shuffledLandscape, setShuffledLandscape] = useState<string[]>([]);
  const [hasMounted, setHasMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const preloadedImages = useRef<Set<string>>(new Set());
  const heroRef = useRef<HTMLElement | null>(null);

  const preloadImage = useCallback((src: string) => {
    if (preloadedImages.current.has(src)) return;
    const img = new Image();
    img.onload = () => preloadedImages.current.add(src);
    img.onerror = () => preloadedImages.current.add(src);
    img.src = src;
  }, []);

  // Countdown tick (zeros during SSR so server/client markup match)
  useEffect(() => {
    setCountdown(getCountdown(new Date()));
    const timer = setInterval(
      () => setCountdown(getCountdown(new Date())),
      1000,
    );
    return () => clearInterval(timer);
  }, []);

  // Detect orientation on mount and resize, and set up dynamic randomized image arrays
  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    checkOrientation();
    window.addEventListener("resize", checkOrientation);

    setShuffledPortrait(shuffleImages(PORTRAIT_IMAGES, FIXED_PORTRAIT));
    setShuffledLandscape(shuffleImages(LANDSCAPE_IMAGES, FIXED_LANDSCAPE));

    // Eagerly preload the fixed sequence images for the active orientation
    const isLandscape = window.innerWidth > window.innerHeight;
    const fixedToPreload = isLandscape ? FIXED_LANDSCAPE : FIXED_PORTRAIT;
    fixedToPreload.forEach(preloadImage);

    setHasMounted(true);
    setIsLoggedIn(!!localStorage.getItem("virgins-auth"));

    return () => window.removeEventListener("resize", checkOrientation);
  }, [preloadImage]);

  const activeImages = !hasMounted
    ? []
    : isPortrait
      ? shuffledPortrait.length > 0
        ? shuffledPortrait
        : PORTRAIT_IMAGES
      : shuffledLandscape.length > 0
        ? shuffledLandscape
        : LANDSCAPE_IMAGES;

  // Clamps/resets currentSlide if out of bounds on orientation changes
  useEffect(() => {
    setCurrentSlide((prev) => {
      if (prev >= activeImages.length) {
        return 0;
      }
      return prev;
    });
  }, [activeImages.length]);

  // Preload current + upcoming images (errors still marked ready so we never stall)
  useEffect(() => {
    if (activeImages.length === 0) return;
    preloadImage(activeImages[currentSlide]);
    const PRELOAD_COUNT = 3;
    for (let offset = 1; offset <= PRELOAD_COUNT; offset++) {
      const idx = (currentSlide + offset) % activeImages.length;
      preloadImage(activeImages[idx]);
    }
  }, [currentSlide, activeImages, preloadImage]);

  // Auto-advance carousel with 3.0s interval
  useEffect(() => {
    if (activeImages.length === 0) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => {
        const next = (prev + 1) % activeImages.length;
        setPrevSlide(prev);
        setIsFading(true);
        setTimeout(() => {
          setIsFading(false);
          setPrevSlide(null);
        }, 1400);
        return next;
      });
    }, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeImages]);

  const goToSlide = (nextFn: (prev: number) => number) => {
    setCurrentSlide((prev) => {
      const next = nextFn(prev);
      setPrevSlide(prev);
      setIsFading(true);
      setTimeout(() => {
        setIsFading(false);
        setPrevSlide(null);
      }, 1400);
      return next;
    });
  };

  // Fetch today's birthday members
  useEffect(() => {
    async function fetchBirthdays() {
      const today = new Date();
      const month = today.getMonth() + 1;
      const day = today.getDate();

      // Supabase stores date_of_birth as DATE — extract month/day
      const { data, error } = await supabase
        .from("members")
        .select("id, first_name, last_name, family, photo_url, date_of_birth")
        .not("date_of_birth", "is", null);

      if (error) {
        console.error("Error fetching birthdays", error);
        return;
      }

      // Filter client-side for matching month & day
      const matches = (data || []).filter((m: any) => {
        if (!m.date_of_birth) return false;
        const dob = new Date(m.date_of_birth);
        return dob.getMonth() + 1 === month && dob.getDate() === day;
      });

      setBirthdayMembers(matches);
    }
    fetchBirthdays();
  }, [supabase]);

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
      <section
        ref={heroRef}
        className="relative w-full h-screen overflow-hidden"
      >        {/* Slide images */}
        {activeImages.map((src, idx) => {
          const isCurrent = idx === currentSlide;
          const isPrev = idx === prevSlide;
          const isNext = idx === (currentSlide + 1) % activeImages.length;
          const isPrevAdjacent =
            idx ===
            (currentSlide - 1 + activeImages.length) % activeImages.length;

          if (!isCurrent && !isPrev && !isNext && !isPrevAdjacent) return null;

          return (
            <div
              key={src}
              className="absolute inset-0"
              style={{
                opacity: isCurrent ? 1 : 0,
                zIndex: isCurrent ? 10 : isPrev ? 5 : 0,
                transition: "opacity 1500ms ease-in-out",
                pointerEvents: isCurrent ? "auto" : "none",
              }}
            >
              {/* Fully fullscreen crisp image with cover to fit all screens */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${src})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  animation:
                    isCurrent || isPrev
                      ? `${isPortrait ? "kenBurnsPortrait" : "kenBurnsLandscape"} 10s ease-in-out infinite alternate`
                      : "none",
                }}
              />
            </div>
          );
        })}

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 z-20 bg-gradient-to-r from-black/90 via-black/50 to-transparent md:via-black/30" />
        <div className="absolute inset-0 z-20 bg-gradient-to-b from-black/40 via-transparent to-black/80" />

        {/* Hero content */}
        <div className="absolute inset-0 z-30 flex flex-col items-start justify-start pt-32 sm:pt-0 sm:justify-center px-6 sm:px-12 md:px-24 lg:px-32">
          <div className="max-w-4xl animate-in fade-in slide-in-from-left-8 duration-1000">
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-primary-gold mb-6">
              August 10 - August 16, 2026
            </p>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white leading-[0.95] tracking-tight">
              35th Anniversary
              <span className="block text-primary-gold mt-1 tracking-normal">
                Celebration
              </span>
            </h1>
            <div className="mt-8 space-y-2">
              <p className="text-base sm:text-lg md:text-xl font-bold text-white/90 tracking-tight">
                The Family Love Built
              </p>
              <p className="max-w-lg text-[10px] sm:text-xs md:text-sm text-white/50 leading-relaxed font-medium tracking-wide">
                Bearers of the Seal of the Universal Monarch
              </p>
            </div>

            {hasMounted && !isLoggedIn && (
              <div className="mt-10 flex flex-row items-center gap-3 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                <Link
                  href="/create-account"
                  className="btn-primary rounded-full px-4 py-4 sm:px-10 sm:py-5 text-[10px] sm:text-base font-black shadow-2xl shadow-black/50 transition-all hover:scale-105 active:scale-95 text-center flex-1 sm:flex-initial whitespace-nowrap"
                >
                  JOIN A FAMILY
                </Link>
                <Link
                  href="/login"
                  className="rounded-full border border-white/20 bg-white/5 backdrop-blur-md px-4 py-4 sm:px-10 sm:py-5 text-[10px] sm:text-base font-black text-white hover:bg-white/10 transition-all text-center flex-1 sm:flex-initial whitespace-nowrap"
                >
                  LOG IN
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ─── COUNTDOWN — Centered on mobile, bottom-right on sm+ ─── */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 sm:left-auto sm:right-10 sm:translate-x-0 sm:bottom-12 z-40">
          <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black/40 backdrop-blur-md px-6 py-4 shadow-2xl">
            {/* Gold top accent line */}
            <div className="absolute top-0 left-4 right-4 h-[1.5px] bg-gradient-to-r from-transparent via-(--primary-gold) to-transparent" />

            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-(--primary-gold) text-center mb-3">
              Countdown
            </p>

            <div className="flex items-center justify-center gap-2 sm:gap-4">
              {countdownBlocks.map((item, i) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 sm:gap-4"
                >
                  <CountdownDigit value={item.value} label={item.label} />
                  {i < countdownBlocks.length - 1 && (
                    <span className="text-white/30 text-xl sm:text-2xl font-thin mb-5 sm:mb-6">
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

        {/* Carousel indicators — hidden on mobile */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-40 hidden sm:flex flex-col items-center gap-4">
          <div className="text-[10px] font-black text-(--primary-gold) tracking-widest my-2 select-none">
            {formatCarouselCounter(currentSlide + 1, !isPortrait)}
          </div>
          <div className="relative h-48 w-[2px] bg-white/10 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 w-full bg-(--primary-gold) rounded-full transition-all duration-300"
              style={{
                height: `${100 / Math.max(activeImages.length, 1)}%`,
                transform: `translateY(${currentSlide * 100}%)`,
              }}
            />
          </div>
          <div className="text-[10px] font-black text-white/30 tracking-widest my-2 select-none">
            {formatCarouselCounter(
              hasMounted
                ? activeImages.length
                : isPortrait
                  ? PORTRAIT_IMAGES.length
                  : LANDSCAPE_IMAGES.length,
              !isPortrait,
            )}
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 translate-y-8 flex flex-col items-center gap-1 text-white/40 animate-bounce">
          <ChevronDown size={20} />
        </div>
      </section>

      {/* ─── EVENT FAMILIES — VERTICAL STICKY STACK ─── */}
      <section className="relative w-full">
        {/* Section Header — sticky at top */}
        <div className="relative pb-12 pt-24">
          <div className="px-6 sm:px-12 md:px-24 lg:px-32">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-(--primary-gold)/10 border border-(--primary-gold)/20 text-[10px] font-black uppercase tracking-[0.3em] text-(--primary-gold) mb-4">
              Foundational Pillars
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
              Event Families
            </h2>
            <p className="text-zinc-500 text-sm mt-2 max-w-xl font-medium">
              Scroll to discover the families anchoring the 35th Anniversary
              celebration.
            </p>
          </div>
        </div>

        {/* Stacking Cards */}
        <div className="relative px-6 sm:px-12 md:px-24 lg:px-32">
          {EVENT_FAMILIES.map((item, idx) => {
            const FamilyIcon = item.icon;
            const bgColor = item.colorClass.includes("purple")
              ? "bg-purple-500"
              : item.colorClass.includes("yellow")
                ? "bg-yellow-500"
                : item.colorClass.includes("red")
                  ? "bg-red-500"
                  : "bg-green-500";
            return (
              <div
                key={item.family}
                className="sticky top-0 h-screen flex items-center justify-center"
                style={{ zIndex: 10 + idx }}
              >
                <div
                  className="group relative w-full max-w-6xl h-[700px] sm:h-[750px] md:h-[600px] rounded-[2.5rem] border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950 overflow-hidden shadow-[0_0_50px_-12px_rgba(0,0,0,0.3)] transition-all duration-700 hover:border-(--primary-gold)/30"
                  style={{
                    transform: `scale(${1 - idx * 0.02})`,
                  }}
                >
                  {/* Decorative glow */}
                  <div
                    className={`absolute -top-20 -right-20 w-60 h-60 rounded-full blur-[100px] opacity-15 pointer-events-none ${bgColor}`}
                  />
                  <div
                    className={`absolute -bottom-20 -left-20 w-40 h-40 rounded-full blur-[80px] opacity-10 pointer-events-none ${bgColor}`}
                  />

                  <div className="relative grid grid-cols-1 md:grid-cols-[0.8fr_1.2fr] gap-0 h-full">
                    {/* Left — Info Panel */}
                    <div className="flex flex-col justify-center p-8 sm:p-10 md:p-14">
                      {/* Pillar Icon */}
                      <div className="flex items-center gap-4 mb-6">
                        <div className="relative">
                          <div
                            className={`absolute inset-0 blur-xl opacity-30 dark:opacity-50 ${bgColor}`}
                          />
                          <div
                            className={`relative p-4 rounded-2xl bg-zinc-100 dark:bg-black/60 border border-zinc-200 dark:border-white/10 ${item.colorClass}`}
                          >
                            <FamilyIcon size={28} />
                          </div>
                        </div>
                        <div className="h-px flex-1 bg-gradient-to-r from-zinc-200 dark:from-white/10 to-transparent" />
                      </div>

                      <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight leading-none mb-4">
                        {item.family}
                      </h3>
                      <p className="text-[10px] font-black text-zinc-400 dark:text-white/25 uppercase tracking-[0.3em] mb-4">
                        35th Anniversary Pillar
                      </p>
                    </div>

                    {/* Right — Portraits */}
                    <div className="grid grid-cols-2 gap-px h-[450px] md:h-[600px]">
                      {/* Father Portrait */}
                      <div className="group/portrait relative overflow-hidden">
                        <img
                          src={item.fatherImage}
                          alt={item.father}
                          className="h-full w-full object-cover transition-transform duration-1000 group-hover/portrait:scale-110 grayscale-[20%] group-hover/portrait:grayscale-0"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover/portrait:opacity-100 transition-opacity" />
                        <div className="absolute bottom-6 left-6 right-6">
                          <p className="text-[10px] font-black text-(--primary-gold) uppercase tracking-[0.2em] mb-1">
                            Family Father
                          </p>
                          <p className="text-lg font-black text-white tracking-tight leading-none">
                            {item.father.replace("Brother ", "Bro. ")}
                          </p>
                        </div>
                      </div>

                      {/* Mother Portrait */}
                      <div className="group/portrait relative overflow-hidden">
                        <img
                          src={item.motherImage}
                          alt={item.mother}
                          className="h-full w-full object-cover transition-transform duration-1000 group-hover/portrait:scale-110 grayscale-[20%] group-hover/portrait:grayscale-0"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover/portrait:opacity-100 transition-opacity" />
                        <div className="absolute bottom-6 left-6 right-6">
                          <p className="text-[10px] font-black text-primary-gold uppercase tracking-[0.2em] mb-1">
                            Family Mother
                          </p>
                          <p className="text-lg font-black text-white tracking-tight leading-none">
                            {item.mother.replace("Sister ", "Sis. ")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom spacer for scroll clearance */}
        <div className="h-24" />
      </section>

      {/* ─── BIRTHDAY CELEBRATIONS ─── */}
      {birthdayMembers.length > 0 && (
        <section className="relative w-full overflow-hidden py-16 sm:py-20">
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 left-[10%] w-32 h-32 rounded-full bg-amber-400/5 blur-3xl" />
            <div className="absolute bottom-10 right-[15%] w-40 h-40 rounded-full bg-rose-400/5 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-purple-400/3 blur-[80px]" />
          </div>

          <div className="relative px-6 sm:px-12 md:px-24 lg:px-32">
            {/* Section Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-black uppercase tracking-[0.3em] text-amber-600 dark:text-amber-400 mb-4">
                <Cake size={12} />
                Today&apos;s Celebrations
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
                Happy Birthday! 🎉
              </h2>
              <p className="text-zinc-500 text-sm mt-3 max-w-lg mx-auto font-medium">
                Celebrating our beloved family members born on this special day.
              </p>
            </div>

            {/* Birthday Cards Grid */}
            <div
              className={`grid gap-6 ${birthdayMembers.length === 1 ? "max-w-sm mx-auto" : birthdayMembers.length === 2 ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}
            >
              {birthdayMembers.map((member) => {
                const dob = new Date(member.date_of_birth);
                const today = new Date();
                let age = today.getFullYear() - dob.getFullYear();
                const m = today.getMonth() - dob.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < dob.getDate()))
                  age--;

                return (
                  <div
                    key={member.id}
                    className="group relative rounded-3xl border border-amber-200/50 dark:border-amber-500/10 bg-gradient-to-br from-white via-amber-50/30 to-white dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
                  >
                    {/* Decorative glow */}
                    <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-amber-400/10 blur-[60px] pointer-events-none" />
                    <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-rose-400/8 blur-[50px] pointer-events-none" />

                    {/* Confetti dots decoration */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      {[...Array(12)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute rounded-full"
                          style={{
                            width: `${2 + Math.random() * 4}px`,
                            height: `${2 + Math.random() * 4}px`,
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            backgroundColor: [
                              "#f59e0b",
                              "#ef4444",
                              "#8b5cf6",
                              "#22c55e",
                              "#ec4899",
                            ][i % 5],
                            opacity: 0.15 + Math.random() * 0.1,
                          }}
                        />
                      ))}
                    </div>

                    <div className="relative p-6 sm:p-8 flex flex-col items-center text-center">
                      {/* Photo */}
                      <div className="relative mb-5">
                        <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full ring-4 ring-amber-400/25 p-1 bg-white dark:bg-zinc-900">
                          <div className="h-full w-full rounded-full border-[3px] border-amber-400 overflow-hidden bg-amber-50 dark:bg-zinc-800">
                            {member.photo_url ? (
                              <img
                                src={member.photo_url}
                                alt={member.first_name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-2xl font-black text-amber-500">
                                {member.first_name[0]}
                                {member.last_name[0]}
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Age badge */}
                        <div className="absolute -bottom-1 -right-1 flex items-center justify-center h-9 w-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white text-xs font-black shadow-lg border-2 border-white dark:border-zinc-900">
                          +1
                        </div>
                        {/* Party emoji */}
                        <div className="absolute -top-1 -left-1 flex items-center justify-center h-7 w-7 rounded-full bg-rose-500/10 text-sm">
                          🎂
                        </div>
                      </div>

                      {/* Name */}
                      <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight capitalize">
                        {member.first_name} {member.last_name}
                      </h3>

                      {/* Family badge */}
                      <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-(--primary-gold)/10 border border-(--primary-gold)/20 text-xs font-bold text-(--primary-gold)">
                        Family of {member.family}
                      </div>

                      {/* Birthday message */}
                      <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                        Wishing you a wonderful{" "}
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          +1
                        </span>{" "}
                        birthday filled with love, grace & blessings! 🎉
                      </p>

                      {/* Gift icon divider */}
                      <div className="mt-4 flex items-center gap-3 w-full">
                        <div className="flex-1 h-px bg-amber-200/50 dark:bg-amber-500/10" />
                        <Gift size={14} className="text-amber-400" />
                        <div className="flex-1 h-px bg-amber-200/50 dark:bg-amber-500/10" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <div className="flex w-full flex-col gap-10 px-6 sm:px-12 md:px-24 lg:px-32 py-12">
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

      <SacredScrollFab heroRef={heroRef} />
    </main>
  );
}
