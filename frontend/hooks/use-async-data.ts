"use client";

import { useCallback, useEffect, useState } from "react";

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useAsyncData<T>(
  loader: () => Promise<T>,
  deps: unknown[] = []
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const load = useCallback(async () => {
    setState((s) => ({
      ...s,
      loading: true,
      error: null,
    }));

    try {
      const result = await loader();

      setState({
        data: result,
        loading: false,
        error: null,
      });

    } catch (e) {
      setState({
        data: null,
        loading: false,
        error:
          e instanceof Error
            ? e.message
            : "Failed to load data",
      });
    }
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return {
    ...state,
    refetch: load,
  };
}