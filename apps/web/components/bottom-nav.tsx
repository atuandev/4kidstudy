"use client";

import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { NAV_ITEMS, NAV_TONES, type NavItem } from "./nav-items";
import { useNavTarget } from "./use-nav-target";

function BottomNavItem({ label, iconSrc, href, tone }: NavItem) {
  const { targetHref, isActive } = useNavTarget(href);
  const colors = NAV_TONES[tone];

  return (
    <li className="min-w-0 flex-1">
      <Link
        href={targetHref}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "flex h-16 flex-col items-center justify-center gap-0.5 rounded-[18px] border-2 text-sm font-black leading-none outline-none transition-[background-color,border-color,translate] duration-150 ease-peel focus-visible:ring-4 focus-visible:ring-sky/50 active:translate-y-0.5",
          isActive
            ? cn("border-b-4", colors.active, colors.text)
            : "border-transparent text-ink-body",
        )}
      >
        <Image
          src={iconSrc}
          alt=""
          width={30}
          height={30}
          className={cn(
            "transition-transform duration-200 ease-peel",
            isActive && "-translate-y-0.5 scale-110",
          )}
        />
        <span className="max-w-full truncate px-1">{label}</span>
      </Link>
    </li>
  );
}

/** Phone and tablet navigation: four big tabs that are always in reach of a thumb. */
export function BottomNav() {
  return (
    <nav
      aria-label="Điều hướng chính"
      className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-lime-rule bg-white px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 lg:hidden"
    >
      <ul className="mx-auto flex max-w-xl gap-1.5">
        {NAV_ITEMS.map((item) => (
          <BottomNavItem key={item.href} {...item} />
        ))}
      </ul>
    </nav>
  );
}
