"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Fetches async data on mount. If a `fallback` is provided, it is shown
 * immediately while loading so there is no empty flicker, and it is also
 * used as the result if the API call fails (e.g. backend is offline).
 */
export function useAsyncData<T>(
  loader: () => Promise<T>,
  deps: unknown[] = [],
  fallback?: T
) {
  const [state, setState] = useState<AsyncState<T>>({
    // Start with fallback data immediately to prevent blank/flicker
    data: fallback ?? null,
    loading: true,
    error: null,
  });

  // Keep stable ref to fallback so we don't re-run effect on every render
  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const result = await loader();
      setState({ data: result, loading: false, error: null });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load data";
      // If we have fallback data, show it silently instead of crashing the UI
      setState({
        data: fallbackRef.current ?? null,
        loading: false,
        error: fallbackRef.current ? null : msg,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, refetch: load };
}
