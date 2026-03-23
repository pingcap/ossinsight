'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { cn } from '@/lib/utils';

type ExportOption = {
  label: string;
  onClick: () => void;
};

export function ExportButton({
  options,
  className,
}: {
  options: ExportOption[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open, handleClickOutside]);

  return (
    <div ref={ref} className={cn('relative inline-flex', className)}>
      <button
        type="button"
        aria-label="Export"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-7 w-7 items-center justify-center rounded-md bg-[#1a1a1a]/80 text-[#7c7c7c] backdrop-blur transition hover:bg-[#2a2a2a] hover:text-white"
      >
        <Download className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[160px] overflow-hidden rounded-md border border-[#333] bg-[#1a1a1a] py-1 shadow-lg">
          {options.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => {
                option.onClick();
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] text-[#c6c6d0] transition hover:bg-[#2a2a2a] hover:text-white"
            >
              <Download className="h-3 w-3" />
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function triggerDownload(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadCsv(headers: string[], rows: string[][], filename: string) {
  const escape = (val: string) => {
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const csv = [
    headers.map(escape).join(','),
    ...rows.map((row) => row.map(escape).join(',')),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(URL.createObjectURL(blob), filename);
}
