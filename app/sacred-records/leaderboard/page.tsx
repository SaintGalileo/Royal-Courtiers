"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  getSacredRecordsLeaderboard,
  type LeaderboardEntry,
} from "@/services/sacred-records";
import { SACRED_RECORDS_FAMILIES } from "@/lib/sacred-records-game";
import { ArrowLeft, Crown, Loader2, Trophy } from "lucide-react";
import {
  GiPolarStar,
  GiWingedScepter,
  GiFruitTree,
  GiDove,
} from "react-icons/gi";
import { FaBolt } from "react-icons/fa";
import type { ComponentType } from "react";

type Tab = "general" | "family";

const familyIcons: Record<
  string,
  { icon: ComponentType<{ className?: string }>; className: string }
> = {
  Dominion: {
    icon: GiWingedScepter,
    className: "text-purple-500",
  },
  Light: {
    icon: GiPolarStar,
    className: "text-yellow-500",
  },
  Power: {
    icon: FaBolt,
    className: "text-red-500",
  },
  Virtue: {
    icon: GiFruitTree,
    className: "text-green-500",
  },
  Seraphs: {
    icon: GiDove,
    className: "text-cyan-500",
  },
};

function FamilySeal({
  family,
  crowned,
  size = "md",
}: {
  family: string;
  crowned?: boolean;
  size?: "sm" | "md";
}) {
  const style = familyIcons[family] ?? familyIcons.Light;
  const Icon = style.icon;
  const box = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className={`relative ${box}`}>
      <div
        className={`flex h-full w-full items-center justify-center rounded-full border-2 border-(--primary-gold)/40 bg-(--primary-gold)/10 ${style.className}`}
      >
        <Icon className={iconSize} />
      </div>
      {crowned && (
        <Crown className="absolute -right-1 -top-2 h-4 w-4 fill-amber-400 text-amber-500 drop-shadow" />
      )}
    </div>
  );
}

export default function SacredRecordsLeaderboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [tab, setTab] = useState<Tab>("general");
  const [familyFilter, setFamilyFilter] = useState<string>("Dominion");
  const [viewerId, setViewerId] = useState<string | null>(null);

  useEffect(() => {
    const authStr = localStorage.getItem("virgins-auth");
    if (!authStr) {
      router.push("/login");
      return;
    }
    try {
      const auth = JSON.parse(authStr);
      setViewerId(auth.id);
      if (auth.family) setFamilyFilter(auth.family);
    } catch {
      router.push("/login");
      return;
    }

    getSacredRecordsLeaderboard()
      .then(setEntries)
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load leaderboard.");
      })
      .finally(() => setIsLoading(false));
  }, [router]);

  const overallChampId = entries[0]?.userId ?? null;

  const familyChamps = useMemo(() => {
    const map = new Map<string, string>();
    for (const family of SACRED_RECORDS_FAMILIES) {
      const top = entries.find((e) => e.family === family);
      if (top) map.set(family, top.userId);
    }
    return map;
  }, [entries]);

  const visible = useMemo(() => {
    if (tab === "general") return entries;
    return entries.filter((e) => e.family === familyFilter);
  }, [entries, tab, familyFilter]);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-(--primary-gold)" />
      </div>
    );
  }

  return (
    <main className="mx-auto min-h-[calc(100vh-80px)] w-full max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/sacred-records"
          className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-(--primary-gold)"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to path
        </Link>
        <div className="flex items-center gap-2 text-(--primary-gold)">
          <Trophy className="h-5 w-5" />
          <h1 className="text-lg font-black sm:text-xl">Leaderboard</h1>
        </div>
      </div>

      <div className="mb-4 flex gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900">
        {(["general", "family"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex-1 rounded-xl py-2.5 text-xs font-black uppercase tracking-widest transition-colors ${
              tab === key
                ? "bg-(--primary-gold) text-white shadow"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            {key === "general" ? "General" : "Family"}
          </button>
        ))}
      </div>

      {tab === "family" && (
        <div className="mb-4 grid w-full grid-cols-2 gap-2 sm:grid-cols-5">
          {SACRED_RECORDS_FAMILIES.map((family) => (
            <button
              key={family}
              type="button"
              onClick={() => setFamilyFilter(family)}
              className={`w-full rounded-full px-3 py-2 text-center text-[10px] font-black uppercase tracking-wider ${
                familyFilter === family
                  ? "bg-(--primary-gold)/15 text-(--primary-gold) ring-1 ring-(--primary-gold)/40"
                  : "bg-zinc-100 text-zinc-500 dark:bg-zinc-900"
              }`}
            >
              {family}
            </button>
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        {visible.length === 0 ? (
          <p className="p-10 text-center text-sm text-zinc-500">
            No scores yet. Complete a sacred record to appear here.
          </p>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {visible.map((entry, index) => {
              const isOverall = entry.userId === overallChampId;
              const isFamilyTop =
                familyChamps.get(entry.family) === entry.userId;
              const isViewer = entry.userId === viewerId;
              const showSeal = isFamilyTop || (tab === "family" && index === 0);

              return (
                <li
                  key={entry.userId}
                  className={`flex items-center gap-3 px-4 py-3 sm:px-5 ${
                    isViewer ? "bg-(--primary-gold)/5" : ""
                  }`}
                >
                  <span className="w-7 text-center text-sm font-black text-zinc-400">
                    {index + 1}
                  </span>

                  {showSeal ? (
                    <FamilySeal
                      family={entry.family}
                      crowned={isOverall}
                      size="sm"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-zinc-100 text-[10px] font-black text-zinc-500 dark:bg-zinc-800">
                      {entry.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={entry.photoUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        `${entry.firstName[0] ?? ""}${entry.lastName[0] ?? ""}`
                      )}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {entry.firstName} {entry.lastName}
                      {isViewer && (
                        <span className="ml-2 text-[10px] font-black uppercase tracking-wider text-(--primary-gold)">
                          You
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Family of {entry.family} · {entry.completedDays} day
                      {entry.completedDays === 1 ? "" : "s"}
                    </p>
                  </div>

                  <p className="font-mono text-sm font-black text-(--primary-gold)">
                    {entry.totalPoints.toFixed(2)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p className="mt-4 text-center text-[11px] text-zinc-400">
        Family #1 earns that family&apos;s seal. Overall #1 also wears the
        crown.
      </p>
    </main>
  );
}
