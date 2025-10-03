"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
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
import { Topic } from "@/types";
import { DataTableColumnHeader } from "../_components/data-table-column-header";
import { deleteTopic } from "@/actions/topic";

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

function DeleteTopicDialog({ topic }: { topic: Topic }) {
  const [isOpen, setIsOpen] = useState(false);

  function handleDelete() {
    deleteTopic(topic.id);
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
            Hành động này không thể hoàn tác. Chủ đề này sẽ bị xóa vĩnh viễn
            khỏi hệ thống cùng với tất cả các bài học và flashcard liên quan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>
            Xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const columns: ColumnDef<Topic>[] = [
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
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tiêu đề" />
    ),
    cell: ({ row }) => {
      const title = row.getValue("title") as string;
      return (
        <div className="max-w-[300px] truncate font-medium" title={title}>
          {title}
        </div>
      );
    },
  },
  {
    accessorKey: "grade",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Lớp" />
    ),
    cell: ({ row }) => {
      const grade = row.getValue("grade") as string | undefined;
      if (!grade) return <div>-</div>;
      const gradeInfo = gradeMap[grade] || {
        label: grade,
        variant: "outline" as const,
      };
      return <Badge variant={gradeInfo.variant}>{gradeInfo.label}</Badge>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "order",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Thứ tự" />
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("order")}</div>
    ),
  },
  {
    accessorKey: "isActive",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Hoạt động" : "Không hoạt động"}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(String(row.getValue(id)));
    },
  },
  {
    accessorKey: "_count.lessons",
    id: "lessonsCount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Số bài học" />
    ),
    cell: ({ row }) => {
      const count = row.original._count?.lessons || 0;
      return <div className="text-center">{count}</div>;
    },
  },
  {
    accessorKey: "_count.flashcards",
    id: "flashcardsCount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Số flashcard" />
    ),
    cell: ({ row }) => {
      const count = row.original._count?.flashcards || 0;
      return <div className="text-center">{count}</div>;
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
      const topic = row.original;

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
              onClick={() =>
                navigator.clipboard.writeText(topic.id.toString())
              }
            >
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Pencil className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </DropdownMenuItem>
            <DeleteTopicDialog topic={topic} />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
