import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  level?: 'h2' | 'h3';
  children: React.ReactNode;
  className?: string;
  id?: string;
}

const styles = {
  h2: 'text-[22px] font-semibold text-[#e9eaee] pb-4',
  h3: 'text-[18px] font-semibold text-[#e9eaee] pb-3',
};

export function SectionHeading({ level = 'h2', children, className, id }: SectionHeadingProps) {
  const Tag = level;
  return <Tag id={id} className={cn(styles[level], className)} style={{ scrollMarginTop: '140px' }}>{children}</Tag>;
}
