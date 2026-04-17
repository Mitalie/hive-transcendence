"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * A localStorage-backed state hook that is SSR-safe.
 *
 * - On the server: always returns `defaultValue` (localStorage doesn't exist).
 * - On the client: initializes from localStorage on first render via a ref
 *   trick, avoiding any setState call inside an effect.
 * - Writes back to localStorage whenever the value changes.
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  deserialize: (raw: string) => T = JSON.parse,
  serialize: (value: T) => string = JSON.stringify,
): [T, (value: T) => void] {
  const getSnapshot = useCallback((): T => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? deserialize(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  }, [key, defaultValue, deserialize]);

  const [value, setValueState] = useState<T>(getSnapshot);

  useEffect(() => {
    try {
      localStorage.setItem(key, serialize(value));
    } catch {}
  }, [key, value, serialize]);

  const setValue = useCallback((next: T) => {
    setValueState(next);
  }, []);

  return [value, setValue];
}
