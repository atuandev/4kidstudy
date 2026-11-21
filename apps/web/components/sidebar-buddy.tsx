"use client";

import Image from "next/image";

import { useProfile } from "@/hooks/use-profile";

export function SidebarBuddy() {
  const { profile } = useProfile();
  const firstName = profile?.name?.trim().split(/\s+/).at(-1);

  return (
    <div className="relative mt-6">
      <p className="relative rounded-[20px] bg-lime px-4 py-3 text-base font-extrabold leading-snug text-ink">
        {firstName ? `Chào ${firstName}!` : "Chào bé!"}
        <span className="block text-sm font-bold text-ink-body">Hôm nay mình học gì nào?</span>
        <span
          aria-hidden="true"
          className="absolute -bottom-2 left-8 size-4 rotate-45 rounded-[3px] bg-lime"
        />
      </p>
      <Image
        src="/mascot.svg"
        alt=""
        width={56}
        height={56}
        className="ml-3 mt-3 -rotate-6 transition-transform duration-300 ease-peel hover:rotate-6"
      />
    </div>
  );
}
