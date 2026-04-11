import Link from "next/link";
import { CalendarDays } from "lucide-react";

type ItineraryDay = {
  day: string;
  date: string;
  visibleItems: { time: string; title: string; location: string; }[];
};

const ITINERARY: ItineraryDay[] = [
  {
    day: "Monday",
    date: "August 10, 2026",
    visibleItems: [
      { time: "05:00 AM", title: "Flag-Off Ceremony", location: "The Great Hall" },
      { time: "08:00 AM", title: "Event Logo Presentation", location: "The Great Hall" },
      { time: "12:00 PM", title: "Unveiling of the Wall of Fame", location: "26 Mbukpa" },
      { time: "2:00 PM", title: "Scrabble, Chess and Ludo", location: "26 Mbukpa Holy Chapel" }
    ],
  },
  {
    day: "Tuesday",
    date: "August 11, 2026",
    visibleItems: [
      { time: "8:00 AM", title: "Sports Activites", location: "Bromco Field" },
      { time: "1:00 PM", title: "Sports Activites Phase 2", location: "U.J. Esuene Stadium" },
    ],
  },
  {
    day: "Wednesday",
    date: "August 12, 2026",
    visibleItems: [
      { time: "08:00 AM", title: "Sports Activities (Finals)", location: "Bromco Field" },
      { time: "01:00 PM", title: "Debate, Quiz & Spelling Bee", location: "26 Mbukpa Holy Chapel" },
      { time: "05:00 PM", title: "Solo, Duet, Trio & Quartet", location: "26 Mbukpa Holy Chapel" },
    ],
  },
  {
    day: "Thursday",
    date: "August 13, 2026",
    visibleItems: [
      { time: "06:00 AM", title: "Super Marching Round", location: "The Great Hall" },
      { time: "04:00 PM", title: "Singing In The Vestry", location: "Holy Father's Vestry" },
    ],
  },
  {
    day: "Friday",
    date: "August 14, 2026",
    visibleItems: [
      { time: "09:00 AM", title: "Creation Day Celebration", location: "The Great Hall" },
      { time: "09:00 PM", title: "Tales by Moonlight", location: "26 Mbukpa" }
    ],
  },
  {
    day: "Saturday",
    date: "August 15, 2026",
    visibleItems: [
      { time: "05:00 PM", title: "Cultural Day 2.0", location: "Auditorium" }
    ],
  },
  {
    day: "Sunday",
    date: "August 16, 2026",
    visibleItems: [
      { time: "08:00 AM", title: "Grand Finale Service", location: "The Great Hall" }
    ],
  },
];

export default function ItineraryPage() {
  return (
    <main className="flex min-h-[calc(100vh-80px)] w-full flex-col px-4 py-8 md:px-12 lg:px-20">
      <div className="mx-auto w-full max-w-6xl space-y-12">
        {/* Header */}
        <header className="space-y-4 text-center md:text-left">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-(--primary-gold)">
            Event Schedule
          </p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <h1 className="text-4xl font-bold md:text-5xl">Anniversary Itinerary</h1>
            <div className="flex items-center justify-center md:justify-start gap-2 text-zinc-500 rounded-full border border-(--primary-gold)/30 bg-(--primary-gold)/5 px-4 py-1.5">
              <CalendarDays className="h-4 w-4" />
              <span className="text-sm font-medium">Aug 10 - Aug 16, 2026</span>
            </div>
          </div>
          <p className="max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            A week packed with spiritual encounters, family bonding, and grand celebrations. Note that some activities are kept secret until the day arrives.
          </p>
        </header>

        {/* Days Grid */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {ITINERARY.map((dayData, index) => (
            <section
              key={dayData.day}
              className="group relative overflow-hidden rounded-2xl border border-stone-200 p-5 shadow-sm hover:border-(--primary-gold)/50 hover:shadow-md transition-all duration-300 dark:border-(--primary-gold)/30"
            >
              {/* Day Header */}
              <div className="mb-4 flex items-center justify-between border-b border-stone-200 dark:border-(--primary-gold)/15 pb-3">
                <div>
                  <h2 className="text-xl font-bold text-(--primary-gold)">{dayData.day}</h2>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                    Day {index + 1}
                  </p>
                </div>
                <div className="rounded-md border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-900 px-2.5 py-1 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                  {dayData.date.split(",")[0]}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3.5">
                {dayData.visibleItems.map((item, idx) => (
                  <div key={idx} className="relative pl-3.5">
                    <div className="absolute left-0 top-1.5 h-1.5 w-1.5 rounded-full bg-(--primary-gold)" />
                    <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-(--primary-gold)">{item.time}</p>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{item.title}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{item.location}</p>
                  </div>
                ))}
              </div>

              <div className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-(--primary-gold)/5 blur-2xl group-hover:bg-(--primary-gold)/10 transition-all" />
            </section>
          ))}
        </div>

        {/* Footer Back Link */}
        <div className="pt-8 flex justify-center">
          <Link href="/" className="text-sm font-semibold text-(--primary-gold) underline hover:opacity-80 transition-opacity">
            &larr; Return to Home
          </Link>
        </div>

      </div>
    </main>
  );
}
