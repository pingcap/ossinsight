import { useCancellablePromise } from '../../hooks/useCancellablePromise';
import { useDebouncedCallback } from '../../hooks/useDebouncedCallback';
import { CancelablePromise } from '../../utils/promise';

export interface UseRemoteListOptions<Item> {
  getRemoteOptions: (text: string) => CancelablePromise<Item[]>;
}

export function useRemoteList<Item> ({ getRemoteOptions }: UseRemoteListOptions<Item>) {
  const { execute, result: items, executing: loading, error } = useCancellablePromise<string, Item[]>({
    executor: getRemoteOptions,
    defaultResult: [],
  });

  const reload = useDebouncedCallback(execute, { timeout: 500 });

  return {
    reload,
    items,
    loading,
    error,
  };
}