
'use client';

import { useState, useEffect, useCallback } from 'react';

function getValue<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const storedValue = localStorage.getItem(key);
    if (storedValue === null) {
      return defaultValue;
    }
    return JSON.parse(storedValue) as T;
  } catch (error) {
    console.error(`Error parsing localStorage key "${key}":`, error);
    return defaultValue;
  }
}

export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: React.SetStateAction<T>) => void] {
  const [value, setValue] = useState<T>(() => getValue(key, defaultValue));

  useEffect(() => {
    try {
      // Don't store null or undefined unless it's the explicit value
      if (value !== null && value !== undefined) {
          localStorage.setItem(key, JSON.stringify(value));
      } else {
          localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, value]);
  
  const setStoredValue = useCallback((newValue: React.SetStateAction<T>) => {
      setValue(prevValue => {
          const valueToStore = newValue instanceof Function ? newValue(prevValue) : newValue;
           try {
              if (valueToStore !== null && valueToStore !== undefined) {
                localStorage.setItem(key, JSON.stringify(valueToStore));
              } else {
                localStorage.removeItem(key);
              }
            } catch (error) {
              console.error(`Error setting localStorage key "${key}":`, error);
            }
          return valueToStore;
      });
  }, [key]);


  return [value, setStoredValue];
}
