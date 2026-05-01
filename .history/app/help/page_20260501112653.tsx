"use client";

import GlobalNavbar from "@/components/GlobalNavbar";
import GlobalFooter from "@/components/GlobalFooter";
import {
  MessageCircle,
  HelpCircle,
  ChevronDown,
  Phone,
  Mail,
  ExternalLink,
  Users,
} from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "What is the Event Theme and Slogan?",
    answer:
      "The Family Love Built; Bearers of the Seal of the Universal Monarch.",
  },
  {
    question: "What are the Event Families?",
    answer:
      "There are four event families anchoring the 35th Anniversary: <b></b>Family of Dominion, Family of Light, Family of Power, and Family of Virtue. Each participant belongs to one of these families to foster unity and healthy competition.",
  },
  {
    question: "How do I log into my Dashboard?",
    answer:
      "You can log into your personalized dashboard using your Unique Access Code. Keep this code secure as it grants access to your profile, family tree, event schedules, and more. Note that the dashboard is exclusively for consecrated 144s,000 Virgins.",
  },
  {
    question: "Can I change my assigned family?",
    answer:
      "No. Families are automatically assigned by an intelligent algorithm designed by the Event Directorate to ensure balanced participation across all events and competitions.",
  },
  {
    question: "How many times can I edit my profile details?",
    answer:
      "While most fields can be edited multiple times, some key profile details like your Date of Birth can only be edited once, and others like your Date of Consecration is uneditable. Please double-check your entries before saving, and reach out to the Event Directorate should you need to make any changes.",
  },
  {
    question: "What kinds of competitions are held during the anniversary?",
    answer:
      "The celebration features a wide array of activities including Sports (Football, Volleyball, Track Events, etc.), Choral Competitions (Solo, Duet, Quartet, etc.), and Extracurricular Events (Debate, Pageantry, etc.).",
  },
  {
    question: "How is the leaderboard scored?",
    answer:
      "Competitions are scored on a point system based on position. For example, 1st place earns 100%, 2nd place 80%, 3rd place 60%, and 4th place 40% of the maximum points allotted for that event category.",
  },
  {
    question: "When are the sports events taking place?",
    answer:
      "The majority of the sports preliminaries happen in July and early August, with the Grand Finals and Sports Day taking place around August 10th to 12th. See the 'Competitions' page for more details.",
  },
  {
    question: "Are there activities for younger participants?",
    answer:
      "Yes! The Junior Games category includes fun and competitive events like the Sack Race, Egg Race, and Filling the Basket.",
  },
  {
    question: "How do I get the official 35th Anniversary T-Shirt?",
    answer:
      "You can specify your shirt size and view a 3D preview of the official merchandise directly from your dashboard. Distribution details will be communicated by your Family Heads.",
  },
  {
    question: "How can I support or donate to the anniversary?",
    answer:
      "Yes, you can! Simply visit the 'Donate' page on this website to get the account details and make your contributions.",
  },
  {
    question: "Who do I contact if I have an issue or suggestion to make?",
    answer:
      "You can reach out to any member of the Event Directorate using the phone numbers and contact details provided below.",
  },
];

const contactExcos = [
  {
    role: "Event Director",
    name: "Brother Enwọñọ Ntuk",
    img: "https://res.cloudinary.com/dgmo4mkhk/image/upload/v1775030601/lit_vdjxfp.jpg",
    phone: "+234 806 994 0870",
  },
  {
    role: "Asst. Event Director",
    name: "Sister Esu Ethoti",
    img: "https://res.cloudinary.com/dgmo4mkhk/image/upload/v1774983130/photo_2026-03-31_19-46-20_lkaesx.jpg",
    phone: "+234 902 735 0911",
  },
  {
    role: "Event Secretary",
    name: "Brother Daniel Onugu",
    img: "https://res.cloudinary.com/dgmo4mkhk/image/upload/v1774983131/photo_2026-03-31_19-46-27_yaskaf.jpg",
    phone: "+234 704 052 0952",
  },
];

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  const filtered = parts.filter(
    (p) => !["Brother", "Sister"].includes(parts[0]) || p !== parts[0],
  );
  if (filtered.length === 0) return parts[0].charAt(0).toUpperCase();
  if (filtered.length === 1) return filtered[0].charAt(0).toUpperCase();
  return (
    filtered[0].charAt(0) + filtered[filtered.length - 1].charAt(0)
  ).toUpperCase();
}

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const whatsappLink = "https://wa.me/2348069940870";

  return (
    <main className="min-h-screen w-full bg-background text-foreground flex flex-col py-18 font-[family-name:var(--font-libre)]">
      <div className="flex-1 px-4 max-w-6xl mx-auto w-full">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-zinc-900 dark:text-zinc-100">
            How can we <span className="text-(--primary-gold)">Help</span> you?
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto">
            Find answers to common questions or reach out to the Event
            Directorate directly.
          </p>
        </div>

        {/* FAQs Section */}
        <section className="mb-24 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <div className="flex items-center gap-3 mb-10 pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <HelpCircle className="w-6 h-6 text-(--primary-gold)" />
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">
              Frequently Asked{" "}
              <span className="text-(--primary-gold)">Questions</span>
            </h2>
          </div>

          <div className="space-y-4 max-w-4xl mx-auto">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 overflow-hidden transition-all hover:border-(--primary-gold)/30"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${openFaq === idx ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  className={`px-6 overflow-hidden transition-all duration-300 ${openFaq === idx ? "pb-6 max-h-40 opacity-100" : "max-h-0 opacity-0"}`}
                >
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400">
          <div className="flex items-center gap-3 mb-10 pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <Users className="w-6 h-6 text-(--primary-gold)" />
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">
              Contact the{" "}
              <span className="text-(--primary-gold)">Directorate</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactExcos.map((exco) => (
              <div
                key={exco.role}
                className="group relative bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col items-center text-center transition-all hover:-translate-y-2 hover:shadow-xl hover:border-(--primary-gold)/30"
              >
                <div className="relative w-32 h-32 mb-6 rounded-full overflow-hidden border-4 border-(--primary-gold)/20 group-hover:border-(--primary-gold)/40 transition-colors">
                  {exco.img ? (
                    <img
                      src={exco.img}
                      alt={exco.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-3xl font-bold text-(--primary-gold)">
                      {getInitials(exco.name)}
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                  {exco.name}
                </h3>
                <p className="text-xs font-bold tracking-widest text-(--primary-gold) uppercase mb-6">
                  {exco.role}
                </p>

                <div className="w-full pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                  <a
                    href={`tel:${exco.phone}`}
                    className="flex items-center justify-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-(--primary-gold) transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    {exco.phone}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* WhatsApp CTA */}
        <div className="mt-20 text-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
          <div className="inline-block p-1 rounded-3xl bg-linear-to-r from-(--primary-gold)/20 to-transparent">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-(--primary-gold) hover:bg-(--primary-gold)/90 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-lg shadow-(--primary-gold)/20 transition-all hover:scale-105 active:scale-95"
            >
              <MessageCircle className="w-6 h-6 fill-white" />
              Chat with us on WhatsApp
              <ExternalLink className="w-4 h-4 opacity-50" />
            </a>
          </div>
          <p className="mt-6 text-sm text-zinc-400 dark:text-zinc-500">
            We typically respond within 24 hours.
          </p>
        </div>
      </div>
    </main>
  );
}
