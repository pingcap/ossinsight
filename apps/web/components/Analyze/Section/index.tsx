import { ScrollspySectionWrapper } from '@/components/Scrollspy';
import clsx from 'clsx';
import * as React from 'react';
import { twMerge } from 'tailwind-merge';

export interface SectionTemplateProps {
  children: React.ReactNode;
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  level?: number;
  className?: string;
  id?: string;
}

export default function SectionTemplate (props: SectionTemplateProps) {
  const { children, title, description, level = 1, id, className } = props;

  return (
    <ScrollspySectionWrapper anchor={id} className={twMerge(className)}>
      <TitleWrapper level={level} id={id} className="">
        {title}
      </TitleWrapper>
      {description && <p className="">{description}</p>}
      {children}
    </ScrollspySectionWrapper>
  );
}

// Max level is 3
function TitleWrapper ({
  children,
  level,
  className,
  ...rest
}: {
  children: React.ReactNode;
  level: number;
  className?: string;
  id?: string;
  [key: string]: any;
}) {
  switch (level) {
    case 1:
      return (
        <h1
          className={clsx('text-title font-semibold pb-3 text-3xl', className)}
          style={{
            scrollMarginTop: '140px',
          }}
          {...rest}
        >
          {children}
        </h1>
      );
    case 2:
      return (
        <h2
          className={clsx('text-title font-semibold pb-3 text-2xl', className)}
          style={{
            scrollMarginTop: '140px',
          }}
          {...rest}
        >
          {children}
        </h2>
      );
    case 3:
    default:
      return (
        <h3
          className={clsx('text-title font-semibold pb-3 text-xl', className)}
          style={{
            scrollMarginTop: '140px',
          }}
          {...rest}
        >
          {children}
        </h3>
      );
  }
}
