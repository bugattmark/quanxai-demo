'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseAPIOptions<T> {
  initialData?: T;
  skip?: boolean;
}

interface UseAPIResult<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useAPI<T>(
  fetcher: () => Promise<T>,
  options: UseAPIOptions<T> = {}
): UseAPIResult<T> {
  const { initialData, skip = false } = options;
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (skip) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [fetcher, skip]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useMutation<T, P>(
  mutationFn: (params: P) => Promise<T>
): {
  mutate: (params: P) => Promise<T>;
  loading: boolean;
  error: Error | null;
  data: T | undefined;
} {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | undefined>(undefined);

  const mutate = useCallback(
    async (params: P) => {
      setLoading(true);
      setError(null);

      try {
        const result = await mutationFn(params);
        setData(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [mutationFn]
  );

  return { mutate, loading, error, data };
}
