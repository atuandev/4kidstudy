import { cn } from "@/lib/utils";

type DifficultyProps = {
  difficulty?: number;
};

export const Difficulty = ({ difficulty }: DifficultyProps) => {
  return (
    <div
      className={cn(`w-fit px-2 py-1 rounded-lg mb-2`, {
        "bg-green-100": difficulty === 1,
        "bg-yellow-100": difficulty === 2,
        "bg-red-100": difficulty === 3,
      })}
    >
      {difficulty === 1 && <span className="text-green-600 font-bold">Dễ</span>}
      {difficulty === 2 && (
        <span className="text-yellow-600 font-bold">Trung bình</span>
      )}
      {difficulty === 3 && <span className="text-red-600 font-bold">Khó</span>}
    </div>
  );
};
