export async function timeout (ms: number) {
  return await new Promise(resolve => setTimeout(resolve, ms));
}

export function wait<T> (ms: number, reject = false): (value: T) => Promise<T> {
  return async value => await timeout(ms).then(() => reject ? Promise.reject(value) : value);
}
