import { useCallback } from "react";
import { Volume2 } from "lucide-react";
import { useAudio } from "react-use";
import { Button } from "@/components/ui/button";

type AudioPlayerProps = {
  audioUrl: string;
  variant?: "full" | "button";
  className?: string;
};

export default function AudioPlayer({ 
  audioUrl, 
  variant = "full", 
  className = "" 
}: AudioPlayerProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [audio, _, controls] = useAudio({ src: audioUrl });

  const handlePlay = useCallback(() => {
    void controls.play();
  }, [controls]);

  if (variant === "button") {
    return (
      <div className={className}>
        {audio}
        <Button
          onClick={handlePlay}
          variant="primaryOutline"
          size="icon"
          className="h-12 w-12 rounded-full border-2 border-blue-300 hover:bg-blue-50"
        >
          <Volume2 className="h-6 w-6 text-blue-600" />
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      {audio}
      <audio
        key={audioUrl}
        controls
        className="w-full"
        preload="metadata"
        autoPlay
      >
        <source src={audioUrl} type="audio/mpeg" />
        Trình duyệt của bạn không hỗ trợ phần tử âm thanh.
      </audio>
    </div>
  );
}
