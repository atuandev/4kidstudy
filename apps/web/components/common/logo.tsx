import Image from "next/image";

export const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <Image src="/mascot.svg" alt="Logo" width={40} height={40} />
      <span className="text-2xl font-bold">4KisStudy</span>
    </div>
  );
};