"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GiDove } from "react-icons/gi";
import { Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simple hardcoded check
    if (email === "event@virgin.com" && password === "eventpass123") {
      localStorage.setItem("virgins-admin-auth", "true");
      toast.success("Welcome, Admin!");
      router.push("/admin/members");
    } else {
      toast.error("Invalid credentials. Access Denied.");
    }
    setIsLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 dark:bg-zinc-950">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-(--primary-gold) text-white shadow-xl shadow-(--primary-gold)/20 transition-transform hover:scale-110">
            <GiDove size={36} />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">Welcome back!</h1>
          <p className="mt-2 text-sm text-zinc-500">Sign in to the Admin Dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-(--primary-gold) dark:border-zinc-800 dark:bg-zinc-950"
              placeholder="admin@example.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-(--primary-gold) dark:border-zinc-800 dark:bg-zinc-950"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full rounded-xl py-3.5 font-bold shadow-lg shadow-(--primary-gold)/20 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
