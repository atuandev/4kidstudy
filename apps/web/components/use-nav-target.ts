"use client";

import { useParams, usePathname } from "next/navigation";

const GRADE_SCOPED_PREFIXES = ["/learn/units", "/practice"];

export function useNavTarget(href: string): { targetHref: string; isActive: boolean } {
  const pathname = usePathname();
  const { grade } = useParams<{ grade?: string }>();
  const isGradeScoped = GRADE_SCOPED_PREFIXES.some((prefix) => href.startsWith(prefix));
  const targetHref = grade && isGradeScoped ? `/grade/${grade}${href}` : href;
  const isActive =
    pathname === targetHref ||
    pathname === href ||
    (href === "/learn/units" && pathname.startsWith("/learn")) ||
    (isGradeScoped && pathname.endsWith(href));
  return { targetHref, isActive };
}
