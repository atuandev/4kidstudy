"use client";

import { TypographyLarge } from "@/components/typography";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, PracticeStatistics, ExerciseType } from "@/types";
import {
  BookAIcon,
  Flame,
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  GraduationCap,
} from "lucide-react";

interface AttemptStatisticsProps {
  profile: User;
  stats: PracticeStatistics;
}

const EXERCISE_TYPE_LABELS: Record<ExerciseType, string> = {
  SELECT_IMAGE: "Chọn ảnh đúng",
  MULTIPLE_CHOICE: "Chọn đáp án đúng",
  MATCHING: "Ghép cặp",
  LISTENING: "Nghe",
  PRONUNCIATION: "Luyện phát âm (AI)",
};

export function AttemptStatistics({ profile, stats }: AttemptStatisticsProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookAIcon className="h-5 w-5 text-primary" />
            Thống kê luyện tập
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 h-fit">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-9 h-9 mb-2 bg-yellow-500 rounded-full">
                  <Trophy className="h-4 w-4 text-white" />
                </div>
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {profile.xp.toLocaleString()}
                </div>
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                Tổng số kinh nghiệm
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 h-fit">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-9 h-9 mb-2 bg-orange-500 rounded-full">
                  <Flame className="h-4 w-4 text-white" />
                </div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {profile.streakDays}
                </div>
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                Chuỗi ngày luyện tập
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 h-fit">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-9 h-9 mb-2 bg-emerald-500 rounded-full">
                  <GraduationCap className="h-4 w-4 text-white" />
                </div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.completeLessonCount} / {stats.totalLessonCount}
                </div>
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                Số bài luyện tập hoàn thành
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 h-fit">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-9 h-9 mb-2 bg-blue-500 rounded-full">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <p>{Math.floor(stats.totalDurationSec / 60)}m </p>
                  <p>{stats.totalDurationSec % 60}s</p>
                </div>
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                Tổng thời gian luyện tập
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 h-fit">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-9 h-9 mb-2 bg-green-500 rounded-full">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.totalCorrectCount}
                </div>
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                Số câu đúng
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 h-fit">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-9 h-9 mb-2 bg-red-500 rounded-full">
                  <XCircle className="h-4 w-4 text-white" />
                </div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.totalIncorrectCount}
                </div>
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                Số câu sai
              </div>
            </div>
          </div>

          <TypographyLarge className="mt-6">
            Thống kê theo từng loại luyện tập
          </TypographyLarge>

          <div className="mt-6 space-y-3">
            {stats.byType.map((t) => (
              <div
                key={t.type}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="font-medium">
                  {EXERCISE_TYPE_LABELS[t.type as ExerciseType]}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> {t.correctCount}
                  </span>
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />{" "}
                    {t.correctOnSecondCount}
                  </span>
                  <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="h-4 w-4" /> {t.incorrectCount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
