import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col items-center bg-lime px-4 pb-10 pt-6 text-ink">
      <Link
        href="/"
        className="flex items-center gap-2.5 rounded-xl px-2 py-1 outline-none focus-visible:ring-4 focus-visible:ring-sky/50"
      >
        <Image src="/mascot.svg" alt="" width={36} height={36} loading="eager" />
        <span className="text-2xl font-black tracking-tight text-forest">4KidStudy</span>
      </Link>
      <main className="flex w-full flex-1 items-center justify-center pt-14">{children}</main>
    </div>
  );
}
