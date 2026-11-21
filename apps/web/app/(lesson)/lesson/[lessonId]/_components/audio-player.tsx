import { useCallback } from "react";
import { SpeakerHighIcon } from "@/components/icons";
import { useAudio } from "react-use";

import { cn } from "@/lib/utils";

type AudioPlayerProps = {
  audioUrl: string;
  variant?: "full" | "button";
  className?: string;
};

export default function AudioPlayer({
  audioUrl,
  variant = "full",
  className = "",
}: AudioPlayerProps) {
  const [audio, _, controls] = useAudio({ src: audioUrl, autoPlay: variant === "full" });

  const handlePlay = useCallback(() => {
    void controls.play();
  }, [controls]);

  const isFull = variant === "full";

  return (
    <div className={cn(isFull && "flex items-center gap-4", className)}>
      {audio}
      <button
        type="button"
        onClick={handlePlay}
        aria-label="Nghe lại"
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full bg-sky text-white outline-none transition-[translate,box-shadow] duration-150",
          "shadow-[0_4px_0_#0284C7] hover:brightness-105 active:translate-y-1 active:shadow-[0_0_0_#0284C7]",
          "focus-visible:ring-4 focus-visible:ring-sky/50",
          isFull ? "size-20 [&_svg]:size-9" : "size-14 [&_svg]:size-7",
        )}
      >
        <SpeakerHighIcon aria-hidden="true" />
      </button>
      {isFull ? (
        <p className="text-left">
          <span className="block text-lg font-black text-ink">Bấm để nghe lại</span>
          <span className="block text-base font-extrabold text-sky-ink">Tap to listen again.</span>
        </p>
      ) : null}
    </div>
  );
}
