const map = new Map<() => Promise<any>, Promise<any>>();

/**
 * Used to create cached from an idempotent promise getter.
 * @param importer
 */
export function cachedImport<T> (importer: () => Promise<T>): Promise<T> {
  let cached = map.get(importer);
  if (!cached) {
    map.set(importer, cached = importer());
  }

  return cached;
}
