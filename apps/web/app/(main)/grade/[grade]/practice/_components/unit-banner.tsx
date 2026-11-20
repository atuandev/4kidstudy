import { Topic } from "@/types";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";

type UnitBannerProps = {
  topic: Topic;
  isExpanded: boolean;
  onClick: () => void;
};

export const UnitBanner = ({ topic, isExpanded, onClick }: UnitBannerProps) => {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl bg-green-500 px-4 py-2 text-white hover:bg-green-600 transition-colors cursor-pointer"
    >
      <div className="space-y-2 text-left">
        <h3 className="text-2xl font-bold">{topic.title}</h3>
        <p className="text-lg">{topic.description}</p>
      </div>
      <div className="flex items-center gap-3">
        <Image
          src={topic.coverImage || ""}
          alt={topic.title}
          width={100}
          height={100}
          className="rounded-lg object-cover h-20 border-4 border-green-600"
        />
        {isExpanded ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
      </div>
    </button>
  );
};
