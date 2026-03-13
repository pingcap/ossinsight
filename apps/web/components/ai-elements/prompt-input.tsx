"use client";

import type { ComponentProps, FormEvent, HTMLAttributes, ReactNode } from "react";
import { useCallback } from "react";
import { CornerDownLeftIcon, SquareIcon, XIcon } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

export interface PromptInputMessage {
  text: string;
}

export type PromptInputStatus =
  | "ready"
  | "submitted"
  | "streaming"
  | "error";

export type PromptInputProps = Omit<ComponentProps<"form">, "onSubmit"> & {
  onSubmit?: (message: PromptInputMessage) => void;
};

export const PromptInput = ({
  className,
  onSubmit,
  children,
  ...props
}: PromptInputProps) => {
  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const textarea = event.currentTarget.querySelector("textarea");
      onSubmit?.({ text: textarea?.value ?? "" });
    },
    [onSubmit],
  );

  return (
    <form className={cn("w-full", className)} onSubmit={handleSubmit} {...props}>
      {children}
    </form>
  );
};

export type PromptInputBodyProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputBody = ({
  className,
  ...props
}: PromptInputBodyProps) => (
  <InputGroup
    className={cn(
      "h-auto rounded-[28px] border border-[#3a4146] bg-[#14191b] shadow-[0_26px_70px_-36px_rgba(0,0,0,0.85)]",
      className,
    )}
    {...props}
  />
);

export type PromptInputTextareaProps = ComponentProps<typeof InputGroupTextarea>;

export const PromptInputTextarea = ({
  className,
  ...props
}: PromptInputTextareaProps) => (
  <InputGroupTextarea
    className={cn(
      "min-h-[120px] px-5 py-4 text-[16px] leading-7 text-[#edf6f7] placeholder:text-[#7c8a90]",
      className,
    )}
    {...props}
  />
);

export type PromptInputFooterProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputFooter = ({
  className,
  ...props
}: PromptInputFooterProps) => (
  <div
    className={cn(
      "flex items-center justify-between gap-3 border-t border-white/6 px-4 py-3",
      className,
    )}
    {...props}
  />
);

export type PromptInputToolsProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputTools = ({
  className,
  ...props
}: PromptInputToolsProps) => (
  <div className={cn("flex min-w-0 items-center gap-2", className)} {...props} />
);

export type PromptInputButtonProps = ComponentProps<typeof InputGroupButton> & {
  tooltip?: ReactNode;
};

export const PromptInputButton = ({
  className,
  size,
  variant = "ghost",
  ...props
}: PromptInputButtonProps) => {
  const resolvedSize =
    size ?? (Array.isArray(props.children) ? "sm" : "icon-sm");

  return (
    <InputGroupButton
      className={cn("text-[#9fb3b8] hover:text-[#edf6f7]", className)}
      size={resolvedSize}
      type="button"
      variant={variant}
      {...props}
    />
  );
};

export type PromptInputHintProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputHint = ({
  className,
  ...props
}: PromptInputHintProps) => (
  <div className={cn("text-[12px] text-[#7c8a90]", className)} {...props} />
);

export type PromptInputSubmitProps = ComponentProps<typeof InputGroupButton> & {
  status?: PromptInputStatus;
  onStop?: () => void;
};

export const PromptInputSubmit = ({
  className,
  status = "ready",
  variant = "default",
  size = "icon-sm",
  onStop,
  onClick,
  children,
  ...props
}: PromptInputSubmitProps) => {
  const isGenerating = status === "submitted" || status === "streaming";

  let icon = <CornerDownLeftIcon className="size-4" />;
  if (status === "streaming") {
    icon = <SquareIcon className="size-4" />;
  } else if (status === "error") {
    icon = <XIcon className="size-4" />;
  }

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isGenerating && onStop) {
        event.preventDefault();
        onStop();
        return;
      }

      onClick?.(event);
    },
    [isGenerating, onClick, onStop],
  );

  return (
    <InputGroupAddon align="inline-end" className="pl-0 pr-0">
      <InputGroupButton
        aria-label={isGenerating ? "Stop" : "Submit"}
        className={cn(
          "bg-[#8cf0dc] text-[#042b26] hover:bg-[#9af6e4]",
          className,
        )}
        onClick={handleClick}
        size={size}
        type={isGenerating && onStop ? "button" : "submit"}
        variant={variant}
        {...props}
      >
        {children ?? icon}
      </InputGroupButton>
    </InputGroupAddon>
  );
};
