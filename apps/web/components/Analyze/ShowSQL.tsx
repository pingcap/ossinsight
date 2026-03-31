'use client';

import dynamic from 'next/dynamic';
import React, { useState } from 'react';

const LazySQLDialog = dynamic(() => import('./SQLDialog'), { ssr: false });

// --- SHOW SQL Button (absolute positioned, for chart overlays) ---

export function ShowSQLButton({
  sql,
  queryName,
  queryParams,
  explainUrl,
}: {
  sql?: string;
  queryName?: string;
  queryParams?: Record<string, any>;
  explainUrl?: string;
}) {
  const [open, setOpen] = useState(false);

  if (!sql) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors ml-auto mb-1"
      >
        <SQLIcon size={14} />
        SHOW SQL
      </button>
      {open && (
        <LazySQLDialog
          sql={sql}
          queryName={queryName}
          queryParams={queryParams}
          explainUrl={explainUrl}
          open={open}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

// --- SHOW SQL Button (inline, for use in text flow / headers) ---

export function ShowSQLInline({
  sql,
  queryName,
  queryParams,
  explainUrl,
}: {
  sql?: string;
  queryName?: string;
  queryParams?: Record<string, any>;
  explainUrl?: string;
}) {
  const [open, setOpen] = useState(false);

  if (!sql) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
      >
        <SQLIcon size={14} />
        SHOW SQL
      </button>
      {open && (
        <LazySQLDialog
          sql={sql}
          queryName={queryName}
          queryParams={queryParams}
          explainUrl={explainUrl}
          open={open}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function SQLIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
      <path d="M4.708 5.578L2.061 8.224l2.647 2.646-.708.708L.939 8.224 4 5.163l.708.415zm7.584 0l2.647 2.646-2.647 2.646.708.708L16.061 8.224 13 5.163l-.708.415z" />
      <path d="M5.5 13.5L10.5 2.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
    </svg>
  );
}
