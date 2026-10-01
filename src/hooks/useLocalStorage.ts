import { useState, useEffect, type Dispatch, type SetStateAction } from "react";

export default function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(key) || String(defaultValue));
    } catch (error) {
      return defaultValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [value, key]);

  return [value, setValue];
}
