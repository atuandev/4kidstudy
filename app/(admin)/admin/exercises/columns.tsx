"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Exercise } from "@/types";
import { DataTableColumnHeader } from "../_components/data-table-column-header";

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
    accessorKey: "difficulty",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Độ khó" />
    ),
    cell: ({ row }) => {
      const difficulty = row.getValue("difficulty") as number | undefined;
      return <div className="text-center">{difficulty ?? "-"}</div>;
    },
    filterFn: (row, id, value) => {
      const difficulty = row.getValue(id) as number | undefined;
      return value.includes(String(difficulty));
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
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Pencil className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <Trash className="mr-2 h-4 w-4" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
