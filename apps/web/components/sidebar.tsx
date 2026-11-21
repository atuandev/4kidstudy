import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { LearnerStats } from "./learner-stats";
import { NAV_ITEMS } from "./nav-items";
import { SidebarBuddy } from "./sidebar-buddy";
import { SidebarItem } from "./sidebar-item";

type SidebarProps = {
  className?: string;
};

export const Sidebar = ({ className }: SidebarProps) => {
  return (
    <div
      className={cn(
        "left-0 top-0 flex h-full flex-col bg-white px-4 pb-5 lg:fixed lg:w-[256px] lg:border-r-2 lg:border-lime-rule",
        className,
      )}
    >
      <Link
        href="/learn/units"
        className="mx-1 mb-4 mt-7 flex items-center gap-2.5 self-start rounded-xl px-2 py-1 outline-none focus-visible:ring-4 focus-visible:ring-sky/50"
      >
        <Image src="/mascot.svg" alt="" height={40} width={40} />
        <span className="text-2xl font-black tracking-tight text-forest">4KidStudy</span>
      </Link>

      <LearnerStats className="mx-1 mb-5 flex-wrap" />

      <nav aria-label="Điều hướng chính" className="flex flex-1 flex-col">
        <ul className="flex flex-col gap-y-2">
          {NAV_ITEMS.map((item) => (
            <SidebarItem key={item.href} {...item} />
          ))}
        </ul>
      </nav>

      <SidebarBuddy />
    </div>
  );
};
