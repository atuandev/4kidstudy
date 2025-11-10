"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

type SidebarItemProps = {
  label: string;
  iconSrc: string;
  href: string;
};

const buildRouteWithGrade = (href: string, grade: string) => {
  const searchParams = new URLSearchParams();
  searchParams.set("grade", grade);
  return `${href}?${searchParams.toString()}`;
};

const shouldAppendGrade = (href: string) => {
  return href.startsWith("/learn") || href.startsWith("/practice");
};

export const SidebarItem = ({ label, iconSrc, href }: SidebarItemProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedGrade = searchParams.get("grade");
  const targetHref =
    selectedGrade && shouldAppendGrade(href)
      ? buildRouteWithGrade(href, selectedGrade)
      : href;
  const isActive = pathname === href;

  return (
    <Button
      variant={isActive ? "sidebarOutline" : "sidebar"}
      className="h-[52px] justify-start"
      asChild
    >
      <Link href={targetHref}>
        <Image
          src={iconSrc}
          alt={label}
          className="mr-5"
          height={32}
          width={32}
        />
        {label}
      </Link>
    </Button>
  );
};
