import ClipboardCheckIcon from 'bootstrap-icons/icons/clipboard-check.svg';
import ClipboardIcon from 'bootstrap-icons/icons/clipboard.svg';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

export interface CopyButtonProps {
  className?: string;
  content: string;
  children?: (copied: boolean) => ReactNode;
  copyText?: string;
  copiedText?: string;
}

export function CopyButton ({ className, ...props }: CopyButtonProps) {
  return <NoStyleCopyButton className={twMerge('border bg-toolbar rounded hover:text-active transition-colors px-2 py-1 text-content flex gap-2 items-center text-sm', className)} {...props} />;
}

export function NoStyleCopyButton ({ className, content, children, copyText, copiedText }: { className?: string, content: string, children?: (copied: boolean) => ReactNode, copyText?: string, copiedText?: string }) {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setChecked(false);
  }, [content]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content).then(() => {
      setChecked(true);
    });
  }, [content]);

  const copyButtonText = copyText || 'Copy';
  const copiedButtonText = copiedText || 'Copied!';

  return (
    <button className={className} onClick={handleCopy} type="button">
      {checked ? <ClipboardCheckIcon width={14} height={14} /> : <ClipboardIcon width={14} height={14} />}
      {children ? children(checked) : checked ? copiedButtonText : copyButtonText}
    </button>
  );
}
