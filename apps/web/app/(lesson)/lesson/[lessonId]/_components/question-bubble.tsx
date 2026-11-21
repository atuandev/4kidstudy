import Image from "next/image";

type QuestionBubbleProps = {
  question: string;
};

export const QuestionBubble = ({ question }: QuestionBubbleProps) => {
  return (
    <div className="flex items-end gap-3 sm:gap-4">
      <Image
        src="/mascot.svg"
        alt=""
        height={72}
        width={72}
        className="size-14 shrink-0 sm:size-[72px]"
      />

      {question && (
        <div className="relative mb-1 rounded-[22px] border-2 border-edge bg-white px-5 py-3.5 text-lg font-extrabold leading-snug text-ink shadow-[0_10px_18px_-10px_rgb(61_70_93/0.35)] sm:text-2xl">
          {question}
          <span
            className="absolute -left-[9px] bottom-4 size-4 rotate-45 border-b-2 border-l-2 border-edge bg-white"
            aria-hidden
          />
        </div>
      )}
    </div>
  );
};
