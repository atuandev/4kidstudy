import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full min-w-0 rounded-xl border-2 border-edge bg-white px-3.5 py-1 text-base font-bold text-ink transition-[color,border-color,box-shadow] outline-none placeholder:font-normal placeholder:text-ink-meta file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-bold file:text-ink disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-wash disabled:opacity-60",
        "hover:border-[#CBD5E1] focus-visible:border-sky focus-visible:ring-4 focus-visible:ring-sky/25",
        "aria-invalid:border-cherry-deep aria-invalid:ring-4 aria-invalid:ring-cherry/15",
        className
      )}
      {...props}
    />
  )
}

export { Input }
