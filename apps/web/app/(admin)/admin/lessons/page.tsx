import { getLessons } from "@/actions/lesson";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { TypographyH3 } from "@/components/typography";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

export default async function LessonsPage() {
  const lessons = await getLessons();
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">
                  <BreadcrumbPage>Trang chủ</BreadcrumbPage>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Bài luyện tập</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="space-y-6 px-4">
        <div className="flex items-center justify-between">
          <TypographyH3>Danh sách bài luyện tập</TypographyH3>
          <Link href="/admin/lessons/form">
            <Button variant="primary">
              <PlusIcon className="h-4 w-4" />
              Thêm bài luyện tập
            </Button>
          </Link>
        </div>
        <DataTable columns={columns} data={lessons} />
      </div>
    </>
  );
}
