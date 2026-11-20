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

        <div className="flex-1 overflow-y-auto pr-2 min-h-[240px]">
          {topTopics.length === 0 ? (
            <div className="flex items-center justify-center h-[240px] text-ink-meta">
              Chưa có chủ đề nào được học
            </div>
          ) : (
            <div className="divide-y-2 divide-wash">
              {topTopics.slice(0, 5).map((topic, index) => (
                <div key={topic.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-wash text-base font-black tabular-nums text-ink-body">
                      {index + 1}
                    </span>
                    <span className="text-base font-extrabold">{topic.name}</span>
                  </div>
                  <span className="shrink-0 rounded-full bg-sky-wash px-2.5 py-0.5 text-sm font-black tabular-nums text-sky-ink">
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
