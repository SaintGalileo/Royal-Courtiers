"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, ChevronRight, Lock, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function SetupPinPage() {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState(1); // 1: Enter, 2: Confirm
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const auth = localStorage.getItem("virgins-auth");
    if (!auth) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(auth));
  }, [router]);

  const handleNext = () => {
    if (pin.length !== 4) {
      toast.error("Please enter a 4-digit PIN");
      return;
    }
    setStep(2);
  };

  const handleSave = async () => {
    if (pin !== confirmPin) {
      toast.error("PINs do not match. Please try again.");
      setConfirmPin("");
      setStep(1);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("members")
        .update({ pin })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("PIN set successfully! You can now access your dashboard.");
      
      // Store verification in session storage so they don't have to enter it immediately
      sessionStorage.setItem(`pin-verified-${user.id}`, "true");

      const slug = `${user.firstName.toLowerCase().replace(/\s+/g, "-")}-${user.lastName.toLowerCase().replace(/\s+/g, "-")}`;
      router.push(`/dashboard/${slug}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to save PIN");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNumberClick = (num: string) => {
    if (step === 1) {
      if (pin.length < 4) setPin((prev) => prev + num);
    } else {
      if (confirmPin.length < 4) setConfirmPin((prev) => prev + num);
    }
  };

  const handleDelete = () => {
    if (step === 1) {
      setPin((prev) => prev.slice(0, -1));
    } else {
      setConfirmPin((prev) => prev.slice(0, -1));
    }
  };

  if (!user) return null;

  const currentPin = step === 1 ? pin : confirmPin;

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-zinc-50 px-4 py-10 transition-colors dark:bg-zinc-950">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] h-[60%] w-[60%] rounded-full bg-(--primary-gold)/10 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] h-[60%] w-[60%] rounded-full bg-(--primary-gold)/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-(--primary-gold)/20 text-(--primary-gold)">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white transition-colors">Security PIN</h1>
          <p className="text-zinc-600 dark:text-zinc-400 transition-colors">
            {step === 1 
              ? "Create a 4-digit PIN to secure your account and family records." 
              : "Confirm your 4-digit PIN to ensure it's correct."}
          </p>
        </div>

        <div className="flex flex-col items-center space-y-8">
          {/* PIN Dots */}
          <div className="flex space-x-4">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`h-4 w-4 rounded-full border-2 border-(--primary-gold)/30 transition-all duration-200 ${
                  currentPin.length > idx ? "bg-(--primary-gold) shadow-[0_0_10px_rgba(212,175,55,0.5)]" : "bg-transparent"
                }`}
              />
            ))}
          </div>

          {/* Keypad */}
          <div className="grid w-full grid-cols-3 gap-3">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num)}
                className="flex h-16 items-center justify-center rounded-xl bg-black/5 text-2xl font-bold text-zinc-900 hover:bg-black/10 active:scale-95 transition-all dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => step === 2 && setStep(1)}
              className="flex h-16 items-center justify-center text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              {step === 2 ? "Back" : ""}
            </button>
            <button
              onClick={() => handleNumberClick("0")}
              className="flex h-16 items-center justify-center rounded-xl bg-black/5 text-2xl font-bold text-zinc-900 hover:bg-black/10 active:scale-95 transition-all dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              0
            </button>
            <button
              onClick={handleDelete}
              className="flex h-16 items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white active:scale-95 transition-colors"
            >
              <Lock size={20} className="mr-2" />
              Del
            </button>
          </div>


          <button
            onClick={step === 1 ? handleNext : handleSave}
            disabled={currentPin.length !== 4 || isLoading}
            className="btn-primary w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {isLoading ? "Saving..." : step === 1 ? "Next" : "Set PIN"}
            <ChevronRight className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </main>
  );
}
