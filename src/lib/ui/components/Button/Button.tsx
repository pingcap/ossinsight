import clsx from 'clsx';
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { getVariantClasses } from '../../utils/variants';

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
  return (
    <button
      ref={ref}
      {...props}
      className={
        clsx(
          'Button',
          className,
          getVariantClasses('Button', [variant, size]),
        )
      }
    />
  );
});
