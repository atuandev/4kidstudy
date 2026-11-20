"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  CopyIcon,
  DotsThreeIcon,
  ListIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/icons";
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
import { Lesson } from "@/types";
import { DataTableColumnHeader } from "../_components/data-table-column-header";
import { deleteLesson } from "@/actions/lesson";
import { ImportCsvDialog } from "./import-csv-dialog";
import { useExerciseFormStore } from "@/lib/stores/exercise-form-store";

const statusMap: Record<
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
  PUBLISHED: { label: "Hoạt động", variant: "default" },
  DRAFT: { label: "Bản nháp", variant: "secondary" },
  ARCHIVED: { label: "Không hoạt động", variant: "outline" },
};

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

function DeleteLessonDialog({ lesson }: { lesson: Lesson }) {
  const [isOpen, setIsOpen] = useState(false);

  function handleDelete() {
    deleteLesson(lesson.id);
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
        <TrashIcon className="mr-2 h-4 w-4" />
        Xóa
      </DropdownMenuItem>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
          <AlertDialogDescription>
            Hành động này không thể hoàn tác. Bài luyện tập này sẽ bị xóa vĩnh viễn khỏi hệ thống
            cùng với tất cả các bài tập liên quan.
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

export const columns: ColumnDef<Lesson>[] = [
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
    accessorKey: "title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tiêu đề" />,
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
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusInfo = statusMap[status] || {
        label: status,
        variant: "outline" as const,
      };
      return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "_count.exercises",
    id: "exercisesCount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Số bài tập" />,
    cell: ({ row }) => {
      const count = row.original._count?.exercises || 0;
      return <div className="text-center">{count}</div>;
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
      const lesson = row.original;
      const router = useRouter();
      const { setSelectedLessonId } = useExerciseFormStore();

      function handleEdit() {
        router.push(`/admin/lessons/form?id=${lesson.id}`);
      }

      function handleAddExercises() {
        setSelectedLessonId(lesson.id);
        router.push("/admin/exercises/form");
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <DotsThreeIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(lesson.id.toString())}>
              <CopyIcon className="mr-2 h-4 w-4" />
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(`/admin/exercises?lessonId=${lesson.id}`)}>
              <ListIcon className="mr-2 h-4 w-4" />
              Danh sách câu hỏi
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleAddExercises}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Thêm câu hỏi
            </DropdownMenuItem>
            <ImportCsvDialog lessonId={lesson.id} lessonTitle={lesson.title} />
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleEdit}>
              <PencilSimpleIcon className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </DropdownMenuItem>
            <DeleteLessonDialog lesson={lesson} />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
