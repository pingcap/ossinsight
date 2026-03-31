import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          "flex h-10 w-full min-w-0 rounded-md border border-white/10 bg-[var(--background-color-control)] px-3.5 py-2 text-sm text-[#e9eaee] shadow-[0_10px_24px_-18px_rgba(0,0,0,0.88)] transition-[border-color,box-shadow,background-color,color] outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#e9eaee] placeholder:text-[#87879a] focus-visible:border-[#888] focus-visible:bg-[var(--background-color-control)] focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input }
