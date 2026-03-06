import { cloneElement, ReactElement } from 'react';
import { twMerge } from 'tailwind-merge';

interface SplitTemplateProps {
  children: [left: ReactElement, right: ReactElement];
}

export function SplitTemplate ({ children: [left, right] }: SplitTemplateProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className={twMerge("col-span-2 lg:col-span-1")}>
        {cloneElement(left, { className: twMerge(left.props.className, 'w-full overflow-hidden') })}
      </div>
      <div className={twMerge("col-span-2 lg:col-span-1")}>
        {cloneElement(right, { className: twMerge(right.props.className, 'w-full overflow-hidden') })}
      </div>
    </div>
  );
}
