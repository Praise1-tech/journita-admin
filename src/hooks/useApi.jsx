import { useState, useEffect, useCallback } from "react";

/**
 * Generic data-fetching hook.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useApi(api.users.list);
 *   const { data, run } = useApi(api.bonus.give, { lazy: true });
 */
export function useApi(fn, { lazy = false, initialData = null } = {}) {
  const [data,    setData]    = useState(initialData);
  const [loading, setLoading] = useState(!lazy);
  const [error,   setError]   = useState(null);

  const run = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || "Unknown error");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fn]);

  useEffect(() => {
    if (!lazy) run();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, refetch: run, run };
}