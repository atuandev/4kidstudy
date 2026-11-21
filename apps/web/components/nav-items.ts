export type NavTone = "leaf" | "sky" | "sun" | "grape";

export type NavIconKey = "learn" | "practice" | "leaderboard" | "profile";

export interface NavItem {
  readonly label: string;
  readonly href: string;
  readonly icon: NavIconKey;
  readonly tone: NavTone;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Học", href: "/learn/units", icon: "learn", tone: "leaf" },
  { label: "Luyện tập", href: "/practice", icon: "practice", tone: "sky" },
  { label: "Xếp hạng", href: "/leaderboard", icon: "leaderboard", tone: "sun" },
  { label: "Hồ sơ", href: "/profile", icon: "profile", tone: "grape" },
];

export const NAV_TONES: Record<
  NavTone,
  { active: string; disc: string; text: string; icon: string }
> = {
  leaf: {
    active: "border-leaf bg-leaf-wash",
    disc: "bg-leaf-wash",
    text: "text-forest",
    icon: "text-leaf-deep",
  },
  sky: {
    active: "border-sky bg-sky-wash",
    disc: "bg-sky-wash",
    text: "text-sky-ink",
    icon: "text-sky-deep",
  },
  sun: {
    active: "border-sun bg-sun-wash",
    disc: "bg-sun-wash",
    text: "text-sun-ink",
    icon: "text-sun-deep",
  },
  grape: {
    active: "border-grape bg-grape-wash",
    disc: "bg-grape-wash",
    text: "text-grape-ink",
    icon: "text-grape",
  },
};
