"use client";

import { useEffect, useState } from "react";
import { XIcon } from "@/components/icons";
import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "../_components/data-table-view-options";
import { DataTableFacetedFilter } from "../_components/data-table-faceted-filter";
import { Topic } from "@/types";
import { getTopicsByGrade } from "@/actions/topic";
import { useLessonFormStore } from "@/lib/stores/lesson-form-store";

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
    value: "PUBLISHED",
    label: "Hoạt động",
  },
  {
    value: "DRAFT",
    label: "Bản nháp",
  },
  {
    value: "ARCHIVED",
    label: "Không hoạt động",
  },
];

export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const { setSelectedGrade, setSelectedTopicId } = useLessonFormStore();

  const gradeColumn = table.getColumn("grade");
  const selectedGrades = (gradeColumn?.getFilterValue() as string[]) ?? [];
  const hasSelectedGrade = selectedGrades.length > 0;

  const topicColumn = table.getColumn("topicId");
  const selectedTopicIds = (topicColumn?.getFilterValue() as string[]) ?? [];

  // Update store when grade filter changes
  useEffect(() => {
    if (selectedGrades.length === 1) {
      setSelectedGrade(selectedGrades[0]);
    } else {
      setSelectedGrade(null);
    }
  }, [selectedGrades.join(","), setSelectedGrade]);

  // Update store when topic filter changes
  useEffect(() => {
    if (selectedTopicIds.length === 1) {
      setSelectedTopicId(parseInt(selectedTopicIds[0]));
    } else {
      setSelectedTopicId(null);
    }
  }, [selectedTopicIds.join(","), setSelectedTopicId]);

  useEffect(() => {
    const fetchTopicsByGrade = async () => {
      if (!hasSelectedGrade) {
        setFilteredTopics([]);
        table.getColumn("topicId")?.setFilterValue(undefined);
        return;
      }

      setIsLoadingTopics(true);
      try {
        const allTopics: Topic[] = [];
        for (const grade of selectedGrades) {
          const response = await getTopicsByGrade(grade);
          allTopics.push(...response.payload);
        }

        const uniqueTopics = Array.from(
          new Map(allTopics.map((topic) => [topic.id, topic])).values(),
        );
        setFilteredTopics(uniqueTopics);
      } catch (error) {
        console.error("Error fetching topics by grade:", error);
        setFilteredTopics([]);
      } finally {
        setIsLoadingTopics(false);
      }
    };

    fetchTopicsByGrade();
  }, [selectedGrades.join(","), hasSelectedGrade, table]);

  const topicOptions = filteredTopics.map((topic) => ({
    value: String(topic.id),
    label: topic.title,
  }));

  const handleResetFilters = () => {
    table.resetColumnFilters();
    setSelectedGrade(null);
    setSelectedTopicId(null);
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
        {table.getColumn("topicId") && (
          <DataTableFacetedFilter
            column={table.getColumn("topicId")}
            title="Chủ đề"
            options={topicOptions}
            disabled={!hasSelectedGrade || isLoadingTopics}
          />
        )}
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
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
