import { useAsyncOperation } from '@site/src/hooks/operation';
import { aiQuestion, AiQuestionResource, aiQuestionResource } from '@site/src/api/core';
import { useEffect, useMemo, useRef, useState } from 'react';
import { isNullish, notNullish } from '@site/src/utils/value';
import useSWR from 'swr';

export function useAiQuestion (question: string, repoId: number | undefined, repoName: string | undefined, options: { getAccessToken: () => Promise<string> }) {
  const { data: resource } = useSWR('ai-question-usage', {
    fetcher: async () => {
      const accessToken = await options.getAccessToken();
      return await aiQuestionResource({ accessToken });
    },
    shouldRetryOnError: false,
  });
  const { data: result, loading, error, run } = useAsyncOperation({ question: `In this repo: ${question}`, context: { repo_id: repoId, repo_name: repoName } }, aiQuestion, true);

  const latestResource = useLatest<AiQuestionResource>([
    useLastNonNullish(resource),
    useLastNonNullish(result?.resource),
  ]);

  return { sql: result?.sql, resource: latestResource, loading, error, run };
}

function useLastNonNullish<T> (value: T) {
  const [v, setV] = useState<T>(value);

  useEffect(() => {
    if (notNullish(value)) {
      setV(value);
    }
  }, [value]);

  return v;
}

function useLatest<T> (value: [T | undefined, T | undefined]) {
  const lastRef = useRef<T | undefined>(value.find(notNullish));
  return useMemo(() => {
    if (isNullish(value[0])) {
      if (isNullish(value[1])) {
        return lastRef.current;
      }
      lastRef.current = value[1];
      return value[1];
    }
    if (isNullish(value[1])) {
      lastRef.current = value[0];
      return value[0];
    }
    if (value[0] === lastRef.current) {
      lastRef.current = value[1];
      return value[1];
    } else {
      lastRef.current = value[0];
      return value[0];
    }
  }, value);
}
