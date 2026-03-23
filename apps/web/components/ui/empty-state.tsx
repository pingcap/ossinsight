import { forwardRef, type ForwardedRef } from 'react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps extends React.ComponentProps<'div'> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
}

export const EmptyState = forwardRef(function EmptyState(
  { icon, title, description, className, children, ...props }: EmptyStateProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-16 text-center',
        className,
      )}
      {...props}
    >
      {icon && <div className="text-[#555]">{icon}</div>}
      <h3 className="text-sm font-medium text-[#7c7c7c]">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm text-[#555]">{description}</p>
      )}
      {children}
    </div>
  );
});
