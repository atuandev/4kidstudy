import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Badges are not pressable, so they never wear a ledge: a tinted pill with deep text.
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border-2 border-transparent px-2.5 py-0.5 text-xs font-black w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:ring-sky/50 focus-visible:ring-4 transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-leaf-wash text-forest",
        secondary: "bg-wash text-ink-body",
        destructive: "bg-cherry-wash text-cherry-deep",
        outline: "border-edge bg-white text-ink-body",
        warning: "bg-sun-wash text-sun-ink",
        danger: "bg-cherry-wash text-cherry-deep",
        purple: "bg-[#F3E8FF] text-[#7E22CE]",
        sky: "bg-sky-wash text-sky-ink",
        yellow: "bg-sun-wash text-sun-ink",
        orange: "bg-[#FFEDD5] text-[#C2410C]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
