"use client";

import { usePathname } from "next/navigation";

export default function GlobalFooter() {
  const pathname = usePathname();

  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin")) return null;

  return (
    <footer className="mt-auto border-t border-(--primary-gold)/20 bg-white/20 dark:bg-zinc-950/20 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 md:px-12 lg:px-20 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">

        {/* Nav links */}
        <nav className="flex items-center gap-1 text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-500">
          {[
            { label: "Donate", href: "/donate" },
            { label: "Help", href: "/help" }
          ].map((item, i) => (
            <span key={item.label} className="flex items-center gap-1">
              {i > 0 && (
                <span className="text-(--primary-gold)/40 select-none">·</span>
              )}
              <a
                href={item.href}
                className="hover:text-(--primary-gold) transition-colors duration-200 py-1 px-1"
              >
                {item.label}
              </a>
            </span>
          ))}
        </nav>

        {/* Wordmark + year */}
        <p className="text-xs text-zinc-400 dark:text-zinc-500 tracking-wide">
          <span className="text-(--primary-gold)/60 mr-1">©</span>
          {new Date().getFullYear()}{" "}
          <span className="text-zinc-500 dark:text-zinc-400 font-medium">
            The 144,000 Virgins Body
          </span>
        </p>

      </div>
    </footer >
  );
}