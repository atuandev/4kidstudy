"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";

type SidebarItemProps = {
  label: string;
  iconSrc: string;
  href: string;
};

const GRADE_SCOPED_PREFIXES = ["/learn/units", "/practice"];

const isGradeScoped = (href: string) =>
  GRADE_SCOPED_PREFIXES.some((prefix) => href.startsWith(prefix));

export const SidebarItem = ({ label, iconSrc, href }: SidebarItemProps) => {
  const pathname = usePathname();
  const { grade } = useParams<{ grade?: string }>();
  // Keep the current grade when switching sections. Without one, the
  // grade-less URL redirects to the student's own grade.
  const targetHref = grade && isGradeScoped(href) ? `/grade/${grade}${href}` : href;
  const isActive = pathname === targetHref || pathname === href;

  return (
    <Button
      variant={isActive ? "sidebarOutline" : "sidebar"}
      className="h-[52px] justify-start"
      asChild
    >
      <Link href={targetHref}>
        <Image src={iconSrc} alt={label} className="mr-5" height={32} width={32} />
        {label}
      </Link>
    </Button>
  );
};
