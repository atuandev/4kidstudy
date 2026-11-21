"use client";

import { XIcon } from "@/components/icons";
import { Table } from "@tanstack/react-table";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "../_components/data-table-view-options";
import { DataTableFacetedFilter } from "../_components/data-table-faceted-filter";
import { useTopicFormStore } from "@/lib/stores/topic-form-store";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

const grades = [
  {
    value: "GRADE_1",
    label: "Lớp 1",
  },
  {
    value: "GRADE_2",
    label: "Lớp 2",
  },
  {
    value: "GRADE_3",
    label: "Lớp 3",
  },
  {
    value: "GRADE_4",
    label: "Lớp 4",
  },
  {
    value: "GRADE_5",
    label: "Lớp 5",
  },
];

const statuses = [
  {
    value: "true",
    label: "Hoạt động",
  },
  {
    value: "false",
    label: "Không hoạt động",
  },
];

export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const { setSelectedGrade } = useTopicFormStore();

  useEffect(() => {
    const gradeFilter = table.getColumn("grade")?.getFilterValue() as string[] | undefined;
    if (gradeFilter && gradeFilter.length === 1) {
      setSelectedGrade(gradeFilter[0]);
    } else {
      setSelectedGrade(null);
    }
  }, [table.getState().columnFilters, setSelectedGrade]);

  const handleResetFilters = () => {
    table.resetColumnFilters();
    setSelectedGrade(null);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Tìm kiếm ID..."
          value={(table.getColumn("id")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("id")?.setFilterValue(event.target.value)}
          className="h-8 w-[100px] lg:w-[150px]"
        />
        <Input
          placeholder="Tìm kiếm tiêu đề..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("title")?.setFilterValue(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("grade") && (
          <DataTableFacetedFilter column={table.getColumn("grade")} title="Lớp" options={grades} />
        )}
        {table.getColumn("isActive") && (
          <DataTableFacetedFilter
            column={table.getColumn("isActive")}
            title="Trạng thái"
            options={statuses}
          />
        )}
        {isFiltered && (
          <Button variant="dangerOutline" onClick={handleResetFilters} className="h-8 px-2 lg:px-3">
            Xoá bộ lọc
            <XIcon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
