import Link from "next/link";

interface LearnCards {
  title: string;
  description: string;
  href: string;
}

export const LearnCard = ({ title, description, href }: LearnCards) => {
  return (
    <Link href={href}>
      <div className="p-4 rounded-xl border-2 shadow-sm hover:bg-muted/50 transition-all cursor-pointer mb-4">
        <p className="text-lg font-bold mb-1">{title}</p>
        <p className="text-md text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
};
