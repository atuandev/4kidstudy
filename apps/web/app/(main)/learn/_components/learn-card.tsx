import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface LearnCardProps {
  readonly title: string;
  readonly description: string;
  readonly href: string;
}

/** A white sticker link to one area of the learning corner. */
export const LearnCard = ({ title, description, href }: LearnCardProps) => {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-[24px] border-2 border-b-4 border-edge bg-white p-5 outline-none transition-[translate,border-color] duration-150 ease-peel hover:border-sky active:translate-y-0.5 active:border-b-2 focus-visible:ring-4 focus-visible:ring-sky/50"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-xl font-black text-ink">{title}</span>
        <span className="mt-0.5 block text-base text-ink-body">{description}</span>
      </span>
      <ChevronRight
        aria-hidden="true"
        className="size-6 shrink-0 text-ink-meta transition-colors group-hover:text-sky-ink"
      />
    </Link>
  );
};
