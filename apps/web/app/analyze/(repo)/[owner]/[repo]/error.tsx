'use client';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-[22px] font-semibold text-[#e9eaee]">Something went wrong</h2>
      <p className="text-[14px] text-[#7c7c7c] max-w-md">{error.message || 'An unexpected error occurred.'}</p>
      <button onClick={reset} className="rounded border border-[#4d4d4f] px-4 py-2 text-[14px] text-[#d8d8d8] transition hover:text-white hover:border-white">
        Try again
      </button>
    </div>
  );
}
