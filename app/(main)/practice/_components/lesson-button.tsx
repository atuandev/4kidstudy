"use client";

import {
  Check,
  Clock,
  Crown,
  History,
  Star,
  Target,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Lesson, Attempt } from "@/types";
import { getUserLessonAttempts, getAttemptById } from "@/actions/attempt";

import "react-circular-progressbar/dist/styles.css";

type LessonButtonProps = {
  id: number;
  index: number;
  totalCount: number;
  locked?: boolean;
  current?: boolean;
  percentage: number;
  lesson: Lesson;
};

export const LessonButton = ({
  id,
  index,
  totalCount,
  locked,
  current,
  percentage,
  lesson,
}: LessonButtonProps) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [isLoadingAttempts, setIsLoadingAttempts] = useState(false);
  const [expandedAttemptId, setExpandedAttemptId] = useState<number | null>(
    null
  );
  const [attemptDetails, setAttemptDetails] = useState<Attempt | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const cycleLength = 8;
  const cycleIndex = index % cycleLength;

  let indentationLevel;

  if (cycleIndex <= 2) indentationLevel = cycleIndex;
  else if (cycleIndex <= 4) indentationLevel = 4 - cycleIndex;
  else if (cycleIndex <= 6) indentationLevel = 4 - cycleIndex;
  else indentationLevel = cycleIndex - 8;

  const rightPosition = indentationLevel * 40;

  const isFirst = index === 0;
  const isLast = index === totalCount;
  const isCompleted = !current && !locked;

  const Icon = isCompleted ? Check : isLast ? Crown : Star;

  const href = isCompleted ? `/lesson/${id}` : "/lesson";

  async function handleViewHistory() {
    setIsSheetOpen(true);
    setIsLoadingAttempts(true);
    setExpandedAttemptId(null);
    setAttemptDetails(null);
    try {
      const data = await getUserLessonAttempts(id);
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
    <>
      <Popover>
        <PopoverTrigger asChild>
          <div
            className="relative cursor-pointer"
            style={{
              right: `${rightPosition}px`,
              marginTop: isFirst && !isCompleted ? 60 : 24,
            }}
          >
            {current ? (
              <div className="relative h-[102px] w-[102px]">
                <div className="absolute -top-6 left-2.5 z-10 animate-bounce rounded-xl border-2 bg-white px-3 py-2.5 font-bold uppercase tracking-wide text-green-500">
                  Start
                  <div
                    className="absolute -bottom-2 left-1/2 h-0 w-0 -translate-x-1/2 transform border-x-8 border-t-8 border-x-transparent"
                    aria-hidden
                  />
                </div>
                <CircularProgressbarWithChildren
                  value={Number.isNaN(percentage) ? 0 : percentage}
                  styles={{
                    path: {
                      stroke: "#4ade80",
                    },
                    trail: {
                      stroke: "#e5e7eb",
                    },
                  }}
                >
                  <Button
                    size="rounded"
                    variant={locked ? "locked" : "secondary"}
                    className="h-[70px] w-[70px] border-b-8"
                  >
                    <Icon
                      className={cn(
                        "h-10 w-10",
                        locked
                          ? "fill-neutral-400 stroke-neutral-400 text-neutral-400"
                          : "fill-primary-foreground text-primary-foreground",
                        isCompleted && "fill-none stroke-[4]"
                      )}
                    />
                  </Button>
                </CircularProgressbarWithChildren>
              </div>
            ) : (
              <Button
                size="rounded"
                variant={locked ? "locked" : "secondary"}
                className="h-[70px] w-[70px] border-b-8"
              >
                <p className="text-2xl font-bold">{index + 1}</p>
              </Button>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent side="right" className="w-80">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{lesson.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {lesson.description}
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Số bài tập:</span>
                <Badge>{lesson._count?.exercises}</Badge>
              </div>
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <Button asChild className="w-full" variant="secondary">
                <Link href={`/lesson/${id}`}>Vào luyện tập</Link>
              </Button>
              <Button className="w-full" onClick={handleViewHistory}>
                <History className="h-4 w-4 mr-2" />
                Xem lịch sử luyện tập
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
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
                <p className="text-muted-foreground">
                  Chưa có lịch sử luyện tập
                </p>
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
                          {attempt.isCompleted
                            ? "Hoàn thành"
                            : "Chưa hoàn thành"}
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
                          <p className="font-bold text-lg">
                            {attempt.accuracyPct}%
                          </p>
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
                          <span className="text-muted-foreground">
                            Thời gian
                          </span>
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
                                      detail.isCorrect
                                        ? "default"
                                        : "destructive"
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
                                        {detail.pronunciation.overall?.toFixed(
                                          1
                                        ) ?? "N/A"}
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
                                            {detail.pronunciation.fluency.toFixed(
                                              1
                                            )}
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
                                      {detail.pronunciation.prosody !==
                                        undefined && (
                                        <div>
                                          <span className="text-muted-foreground">
                                            Ngữ điệu:
                                          </span>
                                          <span className="ml-1 font-medium">
                                            {detail.pronunciation.prosody.toFixed(
                                              1
                                            )}
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
      </Sheet>
    </>
  );
};
