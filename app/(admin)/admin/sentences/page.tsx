'use client';

import { useEffect, useState } from 'react';
import { getSentenceImages } from "@/actions/sentence";
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
import { PlusIcon, Download, Loader2 } from "lucide-react";
import { toast } from 'sonner';
import type { SentenceImage, Sentence } from '@/types';

type SentenceImageWithSentences = SentenceImage & {
  sentences: Sentence[];
};

export default function SentencesPage() {
  const [sentenceImages, setSentenceImages] = useState<SentenceImageWithSentences[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getSentenceImages();
        setSentenceImages(data);
      } catch (error) {
        console.error('Failed to fetch sentences:', error);
        toast.error('Không thể tải danh sách câu');
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
      const response = await fetch(`${baseUrl}/sentences/export`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sentences-export.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

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
                <BreadcrumbPage>Câu</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="space-y-6 px-4">
        <div className="flex items-center justify-between">
          <TypographyH3>Danh sách thẻ câu</TypographyH3>
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
            <Link href="/admin/sentences/form">
              <Button variant="primary">
                <PlusIcon className="h-4 w-4" />
                Thêm thẻ câu
              </Button>
            </Link>
          </div>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <DataTable columns={columns} data={sentenceImages} />
        )}
      </div>
    </>
  );
}
