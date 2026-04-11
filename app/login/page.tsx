"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const handleLogin = async () => {
    const trimmed = code.toUpperCase().trim();
    if (trimmed.length !== 6) {
      toast.error("Please enter your full 6-character access code.");
      return;
    }

    setIsLoading(true);
    try {
      // Look up member by code
      const { data: member, error } = await supabase
        .from("members")
        .select("id, first_name, last_name, code, family, pin")
        .ilike("code", trimmed)
        .maybeSingle();

      if (error) {
        console.error("Supabase error during login:", error);
      }

      if (!member) {
        toast.error("No account found with this code. Please sign up first.");
        return;
      }

      // Save login state
      localStorage.setItem(
        "virgins-auth",
        JSON.stringify({
          id: member.id,
          firstName: member.first_name,
          lastName: member.last_name,
          code: member.code,
          family: member.family,
        }),
      );

      toast.success(`Welcome back, ${member.first_name}!`);

      // Determine where to redirect
      const slug = `${member.first_name.toLowerCase().replace(/\s+/g, "-")}-${member.last_name.toLowerCase().replace(/\s+/g, "-")}`;
      
      if (!member.pin) {
        router.push("/setup-pin");
      } else {
        router.push(`/dashboard/${slug}`);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && code.length === 6) {
      handleLogin();
    }
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-(--primary-gold)">
            144,000 Virgins Body
          </p>
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Enter your access code to continue
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-(--primary-gold)/35 bg-black/5 p-6 space-y-5 dark:bg-white/5">
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="access-code">
              Access Code
            </label>
            <input
              id="access-code"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/[^A-Za-z0-9]/g, "").slice(0, 6).toUpperCase())
              }
              onKeyDown={handleKeyDown}
              className="w-full rounded-lg border border-zinc-400 bg-transparent px-4 py-3 text-center font-mono text-2xl tracking-[0.3em] uppercase dark:border-zinc-700"
              placeholder="35XXXX"
              maxLength={6}
              autoFocus
            />
            <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
              The 6-character code you received during registration
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogin}
            disabled={code.length !== 6 || isLoading}
            className="btn-primary w-full rounded-lg px-4 py-3 font-bold tracking-wide disabled:opacity-50"
          >
            {isLoading ? "Logging in..." : "Log In"}
          </button>
        </div>

        {/* Footer links */}
        <div className="flex items-center justify-between text-sm">
          <Link href="/" className="text-zinc-500 underline hover:text-zinc-300">
            ← Home
          </Link>
          <Link href="/create-account" className="text-(--primary-gold) font-semibold underline underline-offset-2">
            Create Account
          </Link>
        </div>
      </div>
    </main>
  );
}
