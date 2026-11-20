import Image from "next/image";
import Link from "next/link";

import { LearnerStats } from "./learner-stats";

/** Phone and tablet top bar: the logo and the child's XP and streak. Navigation lives in the bottom tabs. */
export const MobileHeader = () => {
  return (
    <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between gap-3 border-b-2 border-lime-rule bg-white px-4 lg:hidden">
      <Link
        href="/learn/units"
        className="flex items-center gap-2 rounded-xl px-1 outline-none focus-visible:ring-4 focus-visible:ring-sky/50"
      >
        <Image src="/mascot.svg" alt="" height={36} width={36} />
        <span className="text-xl font-black tracking-tight text-forest max-[359px]:sr-only">
          4KidStudy
        </span>
      </Link>
      <LearnerStats compact />
    </header>
  );
};
