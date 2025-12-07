"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  deleteSentenceImage,
  checkSentenceImageProgressForDelete,
} from "@/actions/sentence";
import { SentenceImage } from "@/types";
import { DataTableColumnHeader } from "../_components/data-table-column-header";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

function DeleteSentenceImageDialog({
  sentenceImage,
}: {
  sentenceImage: SentenceImage;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progressInfo, setProgressInfo] = useState<{
    hasProgress: boolean;
    progressCount: number;
    masteredCount: number;
    sentenceCount: number;
  } | null>(null);

  async function handleCheckProgress() {
    setIsLoading(true);
    try {
      const info = await checkSentenceImageProgressForDelete(sentenceImage.id);
      setProgressInfo(info);
      setIsOpen(true);
    } catch (error) {
      console.error("Error checking progress:", error);
      toast.error("Không thể kiểm tra tiến trình học");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    setIsLoading(true);
    try {
      await deleteSentenceImage(sentenceImage.id);
      // Update local state to reflect soft delete
      sentenceImage.isActive = false;
      toast.success(progressInfo?.hasProgress ? "Đã ẩn thẻ câu thành công" : "Đã xóa thẻ câu thành công");
      setIsOpen(false);
      // Force re-render by triggering a state update in parent
      window.location.reload();
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Không thể xóa thẻ câu");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <DropdownMenuItem
        className="text-red-600"
        disabled={isLoading}
        onSelect={(event) => {
          event.preventDefault();
          handleCheckProgress();
        }}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Trash className="mr-2 h-4 w-4" />
        )}
        Xóa
      </DropdownMenuItem>
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {progressInfo?.hasProgress
                ? "⚠️ Cảnh báo: Thẻ câu đã có lượt học"
                : "Xác nhận xóa thẻ câu"}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                {progressInfo?.hasProgress ? (
                  <>
                    <p>
                      Thẻ câu này có <strong>{progressInfo.sentenceCount} câu</strong> và đã có{" "}
                      <strong className="text-orange-600">
                        {progressInfo.progressCount} lượt học
                      </strong>{" "}
                      từ người dùng
                      {progressInfo.masteredCount > 0 && (
                        <>
                          {" "}
                          (trong đó{" "}
                          <strong className="text-green-600">
                            {progressInfo.masteredCount} lượt đã thuộc
                          </strong>
                          )
                        </>
                      )}
                      .
                    </p>
                    <p className="text-amber-600 font-medium">
                      Thẻ câu sẽ được ẩn đi (soft delete) thay vì xóa vĩnh viễn.
                      Dữ liệu tiến trình học của người dùng sẽ được giữ lại.
                    </p>
                  </>
                ) : (
                  <p>
                    Thẻ câu này chưa có lượt học nào. Thẻ câu sẽ được ẩn đi (soft delete)
                    và không hiển thị cho người dùng nữa.
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {progressInfo?.hasProgress ? "Ẩn thẻ câu" : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export const columns: ColumnDef<SentenceImage>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => <div className="w-[60px]">{row.getValue("id")}</div>,
    filterFn: (row, id, value) => {
      const rowId = String(row.getValue(id));
      return rowId.includes(value);
    },
  },
  {
    accessorKey: "imageUrl",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Hình ảnh" />
    ),
    cell: ({ row }) => {
      const imageUrl = row.getValue("imageUrl") as string;
      return (
        <div className="h-12 w-16 overflow-hidden rounded border bg-muted">
          {imageUrl ? (
            <Image src={imageUrl} alt="image" width={64} height={48} />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              -
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "topic.grade",
    id: "grade",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Lớp" />
    ),
    cell: ({ row }) => {
      const grade = row.original.topic?.grade;
      if (!grade) return <div>-</div>;
      const labelMap: Record<string, string> = {
        GRADE_1: "Lớp 1",
        GRADE_2: "Lớp 2",
        GRADE_3: "Lớp 3",
        GRADE_4: "Lớp 4",
        GRADE_5: "Lớp 5",
      };
      const label = labelMap[grade] || grade;
      return <Badge variant="outline">{label}</Badge>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.original.topic?.grade);
    },
  },
  {
    accessorKey: "topicId",
    id: "topicId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Chủ đề" />
    ),
    cell: ({ row }) => {
      const topicTitle = row.original.topic?.title || "-";
      return (
        <div className="max-w-[200px] truncate" title={topicTitle}>
          {topicTitle}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(String(row.getValue(id)));
    },
  },
  {
    accessorKey: "isActive",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge variant={isActive ? "default" : "outline"}>
          {isActive ? "Hoạt động" : "Không hoạt động"}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(String(row.getValue(id)));
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày tạo" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <div>{date.toLocaleDateString("vi-VN")}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const image = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(image.id.toString())}
            >
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/admin/sentences/form?id=${image.id}`}>
                <Pencil className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </Link>
            </DropdownMenuItem>
            <DeleteSentenceImageDialog sentenceImage={image} />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
