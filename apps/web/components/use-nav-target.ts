"use client";

import { useParams, usePathname } from "next/navigation";

const GRADE_SCOPED_PREFIXES = ["/learn/units", "/practice"];

/**
 * Where a nav item points and whether it is the current section. Grade-scoped
 * sections keep the grade in view; without one, the grade-less URL redirects to
 * the student's own grade.
 */
export function useNavTarget(href: string): { targetHref: string; isActive: boolean } {
  const pathname = usePathname();
  const { grade } = useParams<{ grade?: string }>();
  const isGradeScoped = GRADE_SCOPED_PREFIXES.some((prefix) => href.startsWith(prefix));
  const targetHref = grade && isGradeScoped ? `/grade/${grade}${href}` : href;
  const isActive =
    pathname === targetHref ||
    pathname === href ||
    // Sub-pages (a topic's flashcards, the learn index) still light up their section.
    (href === "/learn/units" && pathname.startsWith("/learn")) ||
    (isGradeScoped && pathname.endsWith(href));
  return { targetHref, isActive };
}
