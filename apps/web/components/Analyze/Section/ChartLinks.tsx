import NextLink from 'next/link';
import * as React from 'react';

interface ChartLinksProps {
  innerSectionId?: string;
}

export function ChartLinks({ innerSectionId }: ChartLinksProps) {
  if (!innerSectionId) return null;

  return (
    <div className="absolute top-4 right-4 flex gap-2">
      <NextLink
        href={`#${innerSectionId}`}
        className="w-5 h-5 rounded-full inline-flex text-gray-400 hover:text-white items-center justify-center transition-colors"
        title="See Details"
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
          <path d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
        </svg>
      </NextLink>
    </div>
  );
}
