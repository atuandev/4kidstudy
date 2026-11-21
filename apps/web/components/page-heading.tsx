import { cn } from "@/lib/utils";

interface PageHeadingProps {
  readonly title: React.ReactNode;
  readonly echo: string;
  readonly description?: string;
  readonly action?: React.ReactNode;
  readonly id?: string;
  readonly className?: string;
}

export function PageHeading({ title, echo, description, action, id, className }: PageHeadingProps) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        <h1 id={id} className="text-3xl font-black tracking-[-0.02em] text-ink sm:text-4xl">
          {title}
        </h1>
        <p className="mt-1 text-lg font-extrabold text-sky-ink">{echo}</p>
        {description ? <p className="mt-1 text-base text-ink-body">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
