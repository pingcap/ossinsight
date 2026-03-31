import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-20 w-full rounded-md border border-white/10 bg-[rgba(41,40,53,0.96)] px-3.5 py-3 text-sm text-[#e9eaee] shadow-[0_12px_30px_-22px_rgba(0,0,0,0.9)] transition-[border-color,box-shadow,background-color,color] outline-none placeholder:text-[#87879a] focus-visible:border-white/45 focus-visible:bg-[rgba(45,44,58,0.98)] focus-visible:ring-2 focus-visible:ring-white/16 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
