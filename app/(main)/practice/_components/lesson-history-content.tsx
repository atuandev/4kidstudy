"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, History } from "lucide-react";

import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Lesson, Attempt } from "@/types";
import { getUserLessonAttempts, getAttemptById } from "@/actions/attempt";

type LessonHistoryContentProps = {
  lesson: Lesson;
  lessonId: number;
  isOpen: boolean;
};

export function LessonHistoryContent({
  lesson,
  lessonId,
  isOpen,
}: LessonHistoryContentProps) {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [isLoadingAttempts, setIsLoadingAttempts] = useState(false);
  const [expandedAttemptId, setExpandedAttemptId] = useState<number | null>(
    null
  );
  const [attemptDetails, setAttemptDetails] = useState<Attempt | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAttempts();
    }
  }, [isOpen, lessonId]);

  async function loadAttempts() {
    setIsLoadingAttempts(true);
    setExpandedAttemptId(null);
    setAttemptDetails(null);
    try {
      const data = await getUserLessonAttempts(lessonId);
      setAttempts(data);
    } catch (error) {
      console.error("Failed to load attempts:", error);
    } finally {
      setIsLoadingAttempts(false);
    }
  }

  async function handleAttemptClick(attemptId: number) {
    if (expandedAttemptId === attemptId) {
      setExpandedAttemptId(null);
      setAttemptDetails(null);
      return;
    }
    setExpandedAttemptId(attemptId);
    setIsLoadingDetails(true);
    try {
      const data = await getAttemptById(attemptId);
      setAttemptDetails(data);
    } catch (error) {
      console.error("Failed to load attempt details:", error);
      setExpandedAttemptId(null);
    } finally {
      setIsLoadingDetails(false);
    }
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatDuration(seconds?: number): string {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  return (
    <SheetContent className="sm:max-w-2xl w-full">
      <SheetHeader>
        <SheetTitle>Lịch sử luyện tập</SheetTitle>
        <SheetDescription>{lesson.title}</SheetDescription>
      </SheetHeader>

      <div className="mt-6 space-y-4 m-4 overflow-y-auto">
        {isLoadingAttempts ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Đang tải...</p>
          </div>
        ) : attempts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <History className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Chưa có lịch sử luyện tập</p>
          </div>
        ) : (
          attempts.map((attempt) => {
            const isExpanded = expandedAttemptId === attempt.id;
            return (
              <div
                key={attempt.id}
                className="border rounded-lg overflow-hidden"
              >
                <div
                  className="p-4 space-y-2 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleAttemptClick(attempt.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        Lần {attempt.attemptNumber}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <Badge
                      variant={attempt.isCompleted ? "default" : "outline"}
                    >
                      {attempt.isCompleted ? "Hoàn thành" : "Chưa hoàn thành"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    <div>
                      <span className="text-muted-foreground">Điểm</span>
                      <p className="font-bold text-lg">
                        {attempt.totalScore}/{attempt.maxScore}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Độ chính xác
                      </span>
                      <p className="font-bold text-lg">{attempt.accuracyPct}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Đúng</span>
                      <p className="font-bold text-green-600 text-lg">
                        {attempt.correctCount}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Sai</span>
                      <p className="font-bold text-red-600 text-lg">
                        {attempt.incorrectCount}
                      </p>
                    </div>

                    <div>
                      <span className="text-muted-foreground">Thời gian</span>
                      <p className="font-bold text-lg">
                        {formatDuration(attempt.durationSec)}
                      </p>
                    </div>
                  </div>

                  <div className="text-muted-foreground">
                    {formatDate(attempt.createdAt)}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t bg-gray-50 p-4">
                    {isLoadingDetails ? (
                      <div className="flex items-center justify-center py-4">
                        <p className="text-sm text-muted-foreground">
                          Đang tải chi tiết...
                        </p>
                      </div>
                    ) : attemptDetails?.details &&
                      attemptDetails.details.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {attemptDetails.details.map((detail, index) => (
                          <div
                            key={detail.id}
                            className={cn(
                              "border rounded-md p-3 space-y-2",
                              detail.isCorrect
                                ? "bg-green-50 border-green-200"
                                : "bg-red-50 border-red-200"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">
                                Bài tập #{index + 1}
                              </span>
                              <Badge
                                variant={
                                  detail.isCorrect ? "default" : "destructive"
                                }
                              >
                                {detail.isCorrect ? "Đúng" : "Sai"}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-muted-foreground">
                                  Điểm
                                </span>
                                <p className="font-bold text-lg">
                                  {detail.points}/{detail.maxPoints}
                                </p>
                              </div>
                              {detail.pronunciation && (
                                <div>
                                  <span className="text-muted-foreground">
                                    Phát âm:
                                  </span>
                                  <p className="font-medium">
                                    {detail.pronunciation.overall?.toFixed(1) ??
                                      "N/A"}
                                    %
                                  </p>
                                </div>
                              )}
                            </div>

                            {detail.pronunciation && (
                              <div className="pt-2 border-t space-y-1">
                                <p className="text-xs font-medium">
                                  Chi tiết phát âm:
                                </p>
                                <div className="grid grid-cols-2 gap-1 text-xs">
                                  {detail.pronunciation.accuracy !==
                                    undefined && (
                                    <div>
                                      <span className="text-muted-foreground">
                                        Độ chính xác:
                                      </span>
                                      <span className="ml-1 font-medium">
                                        {detail.pronunciation.accuracy.toFixed(
                                          1
                                        )}
                                        %
                                      </span>
                                    </div>
                                  )}
                                  {detail.pronunciation.fluency !==
                                    undefined && (
                                    <div>
                                      <span className="text-muted-foreground">
                                        Độ trôi chảy:
                                      </span>
                                      <span className="ml-1 font-medium">
                                        {detail.pronunciation.fluency.toFixed(1)}
                                        %
                                      </span>
                                    </div>
                                  )}
                                  {detail.pronunciation.completeness !==
                                    undefined && (
                                    <div>
                                      <span className="text-muted-foreground">
                                        Độ hoàn thành:
                                      </span>
                                      <span className="ml-1 font-medium">
                                        {detail.pronunciation.completeness.toFixed(
                                          1
                                        )}
                                        %
                                      </span>
                                    </div>
                                  )}
                                  {detail.pronunciation.prosody !== undefined && (
                                    <div>
                                      <span className="text-muted-foreground">
                                        Ngữ điệu:
                                      </span>
                                      <span className="ml-1 font-medium">
                                        {detail.pronunciation.prosody.toFixed(1)}
                                        %
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Không có chi tiết bài tập
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </SheetContent>
  );
}

