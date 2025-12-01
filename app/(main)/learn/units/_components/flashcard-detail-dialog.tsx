"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TopItem {
  id: number;
  name: string;
  reviewCount: number;
  topicName?: string;
  topicId?: number;
}

interface FlashcardDetailDialogProps {
  topItems: TopItem[];
  topics: { id: number; name: string }[];
}

export function FlashcardDetailDialog({ topItems, topics }: FlashcardDetailDialogProps) {
  const [selectedTopic, setSelectedTopic] = useState<string>("all");

  const filteredItems = (selectedTopic === "all" 
    ? topItems 
    : topItems.filter(item => item.topicId?.toString() === selectedTopic)).slice(0, 5);

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
          <DialogTitle>Chi tiết flashcard đã học</DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <Select value={selectedTopic} onValueChange={setSelectedTopic}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn chủ đề" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả chủ đề</SelectItem>
              {topics.map((topic) => (
                <SelectItem key={topic.id} value={topic.id.toString()}>
                  {topic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 min-h-[400px]">
          {filteredItems.length === 0 ? (
            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
              Không có flashcard nào
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-lg font-bold text-orange-600 w-8 flex-shrink-0">
                      #{index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium block truncate">{item.name}</span>
                      {item.topicName && (
                        <span className="text-xs text-muted-foreground block truncate">
                          ({item.topicName})
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-orange-600 ml-2 flex-shrink-0">
                    {item.reviewCount} lần
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
