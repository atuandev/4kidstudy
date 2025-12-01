"use client";

import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface TopicItem {
  id: number;
  name: string;
  reviewCount: number;
}

interface Props {
  topTopics: TopicItem[];
}

export function TopicDetailDialog({ topTopics }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="primaryOutline" size="sm" className="gap-2">
          <Eye className="h-4 w-4" />
          Xem chi tiết
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Chi tiết chủ đề đã học</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 min-h-[400px]">
          {topTopics.length === 0 ? (
            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
              Chưa có chủ đề nào được học
            </div>
          ) : (
            <div className="space-y-2">
              {topTopics.slice(0, 5).map((topic, index) => (
                <div
                  key={topic.id}
                  className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-indigo-600 w-8">
                      #{index + 1}
                    </span>
                    <span className="font-medium">{topic.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-indigo-600">
                    {topic.reviewCount} lần
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
