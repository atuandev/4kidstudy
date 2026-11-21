"use client";

import {
  BarbellIcon,
  BookOpenTextIcon,
  RankingIcon,
  UserCircleIcon,
  type Icon,
} from "@/components/icons";

import { cn } from "@/lib/utils";
import { NAV_TONES, type NavIconKey, type NavTone } from "./nav-items";

const ICONS: Record<NavIconKey, Icon> = {
  learn: BookOpenTextIcon,
  practice: BarbellIcon,
  leaderboard: RankingIcon,
  profile: UserCircleIcon,
};

interface NavIconProps {
  readonly icon: NavIconKey;
  readonly tone: NavTone;
  readonly active: boolean;
  readonly size?: number;
  readonly className?: string;
}

export function NavIcon({ icon, tone, active, size = 30, className }: NavIconProps) {
  const Glyph = ICONS[icon];
  return (
    <Glyph
      size={size}
      weight={active ? "fill" : "duotone"}
      aria-hidden="true"
      className={cn("shrink-0", NAV_TONES[tone].icon, className)}
    />
  );
}
