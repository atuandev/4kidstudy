import { forwardRef } from "react";

import { cn } from "@/lib/utils";

type Tone = "sky" | "cherry" | "leaf" | "wash";
type Size = "md" | "lg";

const TONES: Record<Tone, string> = {
  sky: "bg-sky text-white shadow-[0_4px_0_#0284C7] active:shadow-[0_0_0_#0284C7]",
  cherry: "bg-cherry text-white shadow-[0_4px_0_#BE123C] active:shadow-[0_0_0_#BE123C]",
  leaf: "bg-leaf-deep text-white shadow-[0_4px_0_#15803D] active:shadow-[0_0_0_#15803D]",
  wash: "bg-wash text-ink-body shadow-[0_4px_0_#CBD5E1] active:shadow-[0_0_0_#CBD5E1]",
};

const SIZES: Record<Size, string> = {
  md: "size-11 [&_svg]:size-5",
  lg: "size-14 [&_svg]:size-7",
};

interface RoundButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly tone?: Tone;
  readonly size?: Size;
  readonly "aria-label": string;
}

export const RoundButton = forwardRef<HTMLButtonElement, RoundButtonProps>(function RoundButton(
  { tone = "sky", size = "md", className, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full outline-none",
        "transition-[translate,box-shadow,filter] duration-150 ease-peel hover:brightness-105 active:translate-y-1",
        "focus-visible:ring-4 focus-visible:ring-sky/50",
        "disabled:pointer-events-none disabled:opacity-50",
        TONES[tone],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
});
