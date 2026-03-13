import { cloneElement, ReactElement } from 'react';
import { twMerge } from 'tailwind-merge';

interface MainSideGridTemplateProps {
  inverse?: boolean;
  children: [main: ReactElement, side: ReactElement];
}

export function MainSideGridTemplate ({ inverse = false, children: [main, side] }: MainSideGridTemplateProps) {
  const mainClassName = 'col-span-12 sm:col-span-7 md:col-span-8 lg:col-span-9';
  const sideClassName = 'col-span-12 sm:col-span-5 md:col-span-4 lg:col-span-3';
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className={inverse ? sideClassName : mainClassName}>
        {cloneElement(main, { className: twMerge(main.props.className, 'w-full overflow-hidden') })}
      </div>
      <div className={inverse ? mainClassName : sideClassName}>
        {cloneElement(side, { className: twMerge(side.props.className, 'w-full overflow-hidden') })}
      </div>
    </div>
  );
}
