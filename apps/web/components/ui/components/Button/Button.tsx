import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Button as UIButton } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary'
export type ButtonSize = 'lg' | 'sm';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant,
  size,
  className,
  ...props
}, ref) => {
  const mappedVariant = variant === 'primary' ? 'default' : 'outline';
  const mappedSize = size === 'lg' ? 'lg' : 'sm';

  return (
    <UIButton
      ref={ref}
      {...props}
      variant={mappedVariant}
      size={mappedSize}
      className={cn(
        !variant && 'border-white/10 bg-white/[0.03] text-[#d8dae3] hover:border-white/30 hover:bg-white/[0.06] hover:text-[#f6f7fb]',
        className,
      )}
    />
  );
});
