"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CopyIcon, MoreHorizontal, Pencil, Trash } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

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
import { Exercise } from "@/types";
import { DataTableColumnHeader } from "../_components/data-table-column-header";
import { deleteExercise } from "@/actions/exercise";

const exerciseTypeMap: Record<
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
  SELECT_IMAGE: { label: "Chọn ảnh", variant: "default" },
  MULTIPLE_CHOICE: { label: "Trắc nghiệm", variant: "purple" },
  MATCHING: { label: "Nối từ", variant: "sky" },
  LISTENING: { label: "Nghe", variant: "orange" },
  PRONUNCIATION: { label: "Phát âm", variant: "yellow" },
};

function DeleteExerciseDialog({ exercise }: { exercise: Exercise }) {
  const [isOpen, setIsOpen] = useState(false);

  function handleDelete() {
    deleteExercise(exercise.id);
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
            Hành động này không thể hoàn tác. Bài tập này sẽ bị xóa vĩnh viễn
            khỏi hệ thống.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
          >
            Xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const columns: ColumnDef<Exercise>[] = [
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
    accessorKey: "prompt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Câu hỏi" />
    ),
    cell: ({ row }) => {
      const prompt = row.getValue("prompt") as string;
      return (
        <div className="max-w-[400px] truncate font-medium" title={prompt}>
          {prompt}
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Loại" />
    ),
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      const typeInfo = exerciseTypeMap[type] || {
        label: type,
        variant: "outline" as const,
      };
      return <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "lessonId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Lesson ID" />
    ),
    cell: ({ row }) => <div>{row.getValue("lessonId")}</div>,
    filterFn: (row, id, value) => {
      return value.includes(String(row.getValue(id)));
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
    accessorKey: "points",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Điểm" />
    ),
    cell: ({ row }) => {
      const points = row.getValue("points") as number;
      return <div className="text-center font-medium">{points}</div>;
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
      const exercise = row.original;

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
                navigator.clipboard.writeText(exercise.id.toString())
              }
            >
              <CopyIcon className="mr-2 h-4 w-4" />
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <Link href={`/admin/exercises/form?id=${exercise.id}`}>
              <DropdownMenuItem>
                <Pencil className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
            </Link>
            <DeleteExerciseDialog exercise={exercise} />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
