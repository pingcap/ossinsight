import {CacheOption, CacheProvider} from './CacheProvider';

// Requests may read shared prefetch results. New parameter combinations stay
// in a bounded, short-lived cache owned by this API process.
export default class RequestCacheProvider implements CacheProvider {
  private readonly entries = new Map<string, {value: string; expires: number}>();

  constructor(private readonly shared: CacheProvider) {}

  async get(key: string) {
    const entry = this.entries.get(key);
    if (entry) {
      this.entries.delete(key);
      if (entry.expires > Date.now()) {
        this.entries.set(key, entry);
        return JSON.parse(entry.value);
      }
    }
    return this.shared.get(key);
  }

  async set(key: string, value: string, options?: CacheOption) {
    this.entries.delete(key);
    if (Buffer.byteLength(key) + Buffer.byteLength(value) > 64 * 1024) return;
    if (this.entries.size >= 128) this.entries.delete(this.entries.keys().next().value!);
    const seconds = options && options.EX > 0 ? Math.min(options.EX, 60) : 60;
    this.entries.set(key, {value, expires: Date.now() + seconds * 1000});
  }
}
