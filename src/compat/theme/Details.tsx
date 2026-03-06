import React, { PropsWithChildren, ReactNode } from 'react';

type DetailsProps = PropsWithChildren<{
  summary?: ReactNode;
}>;

export default function Details ({ children, summary }: DetailsProps) {
  return (
    <details>
      {summary}
      {children}
    </details>
  );
}
