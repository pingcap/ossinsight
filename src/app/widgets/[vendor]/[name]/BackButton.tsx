'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';

export default function BackButton () {
  const router = useRouter();

  const handleClickCallback = React.useCallback(() => {
    router.push('/widgets');
  }, [router]);

  return (
    <button onClick={handleClickCallback} className="Button Button-secondary inline-flex items-center gap-1 mb-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="w-4 h-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
        />
      </svg>
      Back
    </button>
  );
}