"use client";

import type { ComponentProps, HTMLAttributes } from "react";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CodeBlockContextType = {
  code: string;
};

const CodeBlockContext = createContext<CodeBlockContextType>({ code: "" });

export type CodeBlockProps = HTMLAttributes<HTMLDivElement> & {
  code: string;
  language?: string;
};

export const CodeBlockContainer = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "group relative w-full overflow-hidden rounded-md border border-white/8 bg-[#121517] text-foreground",
      className,
    )}
    {...props}
  />
);

export const CodeBlockHeader = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex items-center justify-between border-b border-white/8 bg-white/[0.03] px-4 py-3 text-[12px] text-[#8ca0a6]",
      className,
    )}
    {...props}
  />
);

export const CodeBlockTitle = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex items-center gap-2", className)} {...props} />
);

export const CodeBlockFilename = ({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("font-mono", className)} {...props} />
);

export const CodeBlockActions = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex items-center gap-2", className)} {...props} />
);

export const CodeBlock = ({
  code,
  language = "sql",
  className,
  children,
  ...props
}: CodeBlockProps) => {
  const contextValue = useMemo(() => ({ code }), [code]);

  return (
    <CodeBlockContext.Provider value={contextValue}>
      <CodeBlockContainer className={className} data-language={language} {...props}>
        {children}
        <div className="overflow-auto">
          <pre className="m-0 p-4 text-[13px] leading-6 text-[#edf6f7]">
            <code className="font-mono">{code}</code>
          </pre>
        </div>
      </CodeBlockContainer>
    </CodeBlockContext.Provider>
  );
};

export type CodeBlockCopyButtonProps = ComponentProps<typeof Button> & {
  timeout?: number;
};

export const CodeBlockCopyButton = ({
  className,
  timeout = 2000,
  children,
  ...props
}: CodeBlockCopyButtonProps) => {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number>(0);
  const { code } = useContext(CodeBlockContext);

  const handleCopy = useCallback(async () => {
    if (!navigator?.clipboard?.writeText) {
      return;
    }

    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setCopied(false), timeout);
  }, [code, timeout]);

  return (
    <Button
      className={cn("shrink-0", className)}
      onClick={handleCopy}
      size="icon-sm"
      type="button"
      variant="ghost"
      {...props}
    >
      {children ?? (copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />)}
    </Button>
  );
};
