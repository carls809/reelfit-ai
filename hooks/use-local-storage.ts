"use client";

import { useEffect, useRef, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [ready, setReady] = useState(false);
  const initialRef = useRef(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setValue(JSON.parse(item) as T);
      }
    } catch {
      setValue(initialRef.current);
    } finally {
      setReady(true);
    }
  }, [key]);

  useEffect(() => {
    if (!ready) return;

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore client storage failures.
    }
  }, [key, ready, value]);

  return { ready, value, setValue };
}
