"use client";

import GlobalNavbar from "@/components/GlobalNavbar";
import GlobalFooter from "@/components/GlobalFooter";
import { Shield, Star, Award, BookOpen, Crown, User } from "lucide-react";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  // For "Brother Clinton Uweh Same", we might want the first letter of first name and last name
  // but let's just take first and last available parts for simplicity if it follows a pattern.
  // Or just first letters of all parts.
  // Let's go with the first letters of the first two parts of the base name (skipping titles like Brother/Sister).

  const filtered = parts.filter(p => !["Brother", "Sister"].includes(parts[0]) || p !== parts[0]);
  if (filtered.length === 0) return parts[0].charAt(0).toUpperCase();
  if (filtered.length === 1) return filtered[0].charAt(0).toUpperCase();

  return (filtered[0].charAt(0) + filtered[filtered.length - 1].charAt(0)).toUpperCase();
}

// exco data
const topExcos = [
  { role: "Int'l President", name: "Brother Clinton Uwe", delay: "0ms", img: 'https://res.cloudinary.com/dgmo4mkhk/image/upload/v1774990466/photo_2026-03-31_21-50-43_nexqtr.jpg' },
  { role: "Vice President", name: "Brother Roland Eyo", delay: "100ms", img: null },
];

const otherExcos = [
  { role: "Int'l President", name: "Brother Clinton Uwe", delay: "0ms", img: 'https://res.cloudinary.com/dgmo4mkhk/image/upload/v1774990466/photo_2026-03-31_21-50-43_nexqtr.jpg' },
  { role: "Vice President", name: "Brother Roland Eyo", delay: "100ms", img: null },
  { role: "Secretary", name: "Brother David Okundia", img: 'https://res.cloudinary.com/dgmo4mkhk/image/upload/v1774983140/photo_2026-03-31_19-46-08_hpoayq.jpg' },
  { role: "Asst. Secretary", name: "Sister Magaret Udoh", img: null },
  { role: "Financial Secretary", name: "Sister Promise Umaheyo", img: null },
  { role: "Public Relations Officer", name: "Brother Emeka Christian", img: "https://res.cloudinary.com/dgmo4mkhk/image/upload/v1774983130/photo_2026-03-31_19-46-15_hb3x57.jpg" },
  { role: "Office Administrator", name: "Sister Blessing Daniel", img: "https://res.cloudinary.com/dgmo4mkhk/image/upload/v1774983128/photo_2026-03-31_19-46-18_qoebkl.jpg" },
  { role: "Men's Fellowship Chairman", name: "Brother Emmanuel Godwin", img: null },
  { role: "Women's Fellowship Chairperson", name: "Sister Sarah Eko", img: "https://res.cloudinary.com/dgmo4mkhk/image/upload/v1774984556/photo_2026-03-31_20-15-43_acjio9.jpg" },
  { role: "Choirmaster General", name: "Brother Victor Firima", img: "https://res.cloudinary.com/dgmo4mkhk/image/upload/v1774983545/photo_2026-03-31_19-58-54_yvudic.jpg" },
  { role: "Mother 1", name: "Sister Ijeoma Orusakwe", img: null },
  { role: "Mother 2", name: "Brother Victor Omolu", img: null },
  { role: "Rector, Virgins Academy", name: "Brother Kpono Antia", img: "https://res.cloudinary.com/dgmo4mkhk/image/upload/v1774985268/photo_2026-03-31_20-28-01_e7cuuc.jpg" },
  { role: "Younger Ones' Coordinator", name: "Sister Divine Edosomwan", img: null },
  { role: "Welfare Officer", name: "Sister Nsa Edet", img: "https://res.cloudinary.com/dgmo4mkhk/image/upload/v1774985083/nsa_w11tia.jpg" },
  { role: "Provost 1", name: "Brother Emeka Ike", img: null },
  { role: "Provost 2", name: "Sister Victoria Nwobodo", img: null },
  { role: "Caretaker 1", name: "Brother Micheal Emmanuel", img: null },
  { role: "Caretaker 2", name: "Brother Gabriel George", img: null },
  { role: "Stationers Coordinator", name: "Brother Ime Akwaowo", img: "https://res.cloudinary.com/dgmo4mkhk/image/upload/v1774983136/photo_2026-03-31_19-46-22_eem4yd.jpg" },
  { role: "Event Director", name: "Brother Enwọñọ Ntuk", img: "https://res.cloudinary.com/dgmo4mkhk/image/upload/v1775030601/lit_vdjxfp.jpg" },
  { role: "Asst. Event Director", name: "Sister Esu Ethoti", img: "https://res.cloudinary.com/dgmo4mkhk/image/upload/v1774983130/photo_2026-03-31_19-46-20_lkaesx.jpg" },
  { role: "Event Secretary", name: "Brother Daniel Onugu", img: "https://res.cloudinary.com/dgmo4mkhk/image/upload/v1774983131/photo_2026-03-31_19-46-27_yaskaf.jpg" },
];

