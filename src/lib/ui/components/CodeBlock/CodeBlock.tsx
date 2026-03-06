'use client';

import clsx from 'clsx';
import 'highlight.js/styles/github-dark-dimmed.css';
import { HTMLAttributes, ReactNode, useEffect, useId, useState } from 'react';
import { twJoin, twMerge } from 'tailwind-merge';
import { CopyButton, CopyButtonProps } from './CopyButton';
import type { HighlightRequest, HighlightResponse } from './highlight.worker';

const worker = typeof Worker !== 'undefined' ? new Worker(new URL('./highlight.worker.ts', import.meta.url)) : undefined;

export interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
  wrap?: boolean;
  showCopyButton?: boolean;
  heading?: ReactNode;
  copyButtonProps?: Omit<CopyButtonProps, 'content'>;
}

export function CodeBlock({ heading, code, language, wrap, className, showCopyButton = true, copyButtonProps = {} }: CodeBlockProps) {
  const id = useId();
  const [result, setResult] = useState<string | undefined>();

  useEffect(() => {
    setResult(undefined);
    if (language) {
      worker?.postMessage({
        id,
        code,
        languageSubset: [language],
      } satisfies HighlightRequest);
    }
  }, [code, language]);

  useEffect(() => {
    const handler = (ev: MessageEvent<HighlightResponse>) => {
      if (ev.data.id !== id) {
        return;
      }
      if ('error' in ev.data) {
        console.error(ev.data.error);
      } else {
        setResult(ev.data.result);
      }
    };
    worker?.addEventListener('message', handler);

    return () => {
      worker?.removeEventListener('message', handler);
    };
  }, []);

  const codeProps: HTMLAttributes<HTMLDivElement> = {};

  if (result) {
    codeProps.dangerouslySetInnerHTML = { __html: result };
  } else {
    codeProps.children = code;
  }

  return (
    <div className={clsx('relative !bg-transparent rounded hljs', className)}>
      {heading && <div className='pt-4 px-4 absolute text-disabled text-sm'>
        {heading}
      </div>}
      <pre className="text-xs min-h-full">
        <code
          className={clsx(
            'block p-4 min-h-full',
            wrap ? 'overflow-x-hidden whitespace-pre-wrap' : 'overflow-x-auto',
            heading && 'pt-14'
          )}
          {...codeProps}
        />
      </pre>
      {showCopyButton && <CopyButton
        {...copyButtonProps}
        className={twMerge('absolute top-2 right-2', copyButtonProps?.className)}
        content={code}
      />}
    </div>
  );
}


