"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";
import { NavIcon } from "./nav-icons";
import { NAV_TONES, type NavItem } from "./nav-items";
import { useNavTarget } from "./use-nav-target";

/** A big sidebar tile: the section's picture in a tinted disc, its name, its colour when active. */
export const SidebarItem = ({ label, icon, href, tone }: NavItem) => {
  const { targetHref, isActive } = useNavTarget(href);
  const colors = NAV_TONES[tone];

  return (
    <li>
      <Link
        href={targetHref}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "group flex h-16 items-center gap-3.5 rounded-[20px] border-2 px-2.5 text-lg font-black outline-none transition-[background-color,border-color,translate] duration-150 ease-peel focus-visible:ring-4 focus-visible:ring-sky/50",
          isActive
            ? cn("border-b-4", colors.active, colors.text)
            : "border-transparent text-ink-body hover:bg-wash hover:text-ink active:translate-y-0.5",
        )}
      >
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-2xl transition-transform duration-200 ease-peel group-hover:-rotate-6",
            isActive ? "bg-white" : colors.disc,
          )}
        >
          <NavIcon icon={icon} tone={tone} active={isActive} />
        </span>
        {label}
      </Link>
    </li>
  );
};
