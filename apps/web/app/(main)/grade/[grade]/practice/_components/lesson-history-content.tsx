"use client";

import { useState, useEffect } from "react";
import { Check, ChevronDown, History, Trophy, X } from "lucide-react";

import { SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Lesson, Attempt, AttemptDetail, ExerciseType, MostWrongExerciseStats } from "@/types";
import {
  getUserLessonAttempts,
  getAttemptById,
  getMostWrongExercisesByLesson,
} from "@/actions/attempt";
import Image from "next/image";
import { AudioControl } from "@/components/audio-control";
import { LessonWrongSection } from "./lesson-wrong-section";

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

export function LessonHistoryContent({ lesson, lessonId, isOpen }: LessonHistoryContentProps) {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [isLoadingAttempts, setIsLoadingAttempts] = useState(false);
  const [expandedAttemptId, setExpandedAttemptId] = useState<number | null>(null);
  const [attemptDetails, setAttemptDetails] = useState<Attempt | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [mostWrongExercises, setMostWrongExercises] = useState<MostWrongExerciseStats[]>([]);
  const [isLoadingMostWrong, setIsLoadingMostWrong] = useState(false);
  const [isWrongSectionOpen, setIsWrongSectionOpen] = useState(true);

  // When the panel opens (or the lesson changes), reset and show loaders.
  const loadKey = isOpen ? lessonId : null;
  const [startedLoadKey, setStartedLoadKey] = useState<number | null>(null);
  if (loadKey !== startedLoadKey) {
    setStartedLoadKey(loadKey);
    if (loadKey !== null) {
      setIsLoadingAttempts(true);
      setIsLoadingMostWrong(true);
      setExpandedAttemptId(null);
      setAttemptDetails(null);
    }
  }

  // Fetch attempts and most-wrong exercises; ignore responses after close/change.
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    getUserLessonAttempts(lessonId)
      .then((data) => {
        if (!cancelled) setAttempts(data);
      })
      .catch((error) => console.error("Failed to load attempts:", error))
      .finally(() => {
        if (!cancelled) setIsLoadingAttempts(false);
      });

    getMostWrongExercisesByLesson(lessonId)
      .then((data) => {
        if (!cancelled) setMostWrongExercises(data);
      })
      .catch((error) => {
        console.error("Failed to load most wrong exercises:", error);
        if (!cancelled) setMostWrongExercises([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingMostWrong(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, lessonId]);

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
      if (current.totalScore === best.totalScore && current.accuracyPct > best.accuracyPct)
        return current;
      return best;
    });
  }

  /**
   * Count exercises answered correctly on the 2nd attempt
   */
  function getCorrectOnSecondAttemptCount(attempt: Attempt): number {
    if (!attempt.details || attempt.details.length === 0) return 0;
    return attempt.details.filter((detail) => detail.isCorrect && detail.attempts === 2).length;
  }

  /**
   * Count exercises answered correctly on the 2nd attempt with 5 points
   */
  function getCorrectOnSecondAttemptWith5PointsCount(attempt: Attempt): number {
    if (!attempt.details || attempt.details.length === 0) return 0;
    return attempt.details.filter(
      (detail) => detail.isCorrect && detail.attempts === 2 && detail.maxPoints === 5,
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
    const totalScore = completedAttempts?.reduce((sum, a) => sum + a.totalScore, 0);
    const totalAccuracy = completedAttempts?.reduce((sum, a) => sum + a.accuracyPct, 0);
    const totalTimeSpent = attempts?.reduce((sum, a) => sum + (a.durationSec || 0), 0);
    const totalCorrectCount = attempts?.reduce((sum, a) => sum + a.correctCount, 0);
    const totalCorrectOnSecondCount = attempts?.reduce(
      (sum, a) => sum + getCorrectOnSecondAttemptCount(a),
      0,
    );
    const totalIncorrectCount = attempts?.reduce((sum, a) => sum + a.incorrectCount, 0);

    const averageScore = completedAttempts.length > 0 ? totalScore / completedAttempts.length : 0;
    const averageAccuracy =
      completedAttempts.length > 0 ? totalAccuracy / completedAttempts.length : 0;
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
    if (bestAttempt && isOpen && (!bestAttempt.details || bestAttempt.details.length === 0)) {
      getAttemptById(bestAttempt.id)
        .then((data) => {
          setAttempts((prev) => prev.map((a) => (a.id === bestAttempt.id ? data : a)));
        })
        .catch((error) => {
          console.error("Failed to load best attempt details:", error);
        });
    }
  }, [bestAttempt, isOpen]);

  return (
    <SheetContent className="w-full gap-0 sm:max-w-3xl">
      <SheetHeader className="border-b-2 border-wash px-5 pb-4 pt-5 pr-14 sm:px-6">
        <SheetTitle className="text-2xl font-black text-ink">Lịch sử luyện tập</SheetTitle>
        <SheetDescription className="text-base font-extrabold text-sky-ink">
          {lesson.title}
        </SheetDescription>
      </SheetHeader>

      <div className="flex flex-col gap-7 overflow-y-auto px-5 pb-10 pt-5 sm:px-6">
        {!isLoadingAttempts && attempts.length > 0 && (
          <section aria-labelledby="history-overview">
            <SectionTitle id="history-overview">Tổng quan</SectionTitle>
            <dl className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <Tile label="Số lần luyện" value={statistics.totalAttempts} />
              <Tile
                label="Hoàn thành"
                value={statistics.completedAttempts}
                note={`${statistics.completionRate.toFixed(0)}%`}
              />
              <Tile label="Điểm trung bình" value={statistics.averageScore.toFixed(1)} />
              <Tile
                label="Tổng thời gian"
                value={formatDuration(statistics.totalTimeSpent) || "–"}
              />
              <Tile label="Tỷ lệ đúng" value={`${statistics.averageAccuracy.toFixed(1)}%`} />
              <Tile label="Đúng lần 1" value={statistics.totalCorrectCount} tone="text-forest" />
              <Tile
                label="Đúng lần 2"
                value={statistics.totalCorrectOnSecondCount}
                tone="text-sun-ink"
              />
              <Tile label="Sai" value={statistics.totalIncorrectCount} tone="text-cherry-deep" />
            </dl>
          </section>
        )}

        {/* Most wrong exercises */}
        <section>
          <h3>
            <button
              type="button"
              aria-expanded={isWrongSectionOpen}
              onClick={() => setIsWrongSectionOpen((prev) => !prev)}
              className="-mx-2 flex w-[calc(100%+1rem)] items-center justify-between gap-2 rounded-xl px-2 py-1.5 text-left text-lg font-black text-ink outline-none transition-colors hover:bg-wash focus-visible:ring-4 focus-visible:ring-sky/50"
            >
              Câu hay sai nhất
              <ChevronDown
                aria-hidden="true"
                className={cn(
                  "size-5 text-ink-body transition-transform duration-200 ease-peel",
                  isWrongSectionOpen && "rotate-180",
                )}
              />
            </button>
          </h3>
          {isWrongSectionOpen && (
            <div className="mt-2.5">
              <LessonWrongSection
                isLoadingMostWrong={isLoadingMostWrong}
                mostWrongExercises={mostWrongExercises}
              />
            </div>
          )}
        </section>

        {!isLoadingAttempts && bestAttempt && (
          <section aria-labelledby="history-best">
            <SectionTitle id="history-best">Kết quả tốt nhất</SectionTitle>
            <div className="rounded-[22px] bg-sun-wash p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-2 text-base font-black text-sun-body">
                  <span className="flex size-8 items-center justify-center rounded-full bg-sun text-ink">
                    <Trophy className="size-4" aria-hidden="true" />
                  </span>
                  Lần {bestAttempt.attemptNumber}
                </p>
                <p className="text-sm font-bold text-sun-body">
                  {formatDate(bestAttempt.createdAt)}
                </p>
              </div>
              <AttemptMetrics
                attempt={bestAttempt}
                secondCount={bestAttempt.details ? getCorrectOnSecondAttemptCount(bestAttempt) : 0}
                duration={formatDuration(bestAttempt.durationSec)}
                className="mt-3"
                tileClassName="bg-white/70"
              />
            </div>
          </section>
        )}

        {isLoadingAttempts ? (
          <p role="status" className="py-8 text-center text-base font-bold text-ink-body">
            Đang tải...
          </p>
        ) : attempts.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-wash text-ink-body">
              <History className="size-7" aria-hidden="true" />
            </span>
            <p className="mt-3 text-lg font-black text-ink">Chưa có lịch sử luyện tập</p>
            <p className="text-base text-ink-body">Làm bài này một lần là kết quả sẽ hiện ở đây.</p>
          </div>
        ) : (
          <section aria-labelledby="history-all">
            <SectionTitle id="history-all">Tất cả lần luyện tập</SectionTitle>
            <ul className="flex flex-col gap-3">
              {attempts.map((attempt) => {
                const isExpanded = expandedAttemptId === attempt.id;
                const panelId = `attempt-${attempt.id}-details`;
                return (
                  <li
                    key={attempt.id}
                    className="overflow-hidden rounded-[22px] border-2 border-edge"
                  >
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      aria-controls={panelId}
                      onClick={() => handleAttemptClick(attempt.id)}
                      className="w-full px-4 pb-3 pt-4 text-left outline-none transition-colors hover:bg-wash/60 focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-sky/50"
                    >
                      <span className="flex items-start gap-3">
                        <span className="flex flex-1 flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="text-lg font-black text-ink">
                            Lần {attempt.attemptNumber}
                          </span>
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-0.5 text-sm font-extrabold",
                              attempt.isCompleted
                                ? "bg-leaf-wash text-forest"
                                : "bg-wash text-ink-body",
                            )}
                          >
                            {attempt.isCompleted ? "Hoàn thành" : "Chưa hoàn thành"}
                          </span>
                          <span className="text-sm font-bold text-ink-body">
                            {formatDate(attempt.createdAt)}
                          </span>
                        </span>
                        <ChevronDown
                          aria-hidden="true"
                          className={cn(
                            "mt-1 size-5 shrink-0 text-ink-body transition-transform duration-200 ease-peel",
                            isExpanded && "rotate-180",
                          )}
                        />
                      </span>
                    </button>
                    <AttemptMetrics
                      attempt={attempt}
                      secondCount={attempt.details ? getCorrectOnSecondAttemptCount(attempt) : 0}
                      duration={formatDuration(attempt.durationSec)}
                      className="px-4 pb-4"
                    />

                    {isExpanded && (
                      <div id={panelId} className="border-t-2 border-edge bg-wash/60 p-3 sm:p-4">
                        {isLoadingDetails ? (
                          <p
                            role="status"
                            className="py-4 text-center text-sm font-bold text-ink-body"
                          >
                            Đang tải chi tiết...
                          </p>
                        ) : attemptDetails?.details && attemptDetails.details.length > 0 ? (
                          <ol className="flex flex-col gap-2.5">
                            {attemptDetails.details.map((detail, index) => (
                              <li key={detail.id}>
                                <DetailCard detail={detail} position={index + 1} />
                              </li>
                            ))}
                          </ol>
                        ) : (
                          <p className="py-4 text-center text-sm font-bold text-ink-body">
                            Không có chi tiết bài tập
                          </p>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </SheetContent>
  );
}

function SectionTitle({
  id,
  children,
}: {
  readonly id: string;
  readonly children: React.ReactNode;
}) {
  return (
    <h3 id={id} className="mb-2.5 text-lg font-black text-ink">
      {children}
    </h3>
  );
}

interface TileProps {
  readonly label: string;
  readonly value: React.ReactNode;
  readonly note?: string;
  readonly tone?: string;
  readonly className?: string;
}

function Tile({ label, value, note, tone = "text-ink", className }: TileProps) {
  return (
    <div
      className={cn("flex flex-col-reverse gap-0.5 rounded-2xl bg-wash px-3.5 py-2.5", className)}
    >
      <dt className="text-sm font-bold leading-tight text-ink-body">{label}</dt>
      <dd className={cn("text-xl font-black tabular-nums", tone)}>
        {value}
        {note ? <span className="ml-1 text-sm font-bold text-ink-body">({note})</span> : null}
      </dd>
    </div>
  );
}

interface AttemptMetricsProps {
  readonly attempt: Attempt;
  readonly secondCount: number;
  readonly duration: string;
  readonly className?: string;
  readonly tileClassName?: string;
}

/** Score, accuracy, right first/second time, wrong, time for one attempt. */
function AttemptMetrics({
  attempt,
  secondCount,
  duration,
  className,
  tileClassName,
}: AttemptMetricsProps) {
  const firstCount = attempt.details
    ? attempt.details.filter((detail) => detail.isCorrect && detail.attempts === 1).length
    : attempt.correctCount;
  return (
    <dl className={cn("grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6", className)}>
      <Tile
        className={tileClassName}
        label="Điểm"
        value={`${attempt.totalScore}/${attempt.maxScore}`}
      />
      <Tile
        className={tileClassName}
        label="Tỷ lệ đúng"
        value={`${attempt.accuracyPct.toFixed(1)}%`}
      />
      <Tile className={tileClassName} label="Đúng lần 1" value={firstCount} tone="text-forest" />
      <Tile className={tileClassName} label="Đúng lần 2" value={secondCount} tone="text-sun-ink" />
      <Tile
        className={tileClassName}
        label="Sai"
        value={attempt.incorrectCount}
        tone="text-cherry-deep"
      />
      <Tile className={tileClassName} label="Thời gian" value={duration || "–"} />
    </dl>
  );
}

function findOption(detail: AttemptDetail, optionId?: number) {
  return detail.exercise?.options.find((option) => option.id === optionId);
}

function AnswerImage({
  src,
  alt,
  correct,
}: {
  readonly src?: string;
  readonly alt: string;
  readonly correct?: boolean;
}) {
  if (!src) return <p className="text-sm font-bold text-ink-body">Không có hình ảnh</p>;
  return (
    <Image
      width={120}
      height={120}
      src={src}
      alt={alt}
      className={cn(
        "h-20 w-full rounded-xl border-2 bg-white object-contain",
        correct ? "border-leaf" : "border-edge",
      )}
    />
  );
}

/** One exercise inside an attempt: what was asked, what the learner picked, the points. */
function DetailCard({
  detail,
  position,
}: {
  readonly detail: AttemptDetail;
  readonly position: number;
}) {
  const isCorrectOnSecondAttempt = detail.isCorrect && detail.points === 5;
  const type = detail.exercise?.type;
  // The first pick is stored in selectedOption2Id when a second try happened.
  const firstPickId =
    detail.attempts === 2 && detail.selectedOption2Id
      ? detail.selectedOption2Id
      : detail.selectedOptionId;
  const secondPickId = detail.attempts === 2 ? detail.selectedOptionId : undefined;
  const correctOption = detail.exercise?.options.find((option) => option.isCorrect);

  const verdict = isCorrectOnSecondAttempt
    ? { label: "Đúng lần 2", icon: Check, disc: "bg-sun text-ink", border: "border-sun" }
    : detail.isCorrect
      ? { label: "Đúng", icon: Check, disc: "bg-leaf-deep text-white", border: "border-leaf" }
      : { label: "Sai", icon: X, disc: "bg-cherry text-white", border: "border-cherry" };
  const VerdictIcon = verdict.icon;

  return (
    <div className={cn("rounded-2xl border-2 bg-white p-3.5", verdict.border)}>
      <div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full",
                verdict.disc,
              )}
            >
              <VerdictIcon className="size-4" strokeWidth={3} aria-label={verdict.label} />
            </span>
            <p className="text-sm font-extrabold text-ink-body">Câu {position}</p>
            <span className="rounded-full bg-wash px-2 py-0.5 text-xs font-extrabold text-ink-body">
              {EXERCISE_TYPE_LABELS[type ?? "SELECT_IMAGE"]}
            </span>
            <span className="ml-auto text-sm font-black tabular-nums text-ink">
              {detail.points}/{detail.maxPoints} điểm
            </span>
          </div>
          <p className="mt-1.5 text-base font-black text-ink">{detail.exercise?.prompt}</p>

          {detail.exercise?.imageUrl ? (
            <div className="mt-2 w-32">
              <AnswerImage src={detail.exercise.imageUrl} alt="Hình của câu hỏi" />
            </div>
          ) : null}
          {type === "LISTENING" && detail.exercise?.audioUrl ? (
            <AudioControl
              audioUrl={detail.exercise.audioUrl}
              className="mt-2 h-10 w-full max-w-sm"
            />
          ) : type === "PRONUNCIATION" && detail.exercise?.audioUrl ? (
            <>
              <p className="mt-1 text-base font-bold text-ink">{detail.exercise.targetText}</p>
              <AudioControl
                audioUrl={detail.exercise.audioUrl}
                className="mt-2 h-10 w-full max-w-sm"
              />
            </>
          ) : null}

          {type === "LISTENING" || type === "MULTIPLE_CHOICE" ? (
            <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <Tile
                label="Chọn lần 1"
                value={findOption(detail, firstPickId)?.text ?? ""}
                className="[&_dd]:text-base"
              />
              <Tile
                label="Chọn lần 2"
                value={secondPickId ? (findOption(detail, secondPickId)?.text ?? "") : "–"}
                className="[&_dd]:text-base"
              />
              <Tile
                label="Đáp án đúng"
                value={correctOption?.text ?? ""}
                tone="text-forest"
                className="bg-leaf-wash [&_dd]:text-base"
              />
            </dl>
          ) : type === "SELECT_IMAGE" ? (
            <dl className="mt-3 grid grid-cols-3 gap-2">
              <div className="flex flex-col gap-1">
                <dt className="text-sm font-bold text-ink-body">Chọn lần 1</dt>
                <dd>
                  <AnswerImage
                    src={findOption(detail, firstPickId)?.imageUrl}
                    alt="Hình bé chọn lần 1"
                  />
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-sm font-bold text-ink-body">Chọn lần 2</dt>
                <dd>
                  {secondPickId ? (
                    <AnswerImage
                      src={findOption(detail, secondPickId)?.imageUrl}
                      alt="Hình bé chọn lần 2"
                    />
                  ) : (
                    <p className="text-sm font-bold text-ink-body">–</p>
                  )}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-sm font-bold text-forest">Đáp án đúng</dt>
                <dd>
                  <AnswerImage src={correctOption?.imageUrl} alt="Hình đúng" correct />
                </dd>
              </div>
            </dl>
          ) : null}

          {type === "PRONUNCIATION" && detail.pronunciation ? (
            <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
              <Tile
                label="Điểm phát âm"
                value={detail.pronunciation.overall?.toFixed(1) ?? "N/A"}
              />
              {detail.pronunciation.accuracy !== undefined && (
                <Tile label="Chính xác" value={detail.pronunciation.accuracy.toFixed(1)} />
              )}
              {detail.pronunciation.fluency !== undefined && (
                <Tile label="Trôi chảy" value={detail.pronunciation.fluency.toFixed(1)} />
              )}
              {detail.pronunciation.completeness !== undefined && (
                <Tile label="Đầy đủ" value={detail.pronunciation.completeness.toFixed(1)} />
              )}
              {detail.pronunciation.prosody !== undefined && (
                <Tile label="Ngữ điệu" value={detail.pronunciation.prosody.toFixed(1)} />
              )}
            </dl>
          ) : null}
        </div>
      </div>
    </div>
  );
}
