'use client';

interface CreateLocalStorageStoreOptions<T> {
  emptyValue: T;
  eventName: string;
  onCacheChange?: (value: T) => void;
  parse: (input: unknown) => T | null;
  prepareForWrite?: (value: T) => T;
  storageKey: string;
}

export function createLocalStorageStore<T>({
  emptyValue,
  eventName,
  onCacheChange,
  parse,
  prepareForWrite,
  storageKey,
}: CreateLocalStorageStoreOptions<T>) {
  let cache = emptyValue;
  let rawCache: string | null = null;

  const setCache = (value: T, raw: string | null) => {
    cache = value;
    rawCache = raw;
    onCacheChange?.(value);
  };

  const resetCache = (raw: string | null = null) => {
    setCache(emptyValue, raw);
  };

  const emitUpdate = () => {
    if (typeof window === 'undefined') {
      return;
    }

    window.dispatchEvent(new CustomEvent(eventName));
  };

  const read = () => {
    if (typeof window === 'undefined') {
      return cache;
    }

    let raw: string | null = null;

    try {
      raw = window.localStorage.getItem(storageKey);

      if (!raw) {
        resetCache(null);
        return cache;
      }

      if (raw === rawCache) {
        return cache;
      }

      const parsed = parse(JSON.parse(raw));

      if (parsed === null) {
        resetCache(raw);
        return cache;
      }

      setCache(parsed, raw);
      return cache;
    } catch {
      resetCache(raw);
      return cache;
    }
  };

  const write = (value: T) => {
    if (typeof window === 'undefined') {
      return;
    }

    const nextValue = prepareForWrite ? prepareForWrite(value) : value;
    const raw = JSON.stringify(nextValue);

    setCache(nextValue, raw);
    window.localStorage.setItem(storageKey, raw);
    emitUpdate();
  };

  const subscribe = (onChange: () => void) => {
    if (typeof window === 'undefined') {
      return () => {};
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage) {
        return;
      }

      if (event.key !== null && event.key !== storageKey) {
        return;
      }

      onChange();
    };

    window.addEventListener(eventName, onChange);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(eventName, onChange);
      window.removeEventListener('storage', handleStorage);
    };
  };

  return {
    read,
    subscribe,
    write,
  };
}
