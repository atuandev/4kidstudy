"use client";

import { useState } from "react";
import Link from "next/link";
import { SpeakerHighIcon } from "@/components/icons";

import { cn } from "@/lib/utils";
import { WordArt } from "./word-art";

interface SampleWord {
  readonly word: string;
  readonly phonetic: string;
  readonly meaning: string;
  readonly example: string;
  /** Sticker field colour. */
  readonly color: string;
  /** Resting tilt in degrees, so the sheet looks hand-placed. */
  readonly tilt: number;
}

const WORDS: readonly SampleWord[] = [
  {
    word: "apple",
    phonetic: "/ˈæp.əl/",
    meaning: "quả táo",
    example: "I eat an apple.",
    color: "#1CB0F6",
    tilt: -2,
  },
  {
    word: "banana",
    phonetic: "/bəˈnæn.ə/",
    meaning: "quả chuối",
    example: "The banana is yellow.",
    color: "#A855F7",
    tilt: 1.5,
  },
  {
    word: "fish",
    phonetic: "/fɪʃ/",
    meaning: "con cá",
    example: "The fish can swim.",
    color: "#FFC800",
    tilt: -1,
  },
  {
    word: "cat",
    phonetic: "/kæt/",
    meaning: "con mèo",
    example: "The cat is on the bed.",
    color: "#22C55E",
    tilt: 2,
  },
  {
    word: "sun",
    phonetic: "/sʌn/",
    meaning: "mặt trời",
    example: "The sun is hot.",
    color: "#14B8A6",
    tilt: 1,
  },
  {
    word: "ball",
    phonetic: "/bɔːl/",
    meaning: "quả bóng",
    example: "I have a red ball.",
    color: "#F472B6",
    tilt: -2.5,
  },
  {
    word: "book",
    phonetic: "/bʊk/",
    meaning: "quyển sách",
    example: "Open your book, please.",
    color: "#FF9600",
    tilt: 2,
  },
  {
    word: "pencil",
    phonetic: "/ˈpen.səl/",
    meaning: "bút chì",
    example: "This is my pencil.",
    color: "#FF4B4B",
    tilt: -1.5,
  },
];

/** The sticker that starts peeled up, showing its Vietnamese side. */
const PEELED = "cat";

/** Tilt of a peeled-up sticker, in degrees. */
const PEEL_TILT = -7;

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.8;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export function StickerSheet() {
  const [flipped, setFlipped] = useState<ReadonlySet<string>>(() => new Set([PEELED]));

  const toggle = (word: string) => {
    // Every tap says the word, so the play button on a flipped sticker always plays.
    speak(word);
    const next = new Set(flipped);
    if (next.has(word)) {
      next.delete(word);
    } else {
      next.add(word);
    }
    setFlipped(next);
  };

  return (
    <div className="relative flex h-full flex-col rounded-t-[32px] bg-white px-4 pb-6 pt-6 shadow-[0_-24px_60px_-30px_rgba(21,128,61,0.45)] sm:rounded-t-[40px] sm:px-8 sm:pb-10 sm:pt-8">
      <p className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-1">
        <span className="text-base font-extrabold text-ink">Chạm vào hình để nghe</span>
        <span className="text-sm font-bold text-slate-500">Sample words · tap to hear</span>
      </p>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5 lg:flex-1 lg:content-evenly lg:gap-x-5">
        {WORDS.map((item) => (
          <li key={item.word}>
            <Sticker
              item={item}
              isFlipped={flipped.has(item.word)}
              isPeeled={item.word === PEELED}
              onToggle={() => toggle(item.word)}
            />
          </li>
        ))}
      </ul>
      <FlipTray count={flipped.size} total={WORDS.length} />
    </div>
  );
}

