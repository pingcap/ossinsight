import * as RuiPopover from '@radix-ui/react-popover';
import clsx from 'clsx';
import { ReactElement, ReactNode } from 'react';
import { preventDefault } from '../../utils/event';

export interface InputPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  input: ReactElement;
  popperContent: ReactNode;

  popoverPortalProps?: Omit<RuiPopover.PopoverPortalProps, 'children'>;
  popoverContentProps?: Omit<RuiPopover.PopoverContentProps, 'children' | 'onOpenAutoFocus'>;
}

export function InputPopover ({ open, onOpenChange, input, popperContent, popoverPortalProps, popoverContentProps }: InputPopoverProps) {

  return (
    <RuiPopover.Root open={open} onOpenChange={onOpenChange}>
      <RuiPopover.Trigger asChild>
        <RuiPopover.Anchor asChild>
          {input}
        </RuiPopover.Anchor>
      </RuiPopover.Trigger>
      <RuiPopover.Portal
        {...popoverPortalProps}
      >
        <RuiPopover.Content
          {...popoverContentProps}
          className={clsx('InputPopper-content z-10', popoverContentProps?.className)}
          onOpenAutoFocus={preventDefault}
          align="start"
          sideOffset={6}
        >
          {popperContent}
        </RuiPopover.Content>
      </RuiPopover.Portal>
    </RuiPopover.Root>
  );
}
