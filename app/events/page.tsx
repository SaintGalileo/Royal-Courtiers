import Link from "next/link";

export default function EventsPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-16">
      <h1 className="text-4xl font-bold">Events</h1>
      <p className="text-lg text-zinc-700 dark:text-zinc-300">
        Browse upcoming events, schedules, and details here.
      </p>
      <Link className="underline" href="/">
        Back to Home
      </Link>
    </main>
  );
}
