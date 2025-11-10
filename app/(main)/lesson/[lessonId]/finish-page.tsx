"use client";

import { useState, useEffect } from "react";
import ReactConfetti from "react-confetti";
import { Footer } from "./_components/footer";
import { ExerciseStatsDashboard } from "./_components/exercise-stats-dashboard";
import Image from "next/image";
import { useWindowSize } from "react-use";
import { useRouter } from "next/navigation";
import { useExerciseStatsStore } from "@/lib/stores/exercise-stats-store";

type FinishPageProps = {
  lessonId: number;
};

export default function FinishPage({ lessonId }: FinishPageProps) {
  const { width, height } = useWindowSize();
  const router = useRouter();
  const { getAccuracy } = useExerciseStatsStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
    <div className="min-h-screen flex flex-col">
      {isMounted && hasValidDimensions && (
        <ReactConfetti
          recycle={false}
          numberOfPieces={500}
          tweenDuration={10_000}
          width={width}
          height={height}
        />
      )}
      <div className="mx-auto flex flex-1 max-w-lg flex-col items-center justify-center gap-y-4 text-center lg:gap-y-8">
        <Image
          src="/finish.svg"
          alt="Finish"
          className="hidden lg:block"
          height={100}
          width={100}
        />

        <Image
          src="/finish.svg"
          alt="Finish"
          className="block lg:hidden"
          height={100}
          width={100}
        />

        <h1 className="text-lg font-bold text-neutral-700 lg:text-3xl">
          {completionMessage} <br /> Bạn đã hoàn thành bài học.
        </h1>

        {/* Comprehensive Stats Dashboard */}
        <div className="w-full max-w-2xl">
          <ExerciseStatsDashboard />
        </div>
      </div>
      <Footer
        lessonId={lessonId}
        status="completed"
        onCheck={() => router.push("/practice?grade=GRADE_1")}
      />
    </div>
  );
}
