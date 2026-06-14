import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type CompetitionBackButtonProps = {
  href?: string;
  label?: string;
};

export default function CompetitionBackButton({
  href = "/competitions",
  label = "Back to Competitions",
}: CompetitionBackButtonProps) {
  return (
    <Link
      href={href}
      className="mb-6 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
    >
      <ChevronLeft className="h-4 w-4" />
      {label}
    </Link>
  );
}
