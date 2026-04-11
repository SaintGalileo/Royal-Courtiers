"use client";

import Link from "next/link";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { GiPolarStar, GiWingedScepter, GiFruitTree } from "react-icons/gi";
import { FaBolt } from "react-icons/fa";

const EVENT_FAMILIES = [
  { family: "Dominion", icon: GiWingedScepter, colorClass: "text-purple-500 drop-shadow-[0_0_14px_rgba(168,85,247,0.85)] border-purple-500/70 bg-purple-500/10" },
  { family: "Light", icon: GiPolarStar, colorClass: "text-yellow-500 drop-shadow-[0_0_14px_rgba(234,179,8,0.85)] border-yellow-500/70 bg-yellow-500/10" },
  { family: "Power", icon: FaBolt, colorClass: "text-red-500 drop-shadow-[0_0_14px_rgba(239,68,68,0.85)] border-red-500/70 bg-red-500/10" },
  { family: "Virtue", icon: GiFruitTree, colorClass: "text-green-500 drop-shadow-[0_0_14px_rgba(34,197,94,0.85)] border-green-500/70 bg-green-500/10" },
];

export default function GlobalNavbar() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return savedTheme === "dark" || (!savedTheme && prefersDark) ? "dark" : "light";
  });
  const [isClient, setIsClient] = useState(false);
  const [authSlug, setAuthSlug] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [iconIndex, setIconIndex] = useState(0);

  // If we are on the dashboard or admin, don't show this navbar
  const isDashboard = pathname?.startsWith("/dashboard");
  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    const interval = setInterval(() => {
      setIconIndex((prev) => (prev + 1) % EVENT_FAMILIES.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setIsClient(true);
    const auth = localStorage.getItem("virgins-auth");
    if (auth) {
      try {
        const { firstName, lastName } = JSON.parse(auth);
        setAuthSlug(`${firstName.toLowerCase().replace(/\s+/g, "-")}-${lastName.toLowerCase().replace(/\s+/g, "-")}`);
      } catch {
        localStorage.removeItem("virgins-auth");
        setAuthSlug(null);
      }
    } else {
      setAuthSlug(null);
    }
  }, [pathname]); // re-check auth when route changes

  useEffect(() => {
    if (!isClient) return;
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme, isClient]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const closeMenu = () => setIsMenuOpen(false);

  if (isDashboard || isAdmin) return null;

  return (
    <header className="relative z-50 flex w-full flex-col px-4 py-4 md:px-12 lg:px-20 border-b border-(--primary-gold)/20 backdrop-blur-md">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link href="/" onClick={closeMenu} className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-1000 ${EVENT_FAMILIES[iconIndex].colorClass}`}
            aria-label={`${EVENT_FAMILIES[iconIndex].family} Family`}
          >
            {(() => {
              const Icon = EVENT_FAMILIES[iconIndex].icon;
              return <Icon size={20} />;
            })()}
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-(--primary-gold) transition-colors">Home</Link>
          {/* <Link href="/itinerary" className="hover:text-(--primary-gold) transition-colors">Itinerary</Link> */}
          <Link href="/sports" className={`hover:text-(--primary-gold) transition-colors ${pathname === '/sports' || pathname?.startsWith('/sports/') ? 'font-bold text-(--primary-gold)' : ''}`}>Sports</Link>
          <Link href="/wall-of-fame" className="hover:text-(--primary-gold) transition-colors">Wall of Fame</Link>
          <Link href="/exco" className="hover:text-(--primary-gold) transition-colors">Excos</Link>
        </nav>

        {/* Desktop Auth & Theme */}
        <div className="hidden md:flex items-center gap-4">
          <button
            className="rounded-md border border-zinc-400 p-2 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            onClick={toggleTheme}
            type="button"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {authSlug ? (
            <Link className="btn-primary rounded-md px-4 py-2 text-sm font-semibold animate-pulse shadow-[0_0_15px_rgba(143,107,42,0.4)] hover:animate-none" href={`/dashboard/${authSlug}`}>
              View Dashboard
            </Link>
          ) : (
            <>
              <Link className="text-sm font-semibold hover:text-(--primary-gold) transition-colors" href="/login">
                Log In
              </Link>
              <Link className="btn-primary rounded-md px-4 py-2 text-sm font-semibold" href="/create-account">
                SignUp
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 text-zinc-900 dark:text-zinc-100"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <nav className="mt-4 flex flex-col gap-4 border-t border-(--primary-gold)/20 pt-4 md:hidden pb-2">
          <Link href="/" onClick={closeMenu} className="block px-2 py-1 font-medium hover:text-(--primary-gold)">Home</Link>
          <Link href="/itinerary" onClick={closeMenu} className="block px-2 py-1 font-medium hover:text-(--primary-gold)">Itinerary</Link>
          <Link href="/sports" onClick={closeMenu} className={`block px-2 py-1 font-medium ${pathname === '/sports' || pathname?.startsWith('/sports/') ? 'text-(--primary-gold) font-bold' : 'hover:text-(--primary-gold)'}`}>Sports</Link>
          <Link href="/wall-of-fame" onClick={closeMenu} className="block px-2 py-1 font-medium hover:text-(--primary-gold)">Wall of Fame</Link>
          <Link href="/exco" onClick={closeMenu} className="block px-2 py-1 font-medium hover:text-(--primary-gold)">Excos</Link>

          <div className="my-2 h-px w-full bg-(--primary-gold)/20" />

          <div className="flex flex-col gap-3 px-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">Theme</span>
              <button
                className="rounded-md border border-zinc-400 p-2 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                onClick={toggleTheme}
                type="button"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>

            {authSlug ? (
              <Link onClick={closeMenu} className="btn-primary block w-full text-center rounded-md px-4 py-2 text-sm font-semibold" href={`/dashboard/${authSlug}`}>
                View Dashboard
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-3 mt-2">
                <Link onClick={closeMenu} className="block text-center rounded-md border border-(--primary-gold) px-4 py-2 text-sm font-semibold hover:bg-(--primary-gold)/10" href="/login">
                  Log In
                </Link>
                <Link onClick={closeMenu} className="btn-primary block text-center rounded-md px-4 py-2 text-sm font-semibold" href="/create-account">
                  SignUp
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
