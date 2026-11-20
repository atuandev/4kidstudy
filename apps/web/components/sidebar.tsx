import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { SidebarItem } from "./sidebar-item";

type SidebarProps = {
  className?: string;
};

const SidebarNav = () => (
  <div className="flex flex-1 flex-col gap-y-2">
    <SidebarItem label="Học" href="/learn/units" iconSrc="/learn.svg" />
    <SidebarItem label="Luyện tập" href="/practice" iconSrc="/practice.svg" />
    <SidebarItem label="Bảng xếp hạng" href="/leaderboard" iconSrc="/leaderboard.svg" />
    <SidebarItem label="Hội thoại với AI" href="/chat" iconSrc="/chat.svg" />
    <SidebarItem label="Hồ sơ" href="/profile" iconSrc="/profile.svg" />
  </div>
);

const SidebarNavFallback = () => (
  <div className="flex flex-1 flex-col gap-y-2">
    {Array.from({ length: 5 }).map((_, index) => (
      <div
        key={`sidebar-fallback-${index}`}
        className="h-[52px] w-full animate-pulse rounded-md bg-muted"
      />
    ))}
  </div>
);

export const Sidebar = ({ className }: SidebarProps) => {
  return (
    <div
      className={cn(
        "left-0 top-0 flex h-full flex-col border-r-2 px-4 lg:fixed lg:w-[256px]",
        className,
      )}
    >
      <Link href="/learn/units">
        <div className="flex items-center gap-x-3 pb-7 pl-4 pt-8">
          <Image src="/mascot.svg" alt="Mascot" height={40} width={40} />

          <h1 className="text-2xl font-extrabold tracking-wide text-green-600">4KidStudy</h1>
        </div>
      </Link>

      <Suspense fallback={<SidebarNavFallback />}>
        <SidebarNav />
      </Suspense>
    </div>
  );
};
