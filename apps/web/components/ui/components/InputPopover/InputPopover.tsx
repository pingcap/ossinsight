import * as RuiPopover from '@radix-ui/react-popover';
import { ReactElement, ReactNode } from 'react';
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { preventDefault } from '../../utils/event';

export interface InputPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  input: ReactElement;
  popperContent: ReactNode;

  popoverPortalProps?: Omit<RuiPopover.PortalProps, 'children'>;
  popoverContentProps?: Omit<RuiPopover.PopoverContentProps, 'children' | 'onOpenAutoFocus'>;
}

export function InputPopover ({ open, onOpenChange, input, popperContent, popoverPortalProps, popoverContentProps }: InputPopoverProps) {
  void popoverPortalProps;

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <PopoverAnchor asChild>
          {input}
        </PopoverAnchor>
      </PopoverTrigger>
      <PopoverContent
        {...popoverContentProps}
        className={cn('InputPopper-content z-10', popoverContentProps?.className)}
        onOpenAutoFocus={preventDefault}
        align="start"
        sideOffset={6}
      >
        {popperContent}
      </PopoverContent>
    </Popover>
  );
}
