"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useAsyncData<T>(
  loader: () => Promise<T>,
  ..._args: unknown[]
) {
  void _args;
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const loaderRef = useRef(loader);
  useEffect(() => {
    loaderRef.current = loader;
  }, [loader]);

  const load = useCallback(async () => {
    try {
      const result = await loaderRef.current();

      setState({
        data: result,
        loading: false,
        error: null,
      });
    } catch (e) {
      setState({
        data: null,
        loading: false,
        error: e instanceof Error ? e.message : "Failed to load data",
      });
    }
  }, []);

  const refetch = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    return load();
  }, [load]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    ...state,
    refetch,
  };
}