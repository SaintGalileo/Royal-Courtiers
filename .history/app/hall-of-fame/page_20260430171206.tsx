import Link from "next/link";

export default function WallOfFamePage() {
  const row = Array.from({ length: 8 }, (_, i) => i + 1);

  return (
    <main className="min-h-screen w-full bg-background text-foreground flex flex-col font-[family-name:var(--font-libre)]">
      <div className="flex-1 px-4 pt-18 pb-10 max-w-7xl mx-auto w-full flex flex-col gap-8">
        {/* Header Section */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-zinc-900 dark:text-zinc-100">
            Hall of <span className="text-(--primary-gold)">Fame</span>
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            A tribute to greatness; immortalising the esteemed inductees of the
            maiden version of the Virgin's Hall of Fame.
          </p>
        </div>

        <div className="mx-auto w-px h-16 bg-gradient-to-b from-(--primary-gold)/30 to-transparent -mt-8 mb-12 hidden md:block" />

        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both space-y-6 overflow-hidden rounded-3xl border border-(--primary-gold)/25 bg-zinc-50/50 p-6 backdrop-blur-sm dark:bg-zinc-900/10">
          <div className="marquee-row">
            <div className="marquee-track">
              {[...row, ...row].map((item, idx) => (
                <div
                  key={`top-${item}-${idx}`}
                  className="wall-frame wall-frame-portrait group relative flex h-60 w-44 shrink-0 flex-col overflow-hidden rounded-2xl border border-(--primary-gold)/30 shadow-md transition-transform hover:scale-105 p-2"
                >
                  <div className="wall-frame-inner flex h-full w-full items-center justify-center rounded-xl border border-(--primary-gold)/45 bg-black/5 dark:bg-white/5">
                    <span className="text-6xl font-bold text-(--primary-gold)">
                      ?
                    </span>
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
                    <span className="text-6xl font-bold text-(--primary-gold)">
                      ?
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* <div className="text-center mt-8">
        <Link className="underline text-zinc-500 hover:text-(--primary-gold) transition-colors" href="/">
          Back to Home
        </Link>
      </div> */}
      </div>
    </main>
  );
}
