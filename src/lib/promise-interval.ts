
export type PromiseIntervalHandle = { timeout: ReturnType<typeof setTimeout>, stop: boolean };

/**
 * Like setInterval, but only trigger next timer when handler promise is already finished (resolved or rejected).
 *
 * @param handler
 * @param interval
 */
export function setPromiseInterval (handler: () => Promise<void>, interval: number): PromiseIntervalHandle {
  const handle: PromiseIntervalHandle = { timeout: 0 as any, stop: false };

  function run () {
    if (handle.stop) {
      return;
    }
    handler()
      .finally(() => {
        handle.timeout = setTimeout(run, interval);
      });
  }

  handle.timeout = setTimeout(run, interval);

  return handle;
}

export function clearPromiseInterval (handle: PromiseIntervalHandle) {
  handle.stop = true;
  clearTimeout(handle.timeout);
}
