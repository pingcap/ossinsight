export async function withTimeout<T> (cb: (signal: AbortSignal) => Promise<T>, timeout: number) {
  const controller = new AbortController();

  const timeoutHandler = setTimeout(() => {
    controller.abort('Timeout');
  }, timeout);

  try {
    return await cb(controller.signal);
  } finally {
    clearTimeout(timeoutHandler);
  }
}