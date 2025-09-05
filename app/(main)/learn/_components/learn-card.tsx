import Link from "next/link";

export const LearnCard = () => {
  return (
    <Link href="/learn/flashcards">
      <div className="p-4 rounded-xl border-2 shadow-sm hover:bg-muted/50 transition-all cursor-pointer">
        <p className="text-lg font-bold mb-1">Flashcards</p>
        <p className="text-md text-muted-foreground">
          Ôn tập từ vựng một cách hiệu quả với flashcards.
        </p>
      </div>
    </Link>
  );
};
