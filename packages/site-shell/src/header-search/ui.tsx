'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import { Dialog as DialogPrimitive } from 'radix-ui';
import * as RuiAvatar from '@radix-ui/react-avatar';
import { XIcon } from 'lucide-react';
import { cn } from './utils';

// --- Button ---

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-[13px] font-medium whitespace-nowrap text-[#e9eaee] shadow-[0_12px_30px_-18px_rgba(0,0,0,0.85)] transition-[background-color,border-color,color,box-shadow,transform] outline-none select-none focus-visible:border-[#ffe895]/45 focus-visible:ring-2 focus-visible:ring-[#ffe895]/18 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "border-[#ffe895]/55 bg-[#ffe895] text-[#1f1e28] shadow-[0_18px_35px_-24px_rgba(255,232,149,0.85)] hover:border-[#fff0b7] hover:bg-[#fff0b7]",
        outline: "border-white/10 bg-white/[0.03] text-[#d8dae3] hover:border-[#ffe895]/30 hover:bg-white/[0.06] hover:text-[#f6f7fb] aria-expanded:border-[#ffe895]/30 aria-expanded:bg-white/[0.06] aria-expanded:text-[#f6f7fb]",
        secondary: "border-transparent bg-[var(--background-color-control)] text-[#ffe895] shadow-[0_18px_38px_-28px_rgba(0,0,0,0.9)] hover:bg-[rgb(43,43,45)] aria-expanded:bg-[rgb(43,43,45)] aria-expanded:text-[#fff0b7]",
        ghost: "border-transparent bg-transparent text-[#c8c8d1] shadow-none hover:bg-white/[0.05] hover:text-[#fff2bd] aria-expanded:bg-white/[0.05] aria-expanded:text-[#fff2bd]",
        destructive: "border-destructive/30 bg-destructive/12 text-[#ffb1ab] hover:bg-destructive/20",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 gap-1.5 px-3.5",
        xs: "h-7 gap-1 rounded-lg px-2.5 text-[12px]",
        sm: "h-8 gap-1.5 rounded-md px-3 text-[12px]",
        lg: "h-10 gap-2 px-4 text-sm",
        icon: "size-9",
        "icon-sm": "size-8 rounded-md",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

// --- Input ---

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full min-w-0 rounded-md border border-white/10 bg-[var(--background-color-control)] px-3.5 py-2 text-sm text-[#e9eaee] shadow-[0_10px_24px_-18px_rgba(0,0,0,0.88)] transition-[border-color,box-shadow,background-color,color] outline-none placeholder:text-[#87879a] focus-visible:border-[#ffe895]/45 focus-visible:bg-[var(--background-color-control)] focus-visible:ring-2 focus-visible:ring-[#ffe895]/16 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

// --- Dialog ---

export function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-[rgba(10,12,18,0.56)] duration-100 supports-backdrop-filter:backdrop-blur-md data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className,
      )}
      {...props}
    />
  );
}

export function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & { showCloseButton?: boolean }) {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-md border border-white/10 bg-[#2f2f3a] p-5 text-sm text-[#e9eaee] shadow-[0_36px_100px_-52px_rgba(0,0,0,0.98)] ring-1 ring-black/10 duration-100 outline-none sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close data-slot="dialog-close" asChild>
            <Button
              variant="ghost"
              className="absolute top-3 right-3 text-[#b8bac6] hover:bg-white/[0.06] hover:text-[#fff0b7]"
              size="icon-sm"
            >
              <XIcon />
              <span className="sr-only">Close</span>
            </Button>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title data-slot="dialog-title" className={cn("text-base leading-none font-medium", className)} {...props} />;
}

export function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description data-slot="dialog-description" className={cn("text-sm text-[#a3a5b5]", className)} {...props} />;
}

// --- GHAvatar ---

export function GHAvatar({ name, size = 8 }: { name: string; size: number }) {
  const sizeValue = `${(size || 8) * 0.25}rem`;
  const avatarName = name.split('/')[0];
  return (
    <RuiAvatar.Root>
      <RuiAvatar.Fallback asChild>
        <span
          className="inline-block animate-pulse rounded-full bg-white/10"
          style={{ width: sizeValue, height: sizeValue }}
        />
      </RuiAvatar.Fallback>
      <RuiAvatar.Image
        className="block rounded-full"
        style={{ width: sizeValue, height: sizeValue, minWidth: sizeValue, minHeight: sizeValue }}
        src={`https://github.com/${avatarName}.png`}
        alt={`Avatar for ${name}`}
      />
    </RuiAvatar.Root>
  );
}
