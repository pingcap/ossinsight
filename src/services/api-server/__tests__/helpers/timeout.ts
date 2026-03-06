export function expectTimeout (promise: Promise<any>, ms: number = 100) {
  return new Promise<void>((resolve, reject) => {
    const fn = jest.fn();
    promise.finally(fn);

    setTimeout(() => {
      try {
        expect(fn).not.toBeCalled();
        resolve();
      } catch (e) {
        reject(e);
      }
    }, ms);
  });
}
