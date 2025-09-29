import { Topic } from "@/types";
import Image from "next/image";

type UnitBannerProps = {
  topic: Topic;
};

export const UnitBanner = ({ topic }: UnitBannerProps) => {
  return (
    <div className="flex w-full items-center justify-between rounded-xl bg-green-500 p-5 text-white">
      <div className="space-y-2.5">
        <h3 className="text-2xl font-bold">{topic.title}</h3>
        <p className="text-lg">{topic.description}</p>
      </div>
      <div className="flex items-center gap-2">
        <Image
          src={topic.coverImage || ""}
          alt={topic.title}
          width={100}
          height={100}
          className="rounded-lg object-cover h-20"
        />
      </div>
    </div>
  );
};
