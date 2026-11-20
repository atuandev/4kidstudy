"use client";

import Image from "next/image";
import { SentenceImage } from "@/types";
import { CheckIcon, LightbulbIcon, SpeakerHighIcon } from "@/components/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AudioRecord } from "./audio-record";
import { AudioControl } from "@/components/audio-control";
import { RoundButton } from "@/components/learn/round-button";
import { ReviewContentFormData } from "@/schemas/learning-progress";
import { cn } from "@/lib/utils";

interface SentenceCardProps {
  sentenceImage: SentenceImage;
  onRecordReview?: (body: ReviewContentFormData) => Promise<unknown>;
  onPronunciationAssessed?: (sentenceId: number, passed: boolean) => void;
  masteredSentenceIds: Set<number>; // Sentences with isMastered = true from backend
}

export function SentenceCard({
  sentenceImage,
  onRecordReview,
  onPronunciationAssessed,
  masteredSentenceIds,
}: SentenceCardProps) {
  const handlePlayAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play().catch((error) => {
      console.error("Error playing audio:", error);
    });
  };

  const handleAssessmentComplete = (sentenceId: number) => (score: number, passed: boolean) => {
    // console.log(`[Sentence ${sentenceId}] Assessment complete:`, { score, passed });
    onPronunciationAssessed?.(sentenceId, passed);

    // Record review and set isMastered = true if passed (>= 50%)
    if (typeof onRecordReview === "function") {
      // console.log(`[Sentence ${sentenceId}] Calling reviewContent API with isMastered=${passed}...`);
      onRecordReview({
        contentType: "SENTENCE",
        flashcardId: undefined,
        sentenceId,
        isMastered: passed, // Set mastered if passed pronunciation check
      })
        .then((result) => {
          console.log(`[Sentence ${sentenceId}] reviewContent success:`, result);
        })
        .catch((error: unknown) => {
          console.error(`[Sentence ${sentenceId}] record review failed:`, error);
        });
    } else {
      console.warn(`[Sentence ${sentenceId}] onRecordReview is not a function`);
    }
  };

  const activeSentences = sentenceImage.sentences
    .filter((sentence) => sentence.isActive)
    .sort((a, b) => a.order - b.order);

  return (
    <section className="grid grid-cols-1 gap-5 rounded-[28px] bg-white p-4 shadow-sheet-lime sm:p-6 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-7">
      <div className="flex flex-col gap-4">
        <div className="-rotate-1 overflow-hidden rounded-[22px] border-[5px] border-white bg-wash shadow-sticker">
          {/* Natural aspect: these pictures range from square panels to wide comic strips. */}
          <Image
            src={sentenceImage.imageUrl}
            alt="Hình minh hoạ cho các câu"
            width={1200}
            height={800}
            sizes="(min-width: 768px) 420px, 100vw"
            className="block h-auto max-h-[28rem] w-full object-contain"
            priority
          />
        </div>
        {sentenceImage.audioUrl && (
          <div className="rounded-2xl bg-wash p-3">
            <p className="mb-2 px-1 text-sm font-black text-ink">Nghe cả đoạn</p>
            <AudioControl audioUrl={sentenceImage.audioUrl} className="h-10 w-full" />
          </div>
        )}
      </div>

      {activeSentences.length === 0 ? (
        <p className="self-center py-8 text-center text-base font-bold text-ink-body">
          Hình này chưa có câu học.
        </p>
      ) : (
        <ol className="flex flex-col gap-3">
          {activeSentences.map((sentence, position) => {
            // Check if sentence is mastered (isMastered = true from backend)
            const isMastered = masteredSentenceIds.has(sentence.id);

            return (
              <li
                key={sentence.id}
                className={cn(
                  "rounded-[22px] border-2 bg-white p-4 transition-colors",
                  isMastered ? "border-leaf" : "border-edge",
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-1 flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-black",
                      isMastered ? "bg-leaf-deep text-white" : "bg-sky-wash text-sky-ink",
                    )}
                  >
                    {isMastered ? <CheckIcon className="size-4" /> : position + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xl font-black leading-snug text-ink sm:text-2xl">
                      {sentence.text}
                    </p>
                    {sentence.meaningVi && (
                      <p className="mt-1 text-base font-semibold text-ink-body sm:text-lg">
                        {sentence.meaningVi}
                      </p>
                    )}
                    {isMastered ? (
                      <p className="mt-1 text-sm font-black text-forest">Đã đọc đúng</p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2.5 pl-11">
                  {sentence.audioUrl && (
                    <RoundButton
                      aria-label="Nghe câu này"
                      onClick={() => handlePlayAudio(sentence.audioUrl!)}
                    >
                      <SpeakerHighIcon aria-hidden="true" />
                    </RoundButton>
                  )}

                  {sentence.hintVi && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          aria-label="Xem gợi ý"
                          className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-sun-wash text-sun-ink shadow-[0_4px_0_#F5D77A] outline-none transition-[translate,box-shadow] duration-150 ease-peel active:translate-y-1 active:shadow-none focus-visible:ring-4 focus-visible:ring-sky/50"
                        >
                          <LightbulbIcon className="size-5" aria-hidden="true" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent side="bottom" className="max-w-xs">
                        <p className="text-sm font-black text-sun-ink">Gợi ý</p>
                        <p className="mt-1 text-base font-semibold text-ink">{sentence.hintVi}</p>
                      </PopoverContent>
                    </Popover>
                  )}

                  <AudioRecord
                    onStopPropagation={(e) => e.stopPropagation()}
                    resetTrigger={sentence.id}
                    targetText={sentence.text}
                    onAssessmentComplete={handleAssessmentComplete(sentence.id)}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
