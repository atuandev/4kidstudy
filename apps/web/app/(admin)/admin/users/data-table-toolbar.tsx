"use client";

import { X } from "lucide-react";
import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "../_components/data-table-view-options";
import { DataTableFacetedFilter } from "../_components/data-table-faceted-filter";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

const roles = [
  {
    value: "ADMIN",
    label: "Quản trị viên",
  },
  {
    value: "LEARNER",
    label: "Học viên",
  },
];

const genders = [
  {
    value: "MALE",
    label: "Nam",
  },
  {
    value: "FEMALE",
    label: "Nữ",
  },
  {
    value: "UNSET",
    label: "Chưa xác định",
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
          placeholder="Tìm kiếm tên..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        <Input
          placeholder="Tìm kiếm email..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("email")?.setFilterValue(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("role") && (
          <DataTableFacetedFilter
            column={table.getColumn("role")}
            title="Vai trò"
            options={roles}
          />
        )}
        {table.getColumn("gender") && (
          <DataTableFacetedFilter
            column={table.getColumn("gender")}
            title="Giới tính"
            options={genders}
          />
        )}
        {table.getColumn("isActive") && (
          <DataTableFacetedFilter
            column={table.getColumn("isActive")}
            title="Trạng thái"
            options={statuses}
          />
        )}
        {isFiltered && (
          <Button
            variant="dangerOutline"
            onClick={() => table.resetColumnFilters()}
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
