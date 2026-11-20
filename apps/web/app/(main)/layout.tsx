import type { PropsWithChildren } from "react";

import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { BottomNav } from "@/components/bottom-nav";

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <div className="min-h-dvh bg-lime text-ink">
      <MobileHeader />
      <Sidebar className="hidden lg:flex" />
      <BottomNav />
      <main className="min-h-dvh pt-16 lg:pl-[256px] lg:pt-0">
        <div className="mx-auto h-full max-w-[1200px] px-4 pb-32 pt-5 sm:px-8 lg:pb-16 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
