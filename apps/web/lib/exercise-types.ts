import {
  HeadphonesIcon,
  ImageIcon,
  ListChecksIcon,
  MicrophoneIcon,
  PuzzlePieceIcon,
} from "@/components/icons";
import type { ExerciseType } from "@/types";

type IconComponent = React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;

export const EXERCISE_TYPES: Record<
  ExerciseType,
  { vi: string; en: string; icon: IconComponent; tile: string }
> = {
  SELECT_IMAGE: {
    vi: "Chọn hình đúng",
    en: "Select the picture",
    icon: ImageIcon,
    tile: "bg-sky-wash text-sky-ink",
  },
  MULTIPLE_CHOICE: {
    vi: "Chọn đáp án đúng",
    en: "Multiple choice",
    icon: ListChecksIcon,
    tile: "bg-grape-wash text-grape-ink",
  },
  MATCHING: {
    vi: "Ghép cặp",
    en: "Matching",
    icon: PuzzlePieceIcon,
    tile: "bg-tangerine/15 text-[#C2410C]",
  },
  LISTENING: {
    vi: "Nghe và chọn",
    en: "Listening",
    icon: HeadphonesIcon,
    tile: "bg-lagoon/15 text-[#0F766E]",
  },
  PRONUNCIATION: {
    vi: "Luyện phát âm",
    en: "Pronunciation",
    icon: MicrophoneIcon,
    tile: "bg-cherry-wash text-cherry-deep",
  },
};
