import { getProfile } from "@/actions/user/profile";
import { AdminSidebar } from "@/app/(admin)/_components/admin-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getProfile();

  return (
    <SidebarProvider>
      <AdminSidebar user={user} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