/** Counts flipped stickers; once all are flipped it offers sign-up. */
function FlipTray({ count, total }: { readonly count: number; readonly total: number }) {
  const done = count === total;
  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-6 lg:mt-4 gap-y-4 rounded-3xl bg-wash px-5 py-3 sm:py-4">
      <div className="min-w-48 flex-1">
        <p aria-live="polite" className="text-base font-extrabold text-ink">
          {done ? "Giỏi lắm! Bé đã lật hết thẻ." : `Đã lật ${count}/${total} thẻ`}
          <span className="ml-2 text-sm font-bold text-slate-500">
            {done ? "Well done!" : `Flip all ${total}`}
          </span>
        </p>
        <div className="mt-2 h-3 rounded-full bg-white" aria-hidden="true">
          <div
            className="h-full rounded-full bg-leaf transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
            style={{ width: `${(count / total) * 100}%` }}
          />
        </div>
      </div>
      {done ? (
        <Link
          href="/register"
          className="inline-flex h-11 items-center rounded-2xl border-b-4 border-forest bg-leaf-deep px-5 text-sm font-black uppercase text-white outline-none hover:bg-forest focus-visible:ring-4 focus-visible:ring-sky/50"
        >
          Học tiếp từ mới
        </Link>
      ) : null}
    </div>
  );
}

interface StickerProps {
  readonly item: SampleWord;
  readonly isFlipped: boolean;
  readonly isPeeled: boolean;
  readonly onToggle: () => void;
}

function Sticker({ item, isFlipped, isPeeled, onToggle }: StickerProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isFlipped}
      style={{ "--tilt": `${isFlipped ? PEEL_TILT : item.tilt}deg` } as React.CSSProperties}
      className={cn(
        "@container perspective-1000 group block aspect-[4/5] w-full cursor-pointer rounded-[26px] outline-none",
        "relative rotate-(--tilt) transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
        "focus-visible:ring-4 focus-visible:ring-sky/50 focus-visible:ring-offset-4",
        isFlipped && "z-10 -translate-y-2.5 scale-[1.06]",
        isPeeled &&
          "motion-safe:animate-[sticker-peel_900ms_cubic-bezier(0.16,1,0.3,1)_400ms_backwards]",
      )}
    >
      <span
        className={cn(
          "preserve-3d relative block size-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
          isFlipped && "rotate-y-180",
        )}
      >
        {/* Front: the coloured sticker */}
        <span
          aria-hidden={isFlipped}
          className="backface-hidden absolute inset-0 flex flex-col items-center justify-between rounded-[26px] border-[6px] border-white p-3 shadow-[0_0_0_2px_#E2E8F0,0_10px_18px_-8px_rgba(61,70,93,0.35)] transition-shadow group-hover:shadow-[0_0_0_2px_#E2E8F0,0_16px_24px_-10px_rgba(61,70,93,0.45)]"
          style={{ backgroundColor: item.color }}
        >
          <span className="mt-1 flex aspect-square w-[72%] items-center justify-center rounded-full bg-white/90">
            <WordArt word={item.word} className="w-[70%]" />
          </span>
          <span className="flex flex-col items-center max-w-full rounded-2xl bg-white px-2.5 py-1 leading-tight">
            <span className="text-lg font-black text-ink sm:text-xl">{item.word}</span>
            <span className="whitespace-nowrap text-sm font-bold text-slate-600 @[10rem]:text-[15px]">
              {item.meaning}
            </span>
          </span>
        </span>

        {/* Back: the Vietnamese side */}
        <span
          aria-hidden={!isFlipped}
          className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col items-start rounded-[26px] border-[6px] border-white bg-white p-4 text-left shadow-[0_0_0_2px_#E2E8F0,0_34px_40px_-14px_rgba(61,70,93,0.55)]"
        >
          <span className="text-xl font-black text-ink @[10rem]:text-3xl">{item.word}</span>
          <span className="text-sm font-bold text-slate-500">{item.phonetic}</span>
          <span className="mt-1.5 text-base font-black leading-tight text-forest @[10rem]:text-xl">
            {item.meaning}
          </span>
          <span className="mt-1.5 hidden text-sm font-semibold leading-snug text-slate-600 @[11rem]:block">
            {item.example}
          </span>
          <span className="mt-auto flex size-10 items-center justify-center rounded-full bg-sky text-white shadow-[0_4px_0_#0284C7]">
            <SpeakerHighIcon className="size-5" aria-hidden="true" />
          </span>
        </span>
      </span>
      <span className="sr-only">
        {isFlipped ? "Chạm để nghe lại và lật thẻ." : "Chạm để nghe và xem nghĩa."}
      </span>
    </button>
  );
}
