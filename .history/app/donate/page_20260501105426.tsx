"use client";

import GlobalNavbar from "@/components/GlobalNavbar";
import GlobalFooter from "@/components/GlobalFooter";
import { CreditCard, Landmark, User } from "lucide-react";

export default function DonatePage() {
  const bankDetails = {
    accountNumber: "1100096048",
    accountName: "144,000 Virgins Welfare Account 2",
    bankName: "First Royal Microfinance Bank",
  };

  return (
    <main className="min-h-screen w-full bg-background text-foreground flex flex-col pt-18 font-[family-name:var(--font-libre)]">
      <div className="flex-1 px-4 max-w-4xl mx-auto w-full">
        {/* Header Section */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-zinc-900 dark:text-zinc-100">
            Support Our <span className="text-(--primary-gold)">Mission</span>
          </h1>
        </div>

        {/* 35th Anniversary Description */}
        <div className="mb-12 p-8 rounded-2xl border border-(--primary-gold)/20 bg-(--primary-gold)/5 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
            <span className="text-(--primary-gold)">35th</span> Anniversary
            Celebration
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            As we celebrate our **35th Anniversary**, your donations will go
            directly toward funding our commemorative events, outreach programs,
            and the continued development of The 144,000 Virgins Body.
          </p>
        </div>

        {/* Bank Details Card */}
        <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400">
          <div className="relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 md:p-12 shadow-xl group">
            {/* Decorative background element */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-(--primary-gold)/5 rounded-full blur-3xl group-hover:bg-(--primary-gold)/10 transition-colors duration-700" />

            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-8 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800 pb-4">
              Bank Transfer Details
            </h3>

            <div className="space-y-8">
              <div className="flex items-start gap-5">
                <div className="mt-1 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 text-zinc-400 dark:text-zinc-500">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                    Account Name
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-zinc-800 dark:text-zinc-200">
                    {bankDetails.accountName}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="mt-1 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 text-zinc-400 dark:text-zinc-500">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                    Account Number
                  </p>
                  <p className="text-3xl md:text-4xl font-mono font-bold text-(--primary-gold) tracking-tighter">
                    {bankDetails.accountNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="mt-1 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 text-zinc-400 dark:text-zinc-500">
                  <Landmark className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                    Bank Name
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-zinc-800 dark:text-zinc-200">
                    {bankDetails.bankName}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-800 text-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">
                Please use "35th Anniversary" as your payment reference.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
