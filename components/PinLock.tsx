"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Delete, ChevronLeft } from "lucide-react";
import { getOptimizedUrl } from "@/lib/cloudinary";

interface PinLockProps {
  user: {
    first_name: string;
    photo_url?: string;
    pin: string;
  };
  onSuccess: () => void;
  onLogout?: () => void;
  onCancel?: () => void;
  title?: string;
}

export default function PinLock({ user, onSuccess, onLogout, onCancel, title }: PinLockProps) {
  const [pin, setPin] = useState<string>("");
  const [error, setError] = useState(false);

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      setPin((prev) => prev + num);
      setError(false);
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  useEffect(() => {
    if (pin.length === 4) {
      if (pin === user.pin) {
        onSuccess();
      } else {
        setError(true);
        setTimeout(() => setPin(""), 500);
      }
    }
  }, [pin, user.pin, onSuccess]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleNumberClick(e.key);
      } else if (e.key === "Backspace") {
        handleDelete();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pin]); // re-bind to latest handlers

  const initials = user.first_name?.[0]?.toUpperCase() || "U";

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center sm:justify-center bg-zinc-50 px-6 py-10 text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-white overflow-y-auto custom-scrollbar">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] h-[60%] w-[60%] rounded-full bg-(--primary-gold)/10 blur-[120px] dark:bg-(--primary-gold)/10" />
        <div className="absolute -bottom-[20%] -right-[10%] h-[60%] w-[60%] rounded-full bg-(--primary-gold)/5 blur-[120px] dark:bg-(--primary-gold)/5" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex w-full max-w-sm flex-col items-center space-y-8"
      >
        {/* Profile Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            {user.photo_url ? (
              <img
                src={getOptimizedUrl(user.photo_url)}
                alt={user.first_name}
                className="h-24 w-24 rounded-full border-2 border-(--primary-gold) object-cover shadow-[0_0_20px_rgba(212,175,55,0.3)]"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-(--primary-gold) bg-white text-3xl font-bold text-(--primary-gold) shadow-[0_0_20px_rgba(212,175,55,0.3)] dark:bg-zinc-900">
                {initials}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-(--primary-gold) text-zinc-950 ring-4 ring-zinc-50 dark:ring-zinc-950">
              <Lock size={16} />
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold">{title || `Welcome, ${user.first_name}`}</h1>
            <p className="text-zinc-500 dark:text-zinc-400">Enter your 4-digit PIN to {title ? "authorize" : "unlock"}</p>
          </div>
        </div>

        {/* PIN Dots */}
        <div className="flex space-x-4">
          {[0, 1, 2, 3].map((idx) => (
            <motion.div
              key={idx}
              animate={error ? { x: [0, -10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
              className={`h-4 w-4 rounded-full border-2 border-(--primary-gold)/30 transition-all duration-200 ${
                pin.length > idx ? "bg-(--primary-gold) shadow-[0_0_10px_rgba(212,175,55,0.5)]" : "bg-transparent"
              } ${error ? "border-red-500 bg-red-500" : ""}`}
            />
          ))}
        </div>

        {/* Keypad */}
        <div className="grid w-full grid-cols-3 gap-4 px-4">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              className="group relative flex h-16 items-center justify-center rounded-2xl bg-black/5 text-2xl font-bold transition-all hover:bg-black/10 active:scale-95 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <span className="relative z-10">{num}</span>
              <div className="absolute inset-0 rounded-2xl border border-black/5 transition-colors group-hover:border-(--primary-gold)/30 dark:border-white/5" />
            </button>
          ))}
          {onCancel ? (
            <button
              onClick={onCancel}
              className="flex h-16 items-center justify-center text-sm font-semibold text-zinc-500 hover:text-red-500 transition-colors"
            >
              Cancel
            </button>
          ) : (
            <button
              onClick={onLogout}
              className="flex h-16 items-center justify-center text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            >
              Logout
            </button>
          )}
          <button
            onClick={() => handleNumberClick("0")}
            className="group relative flex h-16 items-center justify-center rounded-2xl bg-black/5 text-2xl font-bold transition-all hover:bg-black/10 active:scale-95 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <span className="relative z-10">0</span>
            <div className="absolute inset-0 rounded-2xl border border-black/5 transition-colors group-hover:border-(--primary-gold)/30 dark:border-white/5" />
          </button>
          <button
            onClick={handleDelete}
            className="flex h-16 items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white active:scale-95"
          >
            <Delete size={24} />
          </button>
        </div>

      </motion.div>
    </div>
  );
}
