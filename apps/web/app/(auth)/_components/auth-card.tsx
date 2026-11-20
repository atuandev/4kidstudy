import Image from "next/image";

interface AuthCardProps {
  readonly title: string;
  /** English echo under the Vietnamese title, as on every learner page. */
  readonly echo: string;
  readonly description?: React.ReactNode;
  readonly footer?: React.ReactNode;
  readonly children: React.ReactNode;
}

/** The white sticker sheet every auth form sits on, with the mascot peeking over its top edge. */
export function AuthCard({ title, echo, description, footer, children }: AuthCardProps) {
  return (
    <section className="relative w-full max-w-[440px] rounded-sheet bg-white px-5 pb-7 pt-12 shadow-sheet-lime sm:px-8">
      <Image
        src="/mascot.svg"
        alt=""
        width={72}
        height={72}
        priority
        className="absolute -top-9 left-1/2 -translate-x-1/2 -rotate-6 motion-safe:animate-[sticker-land_600ms_var(--ease-peel)_backwards]"
      />
      <h1 className="text-center text-3xl font-black text-ink">{title}</h1>
      <p className="text-center text-base font-extrabold text-sky-ink">{echo}</p>
      {description ? (
        <p className="mt-2 text-center text-base text-ink-body">{description}</p>
      ) : null}
      <div className="mt-6">{children}</div>
      {footer ? (
        <p className="mt-6 border-t-2 border-wash pt-5 text-center text-base text-ink-body">
          {footer}
        </p>
      ) : null}
    </section>
  );
}
