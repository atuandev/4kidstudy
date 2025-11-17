"use client";

import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  History,
  Trophy,
  Clock,
  Target,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Lesson, Attempt, ExerciseType } from "@/types";
import { getUserLessonAttempts, getAttemptById } from "@/actions/attempt";
import Image from "next/image";
import { AudioControl } from "@/components/audio-control";

type LessonHistoryContentProps = {
  lesson: Lesson;
  lessonId: number;
  isOpen: boolean;
};

const EXERCISE_TYPE_LABELS: Record<ExerciseType, string> = {
  SELECT_IMAGE: "Chọn ảnh đúng",
  MULTIPLE_CHOICE: "Chọn đáp án đúng",
  MATCHING: "Ghép cặp",
  LISTENING: "Nghe",
  PRONUNCIATION: "Luyện phát âm (AI)",
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
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}s`;
  }

  function getBestAttempt(): Attempt | null {
    if (attempts.length === 0) return null;
    const completedAttempts = attempts.filter((a) => a.isCompleted);
    if (completedAttempts.length === 0) return null;
    return completedAttempts.reduce((best, current) => {
      if (current.totalScore > best.totalScore) return current;
      if (
        current.totalScore === best.totalScore &&
        current.accuracyPct > best.accuracyPct
      )
        return current;
      return best;
    });
  }

  /**
   * Count exercises answered correctly on the 2nd attempt
   */
  function getCorrectOnSecondAttemptCount(attempt: Attempt): number {
    if (!attempt.details || attempt.details.length === 0) return 0;
    return attempt.details.filter(
      (detail) => detail.isCorrect && detail.attempts === 2
    ).length;
  }

  /**
   * Count exercises answered correctly on the 2nd attempt with 5 points
   */
  function getCorrectOnSecondAttemptWith5PointsCount(attempt: Attempt): number {
    if (!attempt.details || attempt.details.length === 0) return 0;
    return attempt.details.filter(
      (detail) =>
        detail.isCorrect && detail.attempts === 2 && detail.maxPoints === 5
    ).length;
  }

  const bestAttempt = getBestAttempt();

  /**
   * Calculate lesson attempt statistics
   */
  function calculateStatistics() {
    if (attempts.length === 0) {
      return {
        totalAttempts: 0,
        completedAttempts: 0,
        completionRate: 0,
        averageScore: 0,
        averageAccuracy: 0,
        totalCorrectCount: 0,
        totalCorrectOnSecondCount: 0,
        totalIncorrectCount: 0,
        totalTimeSpent: 0,
      };
    }

    const completedAttempts = attempts?.filter((a) => a.isCompleted);
    const totalScore = completedAttempts?.reduce(
      (sum, a) => sum + a.totalScore,
      0
    );
    const totalAccuracy = completedAttempts?.reduce(
      (sum, a) => sum + a.accuracyPct,
      0
    );
    const totalTimeSpent = attempts?.reduce(
      (sum, a) => sum + (a.durationSec || 0),
      0
    );
    const totalCorrectCount = attempts?.reduce(
      (sum, a) => sum + a.correctCount,
      0
    );
    const totalCorrectOnSecondCount = attempts?.reduce(
      (sum, a) => sum + getCorrectOnSecondAttemptCount(a),
      0
    );
    const totalIncorrectCount = attempts?.reduce(
      (sum, a) => sum + a.incorrectCount,
      0
    );

    const averageScore =
      completedAttempts.length > 0 ? totalScore / completedAttempts.length : 0;
    const averageAccuracy =
      completedAttempts.length > 0
        ? totalAccuracy / completedAttempts.length
        : 0;
    const completionRate = (completedAttempts.length / attempts.length) * 100;

    return {
      totalAttempts: attempts.length,
      completedAttempts: completedAttempts.length,
      completionRate,
      averageScore,
      averageAccuracy,
      totalTimeSpent,
      totalCorrectCount,
      totalCorrectOnSecondCount,
      totalIncorrectCount,
    };
  }

  const statistics = calculateStatistics();

  // Load details for best attempt if not already loaded
  useEffect(() => {
    if (
      bestAttempt &&
      isOpen &&
      (!bestAttempt.details || bestAttempt.details.length === 0)
    ) {
      getAttemptById(bestAttempt.id)
        .then((data) => {
          setAttempts((prev) =>
            prev.map((a) => (a.id === bestAttempt.id ? data : a))
          );
        })
        .catch((error) => {
          console.error("Failed to load best attempt details:", error);
        });
    }
  }, [bestAttempt, isOpen]);

  return (
    <SheetContent className="sm:max-w-4xl w-full">
      <SheetHeader>
        <SheetTitle>Lịch sử luyện tập</SheetTitle>
        <SheetDescription className="text-lg font-bold">
          {lesson.title}
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-4 m-4 overflow-y-auto">
        {!isLoadingAttempts && attempts.length > 0 && (
          <div className="mx-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold text-lg">Thống kê luyện tập</h3>
            </div>
            <div className="border rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <History className="h-4 w-4" />
                    <span>Tổng số lần</span>
                  </div>
                  <p className="font-bold text-xl">
                    {statistics.totalAttempts}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Target className="h-4 w-4" />
                    <span>Hoàn thành</span>
                  </div>
                  <p className="font-bold text-xl">
                    {statistics.completedAttempts}
                    <span className="font-normal text-muted-foreground ml-1">
                      ({statistics.completionRate.toFixed(0)}%)
                    </span>
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Trophy className="h-4 w-4" />
                    <span>Điểm trung bình</span>
                  </div>
                  <p className="font-bold text-xl">
                    {statistics.averageScore.toFixed(1)}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Tổng thời gian</span>
                  </div>
                  <p className="font-bold text-xl">
                    {formatDuration(statistics.totalTimeSpent)}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Target className="h-4 w-4" />
                    <span>Tỷ lệ đúng</span>
                  </div>
                  <p className="font-bold text-xl">
                    {statistics.averageAccuracy.toFixed(1)}%
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 " />
                    <span>Đúng lần 1</span>
                  </div>
                  <p className="font-bold text-xl text-green-600">
                    {statistics.totalCorrectCount}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Đúng lần 2</span>
                  </div>
                  <p className="font-bold text-xl text-yellow-600">
                    {statistics.totalCorrectOnSecondCount}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <XCircle className="h-4 w-4" />
                    <span>Sai</span>
                  </div>
                  <p className="font-bold text-xl text-red-600">
                    {statistics.totalIncorrectCount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isLoadingAttempts && bestAttempt && (
          <div className="mx-4">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <h3 className="font-semibold text-lg">Kết quả tốt nhất</h3>
            </div>
            <div className="border-2 border-yellow-400 rounded-lg bg-gradient-to-br from-yellow-50 to-amber-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    Lần {bestAttempt.attemptNumber}
                  </span>
                </div>
                <Badge className="bg-yellow-500 hover:bg-yellow-600">
                  Xuất sắc
                </Badge>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                <div>
                  <span className="text-muted-foreground">Điểm</span>
                  <p className="font-bold text-lg">
                    {bestAttempt.totalScore}/{bestAttempt.maxScore}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tỷ lệ đúng</span>
                  <p className="font-bold text-lg">
                    {bestAttempt.accuracyPct.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Đúng lần 1</span>
                  <p className="font-bold text-green-600 text-lg">
                    {bestAttempt.details
                      ? bestAttempt.details.filter(
                          (detail) => detail.isCorrect && detail.attempts === 1
                        ).length
                      : bestAttempt.correctCount}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Đúng lần 2</span>
                  <p className="font-bold text-yellow-600 text-lg">
                    {bestAttempt.details
                      ? getCorrectOnSecondAttemptCount(bestAttempt)
                      : 0}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Sai</span>
                  <p className="font-bold text-red-600 text-lg">
                    {bestAttempt.incorrectCount}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Thời gian</span>
                  <p className="font-bold text-lg">
                    {formatDuration(bestAttempt.durationSec)}
                  </p>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                {formatDate(bestAttempt.createdAt)}
              </div>
            </div>
          </div>
        )}

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
          <>
            <div className="flex items-center gap-2 mb-2 mx-4">
              <History className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold text-lg">Tất cả lần luyện tập</h3>
            </div>
            {attempts.map((attempt) => {
              const isExpanded = expandedAttemptId === attempt.id;
              return (
                <div
                  key={attempt.id}
                  className="border rounded-lg overflow-hidden mx-4"
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

                    <div className="grid grid-cols-6 gap-2">
                      <div>
                        <span className="text-muted-foreground">Điểm</span>
                        <p className="font-bold text-lg">
                          {attempt.totalScore}/{attempt.maxScore}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Tỷ lệ đúng
                        </span>
                        <p className="font-bold text-lg">
                          {attempt.accuracyPct.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Đúng lần 1
                        </span>
                        <p className="font-bold text-green-600 text-lg">
                          {attempt.details
                            ? attempt.details.filter(
                                (detail) =>
                                  detail.isCorrect && detail.attempts === 1
                              ).length
                            : attempt.correctCount}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Đúng lần 2
                        </span>
                        <p className="font-bold text-yellow-600 text-lg">
                          {attempt.details
                            ? getCorrectOnSecondAttemptCount(attempt)
                            : 0}
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
                        <div className="grid grid-cols-1 gap-2">
                          {attemptDetails.details.map((detail, index) => {
                            const isCorrectOnSecondAttempt =
                              detail.isCorrect && detail.attempts === 2;
                            return (
                              <div
                                key={detail.id}
                                className={cn(
                                  "border rounded-md p-3 space-y-2",
                                  isCorrectOnSecondAttempt
                                    ? "bg-yellow-50 border-yellow-200"
                                    : detail.isCorrect
                                    ? "bg-green-50 border-green-200"
                                    : "bg-red-50 border-red-200"
                                )}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="font-medium text-md">
                                    Câu hỏi #{index + 1}:{" "}
                                    <span className="font-bold">
                                      {detail.exercise?.prompt}
                                    </span>
                                    <div>
                                      {detail.exercise?.imageUrl ? (
                                        <Image
                                          width={50}
                                          height={50}
                                          src={detail.exercise.imageUrl}
                                          alt="Exercise image"
                                          className="w-full h-20 object-contain rounded border-2 border-gray-300 bg-gray-50"
                                        />
                                      ) : null}
                                    </div>
                                    {detail.exercise?.type === "LISTENING" &&
                                    detail.exercise?.audioUrl ? (
                                      <AudioControl
                                        audioUrl={detail.exercise.audioUrl}
                                      />
                                    ) : detail.exercise?.type ===
                                        "PRONUNCIATION" &&
                                      detail.exercise?.audioUrl ? (
                                      <>
                                        <p className="">
                                          {detail.exercise.targetText}
                                        </p>
                                        <AudioControl
                                          audioUrl={detail.exercise.audioUrl}
                                        />
                                      </>
                                    ) : null}
                                  </div>

                                  <Badge
                                    variant="outline"
                                    className="bg-white text-gray-600"
                                  >
                                    {
                                      EXERCISE_TYPE_LABELS[
                                        detail.exercise?.type ?? "SELECT_IMAGE"
                                      ]
                                    }
                                  </Badge>
                                </div>

                                {/* Only show answer details for LISTENING and MULTIPLE_CHOICE */}
                                {detail.exercise?.type === "LISTENING" ||
                                detail.exercise?.type === "MULTIPLE_CHOICE" ? (
                                  <div className="grid grid-cols-3 gap-2">
                                    <div>
                                      <span className="text-muted-foreground">
                                        Đáp án chọn lần 1
                                      </span>
                                      <p className="font-bold text-lg">
                                        {detail.attempts === 2 &&
                                        detail.selectedOption2Id
                                          ? detail.exercise?.options.find(
                                              (option) =>
                                                option.id ===
                                                detail.selectedOption2Id
                                            )?.text ?? ""
                                          : detail.exercise?.options.find(
                                              (option) =>
                                                option.id ===
                                                detail.selectedOptionId
                                            )?.text ?? ""}
                                      </p>
                                    </div>

                                    <div>
                                      <span className="text-muted-foreground">
                                        Đáp án chọn lần 2
                                      </span>
                                      <p className="font-bold text-lg">
                                        {detail.attempts === 2
                                          ? detail.exercise?.options.find(
                                              (option) =>
                                                option.id ===
                                                detail.selectedOptionId
                                            )?.text ?? ""
                                          : ""}
                                      </p>
                                    </div>

                                    <div>
                                      <span className="text-muted-foreground">
                                        Đáp án đúng
                                      </span>
                                      <p className="font-bold text-lg">
                                        {detail.exercise?.options.find(
                                          (option) => option.isCorrect
                                        )?.text ?? ""}
                                      </p>
                                    </div>
                                  </div>
                                ) : detail.exercise?.type === "SELECT_IMAGE" ? (
                                  <div className="grid grid-cols-3 gap-2">
                                    <div>
                                      <span className="text-muted-foreground">
                                        Đáp án chọn lần 1
                                      </span>
                                      <div className="mt-1">
                                        {detail.attempts === 2 &&
                                        detail.selectedOption2Id
                                          ? (() => {
                                              const option =
                                                detail.exercise?.options.find(
                                                  (option) =>
                                                    option.id ===
                                                    detail.selectedOption2Id
                                                );
                                              return option?.imageUrl ? (
                                                <Image
                                                  width={100}
                                                  height={100}
                                                  src={option.imageUrl}
                                                  alt="Selected answer 1"
                                                  className="w-full h-20 object-contain rounded border-2 border-gray-300 bg-gray-50"
                                                />
                                              ) : (
                                                <p className="font-bold text-lg">
                                                  Không có hình ảnh
                                                </p>
                                              );
                                            })()
                                          : (() => {
                                              const option =
                                                detail.exercise?.options.find(
                                                  (option) =>
                                                    option.id ===
                                                    detail.selectedOptionId
                                                );
                                              return option?.imageUrl ? (
                                                <Image
                                                  width={100}
                                                  height={100}
                                                  src={option.imageUrl}
                                                  alt="Selected answer 1"
                                                  className="w-full h-20 object-contain rounded border-2 border-gray-300 bg-gray-50"
                                                />
                                              ) : (
                                                <p className="font-bold text-lg">
                                                  Không có hình ảnh
                                                </p>
                                              );
                                            })()}
                                      </div>
                                    </div>

                                    <div>
                                      <span className="text-muted-foreground">
                                        Đáp án chọn lần 2
                                      </span>
                                      <div className="mt-1">
                                        {detail.attempts === 2
                                          ? (() => {
                                              const option =
                                                detail.exercise?.options.find(
                                                  (option) =>
                                                    option.id ===
                                                    detail.selectedOptionId
                                                );
                                              return option?.imageUrl ? (
                                                <Image
                                                  width={100}
                                                  height={100}
                                                  src={option.imageUrl}
                                                  alt="Selected answer 2"
                                                  className="w-full h-20 object-contain rounded border-2 border-gray-300 bg-gray-50"
                                                />
                                              ) : (
                                                <p className="font-bold text-lg">
                                                  Không có hình ảnh
                                                </p>
                                              );
                                            })()
                                          : null}
                                      </div>
                                    </div>

                                    <div>
                                      <span className="text-muted-foreground">
                                        Đáp án đúng
                                      </span>
                                      <div className="mt-1">
                                        {(() => {
                                          const correctOption =
                                            detail.exercise?.options.find(
                                              (option) => option.isCorrect
                                            );
                                          return correctOption?.imageUrl ? (
                                            <img
                                              src={correctOption.imageUrl}
                                              alt="Correct answer"
                                              className="w-full h-20 object-contain rounded border-2 border-green-500 bg-green-50"
                                            />
                                          ) : (
                                            <p className="font-bold text-lg">
                                              Không có hình ảnh
                                            </p>
                                          );
                                        })()}
                                      </div>
                                    </div>
                                  </div>
                                ) : null}

                                <div className="grid grid-cols-3 gap-2">
                                  <div>
                                    <span className="text-muted-foreground">
                                      Điểm
                                    </span>
                                    <p className="font-bold text-lg">
                                      {detail.points}/{detail.maxPoints}
                                    </p>
                                  </div>
                                  {detail.exercise?.type === "PRONUNCIATION" &&
                                    detail.pronunciation && (
                                      <div>
                                        <span className="text-muted-foreground">
                                          Điểm phát âm:
                                        </span>
                                        <p className="font-bold text-lg">
                                          {detail.pronunciation.overall?.toFixed(
                                            1
                                          ) ?? "N/A"}
                                        </p>
                                      </div>
                                    )}
                                </div>

                                {detail.exercise?.type === "PRONUNCIATION" &&
                                  detail.pronunciation && (
                                    <div className="pt-2 border-t space-y-1">
                                      <div className="grid grid-cols-3 gap-1">
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
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            );
                          })}
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
            })}
          </>
        )}
      </div>
    </SheetContent>
  );
}
