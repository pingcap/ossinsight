"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

function ButtonGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="button-group"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  );
}

function ButtonGroupText({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[12px] text-[#8b90a3]",
        className,
      )}
      {...props}
    />
  );
}

export { ButtonGroup, ButtonGroupText };
