import React, { PropsWithChildren } from 'react';

type CodeBlockProps = PropsWithChildren<{
  className?: string;
  language?: string;
}>;

export default function CodeBlock ({ children, className, language }: CodeBlockProps) {
  const normalizedClassName = className ?? (language ? `language-${language}` : undefined);

  return (
    <pre className={normalizedClassName}>
      <code>{children}</code>
    </pre>
  );
}
