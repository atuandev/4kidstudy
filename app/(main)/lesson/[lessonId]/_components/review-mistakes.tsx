"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { RefreshCw } from "lucide-react";

type ReviewMistakesProps = {
  wrongCount: number;
  onStartReview: () => void;
};

export function ReviewMistakes({
  wrongCount,
  onStartReview,
}: ReviewMistakesProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-y-6 px-6 text-center">
        {/* Mascot Image */}
        <div className="relative h-32 w-32 lg:h-40 lg:w-40">
          <Image
            src="/mascot.svg"
            alt="Mascot"
            fill
            className="object-contain"
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-neutral-800 lg:text-4xl">
          Cùng sửa các lỗi sai này nhé!
        </h1>

        {/* Description */}
        <div className="space-y-3 text-neutral-600">
          <p className="text-lg lg:text-xl">
            Có{" "}
            <span className="font-bold text-orange-600">{wrongCount} câu</span>{" "}
            bạn đã làm sai.
          </p>
          <p className="text-lg lg:text-xl">
            Hãy cùng làm lại những câu đó để nắm vững kiến thức nhé!
          </p>
        </div>

        {/* Start Review Button */}
        <Button
          onClick={onStartReview}
          size="lg"
          className="mt-4 flex items-center gap-2 px-8 py-6 text-lg"
        >
          <RefreshCw className="h-5 w-5" />
          Bắt đầu ôn luyện
        </Button>
      </div>
    </div>
  );
}
