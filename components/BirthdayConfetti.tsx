"use client";

import { useEffect, useCallback } from "react";
import confetti from "canvas-confetti";

interface BirthdayConfettiProps {
  /** If true, fires the confetti celebration */
  active: boolean;
}

export default function BirthdayConfetti({ active }: BirthdayConfettiProps) {
  const fire = useCallback(() => {
    // Multi-burst confetti like Twitter/X birthday celebration
    const duration = 4000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      // Shoot from both sides
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ["#f59e0b", "#ef4444", "#8b5cf6", "#22c55e", "#ec4899", "#3b82f6"],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ["#f97316", "#eab308", "#a855f7", "#14b8a6", "#f43f5e", "#6366f1"],
      });
    }, 250);

    // Initial big burst from center
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.5, y: 0.5 },
      zIndex: 9999,
      colors: ["#f59e0b", "#ef4444", "#8b5cf6", "#22c55e", "#ec4899"],
    });

    // Emoji shapes (stars)
    setTimeout(() => {
      confetti({
        particleCount: 20,
        spread: 100,
        origin: { x: 0.5, y: 0.3 },
        zIndex: 9999,
        shapes: ["star"],
        colors: ["#fbbf24", "#f59e0b", "#d97706"],
        scalar: 1.5,
      });
    }, 500);
  }, []);

  useEffect(() => {
    if (active) {
      // Small delay so the page renders first
      const timer = setTimeout(fire, 600);
      return () => clearTimeout(timer);
    }
  }, [active, fire]);

  return null; // This component doesn't render anything visual — it just fires confetti
}
