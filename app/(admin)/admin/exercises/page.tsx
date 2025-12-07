'use client';

import { useEffect, useState } from 'react';
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
import { Plus, Download, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import type { Exercise, Lesson } from '@/types';

type ExerciseWithOptions = Exercise & {
  options?: any[];
};

export default function ExercisesPage() {
  const searchParams = useSearchParams();
  const [exercises, setExercises] = useState<ExerciseWithOptions[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const lessonIdParam = searchParams.get('lessonId');
  const filteredExercises = lessonIdParam
    ? exercises.filter((e) => String(e.lessonId) === String(lessonIdParam))
    : exercises;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [exercisesData, lessonsData] = await Promise.all([
          getExercises(),
          getLessons(),
        ]);
        setExercises(exercisesData);
        setLessons(lessonsData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Không thể tải danh sách câu hỏi');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:3001/api';
      const url = lessonIdParam
        ? `${baseUrl}/exercises/export?lessonId=${lessonIdParam}`
        : `${baseUrl}/exercises/export`;

      const response = await fetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'exercises-export.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success('Đã xuất file Excel thành công');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Không thể xuất file Excel');
    } finally {
      setIsExporting(false);
    }
  };

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
                <BreadcrumbPage>Câu hỏi luyện tập</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="space-y-6 px-4">
        <div className="flex items-center justify-between">
          <TypographyH3>Danh sách câu hỏi luyện tập</TypographyH3>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={handleExport}
              disabled={isExporting || isLoading}
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xuất...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Xuất Excel
                </>
              )}
            </Button>
            <Link href="/admin/exercises/form">
              <Button variant="primary">
                <Plus className="h-4 w-4" />
                Thêm câu hỏi luyện tập
              </Button>
            </Link>
          </div>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <DataTable columns={columns} data={filteredExercises} lessons={lessons} />
        )}
      </div>
    </>
  );
}
