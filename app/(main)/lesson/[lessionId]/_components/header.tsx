import { X } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";

type HeaderProps = {
  percentage: number;
};

export const Header = ({ percentage }: HeaderProps) => {
  const router = useRouter();

  return (
    <header className="mx-auto flex w-full max-w-[1140px] items-center justify-between gap-x-7 px-10 pt-[20px] lg:pt-[50px]">
      <X
        onClick={() => router.push("/practice")}
        className="cursor-pointer text-slate-500 transition hover:opacity-75"
      />

      <Progress value={percentage} />
    </header>
  );
};
