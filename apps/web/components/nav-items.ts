export type NavTone = "leaf" | "sky" | "sun" | "grape";

export interface NavItem {
  readonly label: string;
  readonly href: string;
  readonly iconSrc: string;
  /** Each section keeps its own colour, so a child can find it by colour as well as by word. */
  readonly tone: NavTone;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Học", href: "/learn/units", iconSrc: "/learn.svg", tone: "leaf" },
  { label: "Luyện tập", href: "/practice", iconSrc: "/practice.svg", tone: "sky" },
  { label: "Xếp hạng", href: "/leaderboard", iconSrc: "/leaderboard.svg", tone: "sun" },
  { label: "Hồ sơ", href: "/profile", iconSrc: "/profile.svg", tone: "grape" },
];

/** Active and resting classes per tone: a tinted tile on a coloured ledge when active. */
export const NAV_TONES: Record<NavTone, { active: string; disc: string; text: string }> = {
  leaf: { active: "border-leaf bg-leaf-wash", disc: "bg-leaf-wash", text: "text-forest" },
  sky: { active: "border-sky bg-sky-wash", disc: "bg-sky-wash", text: "text-sky-ink" },
  sun: { active: "border-sun bg-sun-wash", disc: "bg-sun-wash", text: "text-sun-ink" },
  grape: { active: "border-grape bg-grape-wash", disc: "bg-grape-wash", text: "text-grape-ink" },
};
