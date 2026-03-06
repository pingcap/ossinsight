import process from 'node:process';

interface PausedPromise extends Promise<void> {
  resume (): void;
}

export function pause () {
  let _resolve: () => void = undefined as never;
  const promise: PausedPromise = new Promise<void>((resolve) => {
    _resolve = resolve;
  }) as PausedPromise;

  promise.resume = _resolve;
  return promise;
}

export function sleep (ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// If you want some code in promise finally block. (microtask)
export function nextTick () {
  return new Promise(resolve => process.nextTick(resolve))
}