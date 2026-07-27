"use client";

import Link from "next/link";
import { useEffect, useState, type RefObject } from "react";

type SacredScrollFabProps = {
  heroRef: RefObject<HTMLElement | null>;
};

/** Classic vertical parchment scroll (rollers top + bottom). */
function ScrollGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* Parchment sheet */}
      <path
        d="M10 14h28v36H10z"
        fill="#F5E6C8"
      />
      {/* Text lines */}
      <path
        d="M15 24h18M15 31h16M15 38h14M15 45h10"
        stroke="#8F6B2A"
        strokeOpacity="0.45"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      {/* Top roller */}
      <rect x="6" y="8" width="36" height="10" rx="5" fill="#C4A35A" />
      <rect x="6" y="8" width="36" height="10" rx="5" stroke="#5C4318" strokeWidth="1.25" />
      <ellipse cx="8" cy="13" rx="3.5" ry="5" fill="#E8D5A3" />
      <ellipse cx="40" cy="13" rx="3.5" ry="5" fill="#A8843A" />
      <path d="M12 11h24" stroke="#FFF6DF" strokeOpacity="0.55" strokeWidth="1.5" strokeLinecap="round" />
      {/* Bottom roller */}
      <rect x="6" y="46" width="36" height="10" rx="5" fill="#C4A35A" />
      <rect x="6" y="46" width="36" height="10" rx="5" stroke="#5C4318" strokeWidth="1.25" />
      <ellipse cx="8" cy="51" rx="3.5" ry="5" fill="#E8D5A3" />
      <ellipse cx="40" cy="51" rx="3.5" ry="5" fill="#A8843A" />
      <path d="M12 49h24" stroke="#FFF6DF" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round" />
      {/* Curl shadow under top roller */}
      <path d="M10 18h28" stroke="#5C4318" strokeOpacity="0.2" strokeWidth="2" />
    </svg>
  );
}

export default function SacredScrollFab({ heroRef }: SacredScrollFabProps) {
  const [heroGone, setHeroGone] = useState(false);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setHeroGone(!entry.isIntersecting && entry.intersectionRatio === 0);
      },
      { threshold: [0, 0.01], root: null, rootMargin: "0px" },
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, [heroRef]);

  return (
    <div
      className={`fixed bottom-6 right-5 z-40 sm:bottom-8 sm:right-8 transition-all duration-500 ease-out ${
        heroGone
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "translate-y-6 opacity-0 pointer-events-none"
      }`}
    >
      <Link
        href="/sacred-records"
        aria-label="Open Sacred Records"
        title="Sacred Records"
        className="sacred-scroll-fab group relative flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-full bg-[#2a1f0a] shadow-[0_12px_32px_rgba(143,107,42,0.5)] ring-2 ring-(--primary-gold)/70 transition-transform hover:scale-105 active:scale-95 sm:h-[4.75rem] sm:w-[4.75rem]"
      >
        <span className="sacred-scroll-fab-pulse pointer-events-none absolute inset-0 rounded-full bg-(--primary-gold)" />
        <span className="sacred-scroll-fab-pulse sacred-scroll-fab-pulse-delay pointer-events-none absolute inset-0 rounded-full bg-(--primary-gold)" />
        <ScrollGlyph className="relative z-10 h-11 w-8 sm:h-12 sm:w-9 drop-shadow-sm" />
        <span className="pointer-events-none absolute -left-2 top-1/2 hidden -translate-x-full -translate-y-1/2 whitespace-nowrap rounded-full border border-(--primary-gold)/30 bg-white/95 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-(--primary-gold) opacity-0 shadow-sm transition-opacity group-hover:opacity-100 dark:bg-zinc-950/95 sm:block">
          Sacred Records
        </span>
      </Link>
    </div>
  );
}
