import { getExercises } from "@/actions/exercise";
import { getLessons } from "@/actions/lesson";
import { TypographyH3 } from "@/components/typography";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import {
  Breadcrumb,
  BreadcrumbPage,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function ExercisesPage() {
  const [exercises, lessons] = await Promise.all([
    getExercises(),
    getLessons(),
  ]);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">
                  <BreadcrumbPage>Trang chủ</BreadcrumbPage>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Câu hỏi</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="space-y-6 px-4">
        <div className="flex items-center justify-between">
          <TypographyH3>Danh sách câu hỏi</TypographyH3>
          <Link href="/admin/exercises/form">
            <Button variant="primary">
              <Plus className="h-4 w-4" />
              Thêm câu hỏi
            </Button>
          </Link>
        </div>
        <DataTable columns={columns} data={exercises} lessons={lessons} />
      </div>
    </>
  );
}
