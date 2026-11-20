import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// Every pressable control stands on a darker ledge (border-b-4) that collapses on press
// while the face moves down, so the bottom edge stays put. See DESIGN.md, "Buttons".
const ledge =
  "border-2 border-b-4 active:translate-y-0.5 active:border-b-2 disabled:border-b-4 disabled:translate-y-0";
// Filled faces carry the ledge alone (no side edge), as on the homepage.
const fillLedge =
  "border-b-4 active:translate-y-0.5 active:border-b-2 disabled:border-b-4 disabled:translate-y-0";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-bold transition-[background-color,border-color,color,translate,filter] duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-sky/50 focus-visible:ring-4 aria-invalid:ring-destructive/20 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        // Plain: white face on a slate edge.
        default: `${ledge} border-edge bg-white text-ink hover:bg-wash`,
        outline: `${ledge} border-edge bg-white text-ink hover:bg-wash`,

        locked: `${ledge} border-edge bg-wash text-ink-meta`,
        // Sky: listen, open, look closer.
        primary: `${fillLedge} border-sky-ink bg-sky-deep text-white hover:bg-sky-ink`,
        primaryOutline: `${ledge} border-edge bg-white text-sky-deep hover:border-sky hover:bg-sky-wash hover:text-sky-ink`,
        // Go: continue, start, submit. White text sits on Leaf Green Deep, never Leaf Green.
        secondary: `${fillLedge} border-forest bg-leaf-deep text-white hover:bg-forest`,
        secondaryOutline: `${ledge} border-edge bg-white text-forest hover:border-leaf hover:bg-leaf-wash`,
        // Red: wrong, remove.
        danger: `${fillLedge} border-cherry-deep bg-cherry text-white hover:brightness-95`,
        dangerOutline: `${ledge} border-edge bg-white text-cherry-deep hover:border-cherry hover:bg-cherry-wash`,
        // Yellow: reward.
        super: `${fillLedge} border-sun-deep bg-sun text-ink hover:brightness-105`,
        superOutline: `${ledge} border-edge bg-white text-sun-ink hover:border-sun hover:bg-sun-wash`,
        gray: `${fillLedge} border-[#262c3b] bg-ink text-white hover:bg-ink-body`,
        grayOutline: `${ledge} border-edge bg-white text-ink-meta hover:bg-wash`,

        ghost: "bg-transparent text-ink-meta border-0 hover:bg-wash hover:text-ink",
        sidebar:
          "bg-transparent text-ink-body border-2 border-transparent hover:bg-wash hover:text-ink transition-none",
        sidebarOutline:
          "bg-sky-wash text-sky-ink border-2 border-sky border-b-4 hover:bg-sky-wash transition-none",
        link: "bg-transparent text-sky-deep border-0 underline-offset-4 decoration-2 hover:underline hover:text-sky-ink transition-none",
      },
      size: {
        default: "h-11 px-4 py-2 has-[>svg]:px-3",
        sm: "h-9 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-12 rounded-md px-6 text-base has-[>svg]:px-4",
        icon: "size-10",
        rounded: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
    children?: React.ReactNode;
  }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(
        buttonVariants({ variant, size, className }),
        "flex items-center"
      )}
      disabled={loading}
      {...props}
    >
      {loading ? <Loader2 className={cn("h-4 w-4 animate-spin")} /> : children}
    </Comp>
  );
}

export { Button, buttonVariants };
