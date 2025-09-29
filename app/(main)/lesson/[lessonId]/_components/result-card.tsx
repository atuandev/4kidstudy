import { InfinityIcon, Clock, Target, Trophy, SkipForward } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils";

type ResultCardProps = {
  value: number;
  variant: "points" | "hearts" | "duration" | "accuracy" | "correct" | "skipped";
};

export const ResultCard = ({ value, variant }: ResultCardProps) => {
  const getVariantConfig = () => {
    switch (variant) {
      case "points":
        return {
          imageSrc: "/points.svg",
          title: "Tổng điểm",
          borderColor: "border-orange-400",
          bgColor: "bg-orange-400",
          textColor: "text-orange-400",
          icon: null,
          suffix: "",
        };
      case "duration":
        return {
          imageSrc: null,
          title: "Thời gian",
          borderColor: "border-blue-400",
          bgColor: "bg-blue-400",
          textColor: "text-blue-400",
          icon: Clock,
          suffix: "s",
        };
      case "accuracy":
        return {
          imageSrc: null,
          title: "Độ chính xác",
          borderColor: "border-green-400",
          bgColor: "bg-green-400",
          textColor: "text-green-400",
          icon: Target,
          suffix: "%",
        };
      case "correct":
        return {
          imageSrc: null,
          title: "Số câu đúng",
          borderColor: "border-yellow-400",
          bgColor: "bg-yellow-400",
          textColor: "text-yellow-400",
          icon: Trophy,
          suffix: "",
        };
      case "skipped":
        return {
          imageSrc: null,
          title: "Bỏ qua",
          borderColor: "border-gray-400",
          bgColor: "bg-gray-400",
          textColor: "text-gray-400",
          icon: SkipForward,
          suffix: "",
        };
      default:
        return {
          imageSrc: "/points.svg",
          title: "Tổng điểm",
          borderColor: "border-orange-400",
          bgColor: "bg-orange-400",
          textColor: "text-orange-400",
          icon: null,
          suffix: "",
        };
    }
  };

  const config = getVariantConfig();
  const IconComponent = config.icon;

  return (
    <div
      className={cn(
        "w-full rounded-2xl border-2",
        config.borderColor,
        config.bgColor
      )}
    >
      <div
        className={cn(
          "rounded-t-xl p-1.5 text-center text-xs font-bold uppercase text-white",
          config.bgColor
        )}
      >
        {config.title}
      </div>

      <div
        className={cn(
          "flex items-center justify-center rounded-2xl bg-white p-6 text-lg font-bold",
          config.textColor
        )}
      >
        {config.imageSrc && (
          <Image
            src={config.imageSrc}
            alt={variant}
            height={30}
            width={30}
            className="mr-1.5"
          />
        )}
        {IconComponent && (
          <IconComponent className="mr-1.5 h-6 w-6" />
        )}
        {value === Infinity ? (
          <InfinityIcon className="h-6 w-6 stroke-[3]" />
        ) : (
          <>
            {value}
            {config.suffix && <span className="text-sm ml-0.5">{config.suffix}</span>}
          </>
        )}
      </div>
    </div>
  );
};
