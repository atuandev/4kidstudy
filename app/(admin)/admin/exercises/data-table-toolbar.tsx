"use client";

import { X } from "lucide-react";
import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "../_components/data-table-view-options"
import { DataTableFacetedFilter } from "../_components/data-table-faceted-filter";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
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

const difficultyLevels = [
  {
    value: "1",
    label: "Dễ (1)",
  },
  {
    value: "2",
    label: "Trung bình (2)",
  },
  {
    value: "3",
    label: "Khó (3)",
  },
];

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

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
        {table.getColumn("type") && (
          <DataTableFacetedFilter
            column={table.getColumn("type")}
            title="Loại"
            options={exerciseTypes}
          />
        )}
        {table.getColumn("difficulty") && (
          <DataTableFacetedFilter
            column={table.getColumn("difficulty")}
            title="Độ khó"
            options={difficultyLevels}
          />
        )}
        {isFiltered && (
          <Button
            variant="dangerOutline"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Đặt lại
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
