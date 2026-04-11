"use client";

import { useEffect, useState } from "react";

const WELCOME_SEEN_KEY = "welcome-popup-seen";

export default function WelcomePopup() {
  const [show, setShow] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const auth = localStorage.getItem("virgins-auth");
    if (auth) {
      try {
        const { firstName } = JSON.parse(auth);
        setUserName(firstName);
      } catch {
        setUserName(null);
      }
    }

    const seen = localStorage.getItem(WELCOME_SEEN_KEY);
    if (!seen) {
      setShow(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(WELCOME_SEEN_KEY, "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-(--primary-gold)/40 bg-white p-7 text-zinc-900 shadow-2xl dark:bg-zinc-950 dark:text-zinc-100">
        {/* Decorative accent */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-(--primary-gold)/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-(--primary-gold)/8 blur-2xl" />

        <div className="relative space-y-4">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-3xl mb-3 font-bold  text-[#fff])">
              Welcome to <br /> The Family Love Built
            </h1>
            <p className="text-sm italic text-zinc-500 dark:text-zinc-400">
              "Bearers of the Seal of the Universal Monarch"
            </p>
          </div>

          {/* Body */}
          <div className="space-y-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {userName ? (
              <p>
                We are thrilled to see you already part of the family celebration. Since you have already <strong>filled in your details</strong>, you can access your dashboard anytime to track your family assignment, shirt status, and 3D previews.
              </p>
            ) : (
              <p>
                As we prepare for the grand <strong>35th Anniversary celebration</strong> of the 144,000 Virgins Body, here is what you need to know for this event:
              </p>
            )}

            <ul className="list-inside list-disc space-y-1.5 pl-1">
              {!userName && (
                <>
                  <li>
                    <strong>Fill in your real details</strong> the system will automatically assign you to one of the four event families.
                  </li>
                  <li>
                    Select your <strong>Anniversary polo size</strong> so we can print the exact fit. The <strong>3D prototype</strong> of the official polo is also available on your dashboard.
                  </li>
                </>
              )}

              <li>
                <strong>Keep your access code safe!</strong> It is your unique key to log in anytime.
              </li>
              <li>
                Your details are safe and your family is counting on you for the 35th Anniversary. At the end the overall best family shall be crowned the family of seraphs. Goodluck!
              </li>
            </ul>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={dismiss}
            className="btn-primary mt-2 w-full rounded-lg px-5 py-2.5 text-sm font-bold tracking-wide"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
