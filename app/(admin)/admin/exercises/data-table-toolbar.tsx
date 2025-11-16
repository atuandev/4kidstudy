"use client";

import { X } from "lucide-react";
import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "../_components/data-table-view-options"
import { DataTableFacetedFilter } from "../_components/data-table-faceted-filter";
import { Lesson } from "@/types";
import { useExerciseFormStore } from "@/lib/stores/exercise-form-store";
import { useEffect } from "react";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  lessons?: Lesson[];
}

const exerciseTypes = [
  {
    value: "SELECT_IMAGE",
    label: "Chọn ảnh",
  },
  {
    value: "MULTIPLE_CHOICE",
    label: "Trắc nghiệm",
  },
  {
    value: "MATCHING",
    label: "Nối từ",
  },
  {
    value: "LISTENING",
    label: "Nghe",
  },
  {
    value: "PRONUNCIATION",
    label: "Phát âm",
  },
];

export function DataTableToolbar<TData>({
  table,
  lessons,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const { setSelectedLessonId } = useExerciseFormStore();

  // Track lessonId filter
  const selectedLessonIds = (table.getColumn("lessonId")?.getFilterValue() as string[]) || [];
  
  useEffect(() => {
    if (selectedLessonIds.length === 1) {
      setSelectedLessonId(parseInt(selectedLessonIds[0]));
    } else {
      setSelectedLessonId(null);
    }
  }, [selectedLessonIds.join(','), setSelectedLessonId]);

  // Create lesson ID options for the faceted filter
  const lessonIdOptions = lessons
    ? lessons.map((lesson) => ({
        value: String(lesson.id),
        label: `${lesson.id} - ${lesson.title}`,
      }))
    : [];

  const handleResetFilters = () => {
    table.resetColumnFilters();
    setSelectedLessonId(null);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Tìm kiếm ID..."
          value={(table.getColumn("id")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("id")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[100px] lg:w-[150px]"
        />
        <Input
          placeholder="Tìm kiếm câu hỏi..."
          value={(table.getColumn("prompt")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("prompt")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("lessonId") && lessonIdOptions.length > 0 && (
          <DataTableFacetedFilter
            column={table.getColumn("lessonId")}
            title="Bài luyện tập"
            options={lessonIdOptions}
          />
        )}
        {table.getColumn("type") && (
          <DataTableFacetedFilter
            column={table.getColumn("type")}
            title="Loại"
            options={exerciseTypes}
          />
        )}
        {isFiltered && (
          <Button
            variant="dangerOutline"
            onClick={handleResetFilters}
            className="h-8 px-2 lg:px-3"
          >
            Xoá bộ lọc
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
