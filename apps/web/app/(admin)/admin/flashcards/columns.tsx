"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CopyIcon, MoreHorizontal, Pencil, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { Flashcard } from "@/types";
import { DataTableColumnHeader } from "../_components/data-table-column-header";
import { deleteFlashcard } from "@/actions/flashcard";
import Image from "next/image";

const gradeMap: Record<
  string,
  {
    label: string;
    variant:
      | "default"
      | "secondary"
      | "destructive"
      | "outline"
      | "warning"
      | "danger"
      | "purple"
      | "sky"
      | "yellow"
      | "orange";
  }
> = {
  GRADE_1: { label: "Lớp 1", variant: "default" },
  GRADE_2: { label: "Lớp 2", variant: "purple" },
  GRADE_3: { label: "Lớp 3", variant: "sky" },
  GRADE_4: { label: "Lớp 4", variant: "orange" },
  GRADE_5: { label: "Lớp 5", variant: "yellow" },
};

function DeleteFlashcardDialog({ flashcard }: { flashcard: Flashcard }) {
  const [isOpen, setIsOpen] = useState(false);

  function handleDelete() {
    deleteFlashcard(flashcard.id);
    setIsOpen(false);
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuItem
        className="text-red-600"
        onSelect={(e) => {
          e.preventDefault();
          setIsOpen(true);
        }}
      >
        <Trash className="mr-2 h-4 w-4" />
        Xóa
      </DropdownMenuItem>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
          <AlertDialogDescription>
            Hành động này không thể hoàn tác. Flashcard này sẽ bị xóa vĩnh viễn khỏi hệ thống.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Xóa</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const columns: ColumnDef<Flashcard>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
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
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: ({ row }) => <div className="w-[60px]">{row.getValue("id")}</div>,
    filterFn: (row, id, value) => {
      const rowId = String(row.getValue(id));
      return rowId.includes(value);
    },
  },
  {
    accessorKey: "imageUrl",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Hình ảnh" />,
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
    enableSorting: false,
  },
  {
    accessorKey: "term",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Từ vựng" />,
    cell: ({ row }) => {
      const term = row.getValue("term") as string;
      return (
        <div className="max-w-[200px] truncate font-medium" title={term}>
          {term}
        </div>
      );
    },
  },
  {
    accessorKey: "phonetic",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Phiên âm" />,
    cell: ({ row }) => {
      const phonetic = row.getValue("phonetic") as string;
      return <div className="max-w-[150px] truncate text-muted-foreground">{phonetic || "-"}</div>;
    },
  },
  {
    accessorKey: "meaningVi",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nghĩa" />,
    cell: ({ row }) => {
      const meaning = row.getValue("meaningVi") as string;
      return (
        <div className="max-w-[200px] truncate" title={meaning}>
          {meaning}
        </div>
      );
    },
  },
  {
    accessorKey: "topicId",
    id: "topicId",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Unit" />,
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
    accessorKey: "topic.grade",
    id: "grade",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Lớp" />,
    cell: ({ row }) => {
      const grade = row.original.topic?.grade;
      if (!grade) return <div>-</div>;
      const gradeInfo = gradeMap[grade] || {
        label: grade,
        variant: "outline" as const,
      };
      return <Badge variant={gradeInfo.variant}>{gradeInfo.label}</Badge>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.original.topic?.grade);
    },
  },
  {
    accessorKey: "order",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Thứ tự" />,
    cell: ({ row }) => <div className="text-center">{row.getValue("order")}</div>,
  },
  {
    accessorKey: "isActive",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
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
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày tạo" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <div>{date.toLocaleDateString("vi-VN")}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: function ActionsCell({ row }) {
      const flashcard = row.original;
      const router = useRouter();

      function handleEdit() {
        router.push(`/admin/flashcards/form?id=${flashcard.id}`);
      }

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
              onClick={() => navigator.clipboard.writeText(flashcard.id.toString())}
            >
              <CopyIcon className="mr-2 h-4 w-4" />
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </DropdownMenuItem>
            <DeleteFlashcardDialog flashcard={flashcard} />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