export default function ExcoPage() {
  return (
    <main className="min-h-screen w-full bg-background text-foreground flex flex-col pt-24 font-[family-name:var(--font-libre)]">
      <div className="flex-1 px-4  max-w-6xl mx-auto w-full">
        {/* Header Section */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-zinc-900 dark:text-zinc-100">
            Meet the <span className="text-(--primary-gold)">Executives</span>
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            The dedicated leaders overseeing the affairs of the 144,000 Virgins Body.
          </p>
        </div>

        <div className="mx-auto w-px h-16 bg-gradient-to-b from-(--primary-gold)/30 to-transparent mb-12 hidden md:block" />

        {/* Other Excos Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
          {otherExcos.slice(0, -3).map((exco) => (
            <div
              key={exco.role}
              className="wall-frame wall-frame-portrait group relative flex aspect-3/4 w-full flex-col overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 transition-all hover:-translate-y-1.5 hover:shadow-lg"
            >
              <div className="h-full w-full relative">
                {exco.img ? (
                  <img
                    src={exco.img}
                    alt={exco.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-zinc-100 to-zinc-300 dark:from-zinc-800 dark:to-zinc-900 transition-colors">
                    <span className="text-5xl font-bold text-(--primary-gold) drop-shadow-sm opacity-50 group-hover:opacity-70 transition-opacity">
                      {getInitials(exco.name)}
                    </span>
                  </div>
                )}
              </div>

              <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-black/98 via-black/60 to-transparent flex flex-col justify-end p-4 text-white">
                <h3 className="text-base font-bold leading-tight truncate drop-shadow-md">
                  {exco.name}
                </h3>
                <p className="text-[9px] font-bold tracking-widest text-(--primary-gold) uppercase mt-0.5 drop-shadow-md">
                  {exco.role}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Separator and Special Excos */}
        <div className="mt-20 flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500 fill-mode-both">
          <div className="w-full max-w-lg h-px bg-linear-to-r from-transparent via-(--primary-gold)/40 to-transparent mb-12" />

          <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 mb-5 uppercase tracking-[0.2em] text-center ">
            The Event <span className="text-(--primary-gold)">Directorate</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl mx-auto">
            {otherExcos.slice(-3).map((exco) => (
              <div
                key={exco.role}
                className="wall-frame wall-frame-portrait group relative flex aspect-3/4 w-full flex-col overflow-hidden rounded-2xl border border-(--primary-gold)/30 dark:border-(--primary-gold)/20 transition-all hover:-translate-y-2 hover:shadow-2xl ring-offset-4 ring-(--primary-gold)/10 hover:ring-2"
              >
                <div className="h-full w-full relative">
                  {exco.img ? (
                    <img
                      src={exco.img}
                      alt={exco.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-zinc-100 to-zinc-300 dark:from-zinc-800 dark:to-zinc-900">
                      <span className="text-6xl font-bold text-(--primary-gold) drop-shadow-sm opacity-60">
                        {getInitials(exco.name)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/100 via-black/80 to-transparent flex flex-col justify-end p-6 text-white">
                  <h3 className="text-xl font-bold leading-tight drop-shadow-lg">
                    {exco.name}
                  </h3>
                  <p className="text-xs font-bold tracking-[0.15em] text-(--primary-gold) uppercase mt-1 drop-shadow-lg">
                    {exco.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
