import Link from "next/link";

export default function WallOfFamePage() {
  const row = Array.from({ length: 8 }, (_, i) => i + 1);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6">
      <h1 className="text-4xl font-bold">Wall of Fame</h1>
      <p className="text-lg text-zinc-700 dark:text-zinc-300">
        Honor slots are preparing. Discover the double-scroll showcase below.
      </p>

      <section className="space-y-6 overflow-hidden rounded-3xl border border-(--primary-gold)/25 bg-zinc-50/50 p-6 backdrop-blur-sm dark:bg-zinc-900/10">
        <div className="marquee-row">
          <div className="marquee-track">
            {[...row, ...row].map((item, idx) => (
              <div
                key={`top-${item}-${idx}`}
                className="wall-frame wall-frame-portrait group relative flex h-60 w-44 shrink-0 flex-col overflow-hidden rounded-2xl border border-(--primary-gold)/30 shadow-md transition-transform hover:scale-105 p-2"
              >
                <div className="wall-frame-inner flex h-full w-full items-center justify-center rounded-xl border border-(--primary-gold)/45 bg-black/5 dark:bg-white/5">
                  <span className="text-6xl font-bold text-(--primary-gold)">?</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="marquee-row reverse">
          <div className="marquee-track">
            {[...row, ...row].map((item, idx) => (
              <div
                key={`bottom-${item}-${idx}`}
                className="wall-frame wall-frame-portrait group relative flex h-60 w-44 shrink-0 flex-col overflow-hidden rounded-2xl border border-(--primary-gold)/30 shadow-md transition-transform hover:scale-105 p-2"
              >
                <div className="wall-frame-inner flex h-full w-full items-center justify-center rounded-xl border border-(--primary-gold)/45 bg-black/5 dark:bg-white/5">
                  <span className="text-6xl font-bold text-(--primary-gold)">?</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Link className="underline" href="/">
        Back to Home
      </Link>
    </main>
  );
}
