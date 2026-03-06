import LazyImg from '@/lib/ui/components/LazyImg/LazyImg';
import { ShareOptions } from '@/lib/ui/components/ShareBlock';
import ListIcon from 'bootstrap-icons/icons/list-ul.svg';
import { ReactNode } from 'react';
import { twJoin } from 'tailwind-merge';

export function MockMarkdown ({ type, loading, shareInfo, className }: { type: string, loading: boolean, shareInfo?: ShareOptions, className?: string }) {
  return (
    <div className={twJoin('bg-black rounded-md', className)}>
      <div className="border-b py-2 px-4 text-sm text-content flex items-center gap-2">
        <ListIcon width={14} />
        <span>
          README.md
        </span>
      </div>
      <div className="p-8">
        <p className="text-base font-bold text-white border-b mb-4 pb-2">README.md</p>
        <div>
          {shareInfo
            ? (
              <LazyImg
                className="block"
                alt={shareInfo.title}
                src={shareInfo.thumbnailUrl}
                width={shareInfo.imageWidth}
                height="auto"
                fallback={<ImagePendingShell>Loading Widget Image...</ImagePendingShell>}
              />
            )
            : loading
              ? <ImagePendingShell>Loading Widget Image...</ImagePendingShell>
              : <ImagePendingShell>Please select a {type}</ImagePendingShell>
          }
        </div>
      </div>
    </div>
  );
}

function ImagePendingShell ({ children, height }: { children: ReactNode, height?: number }) {
  return (
    <div className="h-48 my-2 rounded-lg border bg-toolbar flex items-center justify-center text-sm text-disabled" style={{ height }}>
      {children}
    </div>
  );
}
