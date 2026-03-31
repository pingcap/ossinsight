import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-[13px] font-medium whitespace-nowrap text-[#e9eaee] shadow-[0_12px_30px_-18px_rgba(0,0,0,0.85)] transition-[background-color,border-color,color,box-shadow,transform] outline-none select-none focus-visible:border-white/45 focus-visible:ring-2 focus-visible:ring-white/18 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-white/55 bg-white text-[#1f1e28] shadow-[0_18px_35px_-24px_rgba(255,255,255,0.25)] hover:border-white hover:bg-white",
        outline:
          "border-white/10 bg-white/[0.03] text-[#d8dae3] hover:border-white/30 hover:bg-white/[0.06] hover:text-[#f6f7fb] aria-expanded:border-white/30 aria-expanded:bg-white/[0.06] aria-expanded:text-[#f6f7fb]",
        secondary:
          "border-transparent bg-[var(--background-color-control)] text-white shadow-[0_18px_38px_-28px_rgba(0,0,0,0.9)] hover:bg-[rgb(43,43,45)] aria-expanded:bg-[rgb(43,43,45)] aria-expanded:text-white",
        ghost:
          "border-transparent bg-transparent text-[#c8c8d1] shadow-none hover:bg-white/[0.05] hover:text-white aria-expanded:bg-white/[0.05] aria-expanded:text-white",
        destructive:
          "border-destructive/30 bg-destructive/12 text-[#ffb1ab] hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-9 gap-1.5 px-3.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-7 gap-1 rounded-lg px-2.5 text-[12px] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 text-[12px] in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 gap-2 px-4 text-sm has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-9",
        "icon-xs":
          "size-7 rounded-lg in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8 rounded-md in-data-[slot=button-group]:rounded-md",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
