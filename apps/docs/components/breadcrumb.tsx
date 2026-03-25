import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  name: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Visual breadcrumb navigation component.
 * Styled to match the OSSInsight dark theme.
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-1 text-[13px] text-slate-500 py-2 ${className ?? ''}`}
    >
      <Link
        href="https://ossinsight.io"
        className="flex items-center gap-1 hover:text-[#ffe895] transition-colors"
        aria-label="Home"
      >
        <Home className="h-3.5 w-3.5 flex-shrink-0" />
      </Link>
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-slate-700" aria-hidden="true" />
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-[#ffe895] transition-colors truncate max-w-[200px]"
            >
              {item.name}
            </Link>
          ) : (
            <span
              className="text-slate-400 truncate max-w-[240px]"
              aria-current="page"
            >
              {item.name}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
