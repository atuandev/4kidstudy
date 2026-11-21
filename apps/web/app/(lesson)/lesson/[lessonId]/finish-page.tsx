"use client";

import { useIsClient } from "@/hooks/use-is-client";
import ReactConfetti from "react-confetti";
import { Footer } from "./_components/footer";
import { ExerciseStatsDashboard } from "./_components/exercise-stats-dashboard";
import Image from "next/image";
import { useWindowSize } from "react-use";
import { useRouter } from "next/navigation";
import { useExerciseStatsStore } from "@/lib/stores/exercise-stats-store";
import { buildGradeHref } from "@/types/grade";
import { Button } from "@/components/ui/button";
import { useSaveAttempt } from "./_hooks";

interface FinishPageProps {
  userId: number;
  lessonId: number;
  grade?: string;
}

export default function FinishPage({ userId, lessonId, grade }: FinishPageProps) {
  const { width, height } = useWindowSize();
  const router = useRouter();
  const { getAccuracy } = useExerciseStatsStore();
  const isMounted = useIsClient();
  const { status: saveStatus, retry } = useSaveAttempt(userId, lessonId);

  const accuracy = getAccuracy();
  const completionMessage =
    accuracy >= 90
      ? "Excellent work!"
      : accuracy >= 70
        ? "Great job!"
        : accuracy >= 50
          ? "Good effort!"
          : "Keep practicing!";

  const hasValidDimensions = width > 0 && height > 0 && isFinite(width) && isFinite(height);

  return (
    <div className="flex min-h-dvh flex-col">
      {isMounted && hasValidDimensions && (
        <ReactConfetti
          recycle={false}
          numberOfPieces={500}
          tweenDuration={10_000}
          width={width}
          height={height}
          colors={["#22C55E", "#1CB0F6", "#FFC800", "#FF4B4B", "#A855F7", "#FF9600"]}
        />
      )}
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 px-4 py-10 text-center sm:gap-8">
        <Image
          src="/finish.svg"
          alt=""
          height={120}
          width={120}
          priority
          className="motion-safe:animate-[sticker-land_0.6s_var(--ease-peel)_0.1s_both]"
        />

        <div>
          <h1 className="text-balance text-3xl font-black tracking-[-0.02em] text-ink sm:text-4xl">
            Bạn đã hoàn thành bài học!
          </h1>
          <p className="mt-2 text-lg font-extrabold text-sky-ink">{completionMessage}</p>
        </div>

        {saveStatus === "error" && (
          <div
            role="alert"
            className="flex w-full flex-col items-center gap-3 rounded-2xl bg-cherry-wash px-4 py-3 text-cherry-deep sm:flex-row sm:justify-between sm:text-left"
          >
            <p className="text-base font-bold">
              Chưa lưu được kết quả. Kiểm tra mạng rồi thử lại nhé.
            </p>
            <Button variant="danger" onClick={retry} className="shrink-0">
              Thử lại
            </Button>
          </div>
        )}

        <div className="w-full">
          <ExerciseStatsDashboard />
        </div>
      </main>
      <Footer
        lessonId={lessonId}
        status="completed"
        onCheck={() => router.push(buildGradeHref(grade, "practice"))}
      />
    </div>
  );
}
