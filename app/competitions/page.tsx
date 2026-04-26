"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trophy, Music, Lightbulb, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CompetitionsPage() {
  const [isClient, setIsClient] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const auth = localStorage.getItem("virgins-auth");
    if (!auth) {
      router.push("/login");
      return;
    }
    setIsAuth(true);
  }, [router]);

  if (!isClient || !isAuth) return null;

  const categories = [
    {
      title: "Sports Arena",
      description: "Football, Volleyball, Track Events, and more.",
      href: "/sports",
      icon: <Trophy className="h-6 w-6 text-(--primary-gold)" />,
    },
    {
      title: "Choral Competitions",
      description: "Solo, Duet, Quartet, and Keyboard Competitions.",
      href: "/choral",
      icon: <Music className="h-6 w-6 text-(--primary-gold)" />,
    },
    {
      title: "Extracurricular Competitions",
      description: "Debate & Essay Writing Competitions.",
      href: "/extracurricular",
      icon: <Lightbulb className="h-6 w-6 text-(--primary-gold)" />,
    },
  ];

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <main className="max-w-2xl mx-auto px-4 pt-12 pb-4">
        <header className="mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-400 dark:text-zinc-500 mb-2">
            Official Events
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-[-0.03em] leading-none">
            Event <span className="text-(--primary-gold)">Competitions</span>
          </h1>
          <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-2 font-medium">
            Select a competition category to view schedules and details.
          </p>
        </header>

        <div className="space-y-4">
          {categories.map((category) => (
            <Link
              key={category.href}
              href={category.href}
              className="group block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 shrink-0 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
                  {category.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-black uppercase tracking-tight mb-1">
                    {category.title}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                    {category.description}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-400 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
