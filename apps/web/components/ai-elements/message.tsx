"use client";

import type { ComponentProps, HTMLAttributes, ReactNode } from "react";
import { memo } from "react";
import type { UIMessage } from "ai";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type MessageProps = HTMLAttributes<HTMLDivElement> & {
  from: UIMessage["role"];
};

export const Message = ({ className, from, ...props }: MessageProps) => (
  <div
    data-from={from}
    className={cn(
      "group flex w-full max-w-[95%] flex-col gap-3",
      from === "user" ? "ml-auto justify-end" : "justify-start",
      className,
    )}
    {...props}
  />
);

export type MessageContentProps = HTMLAttributes<HTMLDivElement>;

export const MessageContent = ({
  children,
  className,
  ...props
}: MessageContentProps) => (
  <div
    className={cn(
      "flex min-w-0 max-w-full flex-col gap-3 overflow-hidden text-sm",
      "group-data-[from=user]:ml-auto group-data-[from=user]:rounded-[24px] group-data-[from=user]:bg-[#202427] group-data-[from=user]:px-5 group-data-[from=user]:py-4 group-data-[from=user]:text-[#eef4f7]",
      "text-[#d5dee2]",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export type MessageResponseProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export const MessageResponse = memo(
  ({ className, children, ...props }: MessageResponseProps) => (
    <div
      className={cn(
        "size-full whitespace-pre-wrap leading-7 text-[15px] [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);

MessageResponse.displayName = "MessageResponse";

export type MessageActionsProps = ComponentProps<"div">;

export const MessageActions = ({
  className,
  children,
  ...props
}: MessageActionsProps) => (
  <div className={cn("flex items-center gap-1", className)} {...props}>
    {children}
  </div>
);

export type MessageActionProps = ComponentProps<typeof Button> & {
  label?: string;
};

export const MessageAction = ({
  children,
  label,
  variant = "ghost",
  size = "icon-sm",
  ...props
}: MessageActionProps) => (
  <Button size={size} type="button" variant={variant} {...props}>
    {children}
    <span className="sr-only">{label}</span>
  </Button>
);

export type MessageToolbarProps = ComponentProps<"div">;

export const MessageToolbar = ({
  className,
  children,
  ...props
}: MessageToolbarProps) => (
  <div
    className={cn("mt-4 flex w-full items-center justify-between gap-4", className)}
    {...props}
  >
    {children}
  </div>
);
