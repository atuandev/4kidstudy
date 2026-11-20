import { Topic } from "@/types";
import Image from "next/image";
import { CaretDownIcon } from "@/components/icons";

import { cn } from "@/lib/utils";

type UnitBannerProps = {
  topic: Topic;
  lessonCount: number;
  isExpanded: boolean;
  /** Id of the lesson list this banner opens. */
  controls: string;
  onClick: () => void;
};

/** The topic row: cover sticker, title, lesson count; opens the lesson list. */
export const UnitBanner = ({
  topic,
  lessonCount,
  isExpanded,
  controls,
  onClick,
}: UnitBannerProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={isExpanded}
      aria-controls={controls}
      className="group flex w-full items-center gap-4 p-4 text-left outline-none transition-colors hover:bg-lime/50 focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-sky/50 sm:p-5"
    >
      <span
        className={cn(
          "relative size-16 shrink-0 overflow-hidden rounded-[18px] border-4 border-white bg-wash shadow-sticker sm:size-20",
          topic.id % 2 === 0 ? "rotate-2" : "-rotate-2",
        )}
      >
        {topic.coverImage ? (
          <Image src={topic.coverImage} alt="" fill sizes="80px" className="object-cover" />
        ) : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xl font-black leading-tight text-ink sm:text-2xl">
          {topic.title}
        </span>
        {topic.description ? (
          <span className="mt-0.5 block text-base text-ink-body">{topic.description}</span>
        ) : null}
        <span className="mt-1.5 inline-flex rounded-full bg-leaf-wash px-2.5 py-0.5 text-sm font-extrabold text-forest">
          {lessonCount} bài luyện tập
        </span>
      </span>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-wash text-ink-body transition-colors group-hover:bg-sky-wash group-hover:text-sky-ink">
        <CaretDownIcon
          aria-hidden="true"
          className={cn(
            "size-5 transition-transform duration-200 ease-peel",
            isExpanded && "rotate-180",
          )}
        />
      </span>
    </button>
  );
};
