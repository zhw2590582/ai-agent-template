'use client';

interface CreateIndexedDbStoreOptions<T> {
  dbName?: string;
  emptyValue: T;
  eventName: string;
  legacyStorageKey?: string;
  onCacheChange?: (value: T) => void;
  parse: (input: unknown) => T | null;
  prepareForWrite?: (value: T) => T;
  storageKey: string;
  storeName?: string;
}

interface IndexedDbRecord {
  key: string;
  value: unknown;
}

const DEFAULT_DB_NAME = 'ai-agent-template';
const DEFAULT_STORE_NAME = 'local-first-data';

function isIndexedDbAvailable() {
  return typeof window !== 'undefined' && typeof window.indexedDB?.open === 'function';
}

function readLegacyValue<T>(options: {
  emptyValue: T;
  legacyStorageKey?: string;
  parse: (input: unknown) => T | null;
  storageKey: string;
}) {
  if (typeof window === 'undefined') {
    return options.emptyValue;
  }

  const key = options.legacyStorageKey ?? options.storageKey;

  try {
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      return options.emptyValue;
    }

    const parsed = options.parse(JSON.parse(raw));
    return parsed ?? options.emptyValue;
  } catch {
    return options.emptyValue;
  }
}

function writeLegacyValue<T>(options: { legacyStorageKey?: string; storageKey: string; value: T }) {
  if (typeof window === 'undefined') {
    return;
  }

  const key = options.legacyStorageKey ?? options.storageKey;
  window.localStorage.setItem(key, JSON.stringify(options.value));
}

async function openDatabase(dbName: string, storeName: string) {
  return await new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(dbName, 1);

    request.onerror = () => {
      reject(request.error ?? new Error('Failed to open IndexedDB'));
    };

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(storeName)) {
        database.createObjectStore(storeName, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

async function readIndexedDbValue(options: {
  dbName: string;
  storageKey: string;
  storeName: string;
}) {
  const database = await openDatabase(options.dbName, options.storeName);

  try {
    return await new Promise<unknown>((resolve, reject) => {
      const transaction = database.transaction(options.storeName, 'readonly');
      const store = transaction.objectStore(options.storeName);
      const request = store.get(options.storageKey);

      request.onerror = () => {
        reject(request.error ?? new Error('Failed to read IndexedDB value'));
      };

      request.onsuccess = () => {
        const result = request.result as IndexedDbRecord | undefined;
        resolve(result?.value);
      };
    });
  } finally {
    database.close();
  }
}

async function writeIndexedDbValue(options: {
  dbName: string;
  storageKey: string;
  storeName: string;
  value: unknown;
}) {
  const database = await openDatabase(options.dbName, options.storeName);

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(options.storeName, 'readwrite');
      const store = transaction.objectStore(options.storeName);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(transaction.error ?? new Error('Failed to write IndexedDB value'));
      transaction.onabort = () =>
        reject(transaction.error ?? new Error('IndexedDB transaction aborted'));

      store.put({
        key: options.storageKey,
        value: options.value,
      } satisfies IndexedDbRecord);
    });
  } finally {
    database.close();
  }
}

export function createIndexedDbStore<T>({
  dbName = DEFAULT_DB_NAME,
  emptyValue,
  eventName,
  legacyStorageKey,
  onCacheChange,
  parse,
  prepareForWrite,
  storageKey,
  storeName = DEFAULT_STORE_NAME,
}: CreateIndexedDbStoreOptions<T>) {
  let cache = emptyValue;
  let isLoaded = false;
  let loadPromise: Promise<T> | null = null;
  let broadcastChannel: BroadcastChannel | null = null;

  const setCache = (value: T) => {
    cache = value;
    onCacheChange?.(value);
  };

  const emitUpdate = () => {
    if (typeof window === 'undefined') {
      return;
    }

    window.dispatchEvent(new CustomEvent(eventName));
  };

  const notifyExternalTabs = () => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
      return;
    }

    if (!broadcastChannel) {
      broadcastChannel = new BroadcastChannel(eventName);
    }

    broadcastChannel.postMessage({ storageKey });
  };

  const load = async (force = false) => {
    if (typeof window === 'undefined') {
      return cache;
    }

    if (!isIndexedDbAvailable()) {
      const nextValue = readLegacyValue({
        emptyValue,
        legacyStorageKey,
        parse,
        storageKey,
      });
      setCache(nextValue);
      isLoaded = true;
      return cache;
    }

    if (!force && isLoaded) {
      return cache;
    }

    if (!force && loadPromise) {
      return loadPromise;
    }

    const nextLoad = (async () => {
      let nextValue = emptyValue;
      const indexedDbValue = await readIndexedDbValue({
        dbName,
        storageKey,
        storeName,
      });

      const parsedIndexedDbValue = parse(indexedDbValue);

      if (parsedIndexedDbValue !== null) {
        nextValue = parsedIndexedDbValue;
      } else if (legacyStorageKey) {
        const legacyValue = readLegacyValue({
          emptyValue,
          legacyStorageKey,
          parse,
          storageKey,
        });

        nextValue = legacyValue;

        if (legacyValue !== emptyValue) {
          await writeIndexedDbValue({
            dbName,
            storageKey,
            storeName,
            value: legacyValue,
          });
          window.localStorage.removeItem(legacyStorageKey);
        }
      }

      setCache(nextValue);
      isLoaded = true;
      emitUpdate();
      return cache;
    })();

    loadPromise = nextLoad;

    try {
      return await nextLoad;
    } finally {
      if (loadPromise === nextLoad) {
        loadPromise = null;
      }
    }
  };

  const read = () => {
    if (typeof window === 'undefined') {
      return cache;
    }

    void load();
    return cache;
  };

  const write = async (value: T) => {
    const nextValue = prepareForWrite ? prepareForWrite(value) : value;
    setCache(nextValue);
    isLoaded = true;
    emitUpdate();

    if (!isIndexedDbAvailable()) {
      writeLegacyValue({
        legacyStorageKey,
        storageKey,
        value: nextValue,
      });
      return;
    }

    await writeIndexedDbValue({
      dbName,
      storageKey,
      storeName,
      value: nextValue,
    });
    notifyExternalTabs();
  };

  const subscribe = (onChange: () => void) => {
    if (typeof window === 'undefined') {
      return () => {};
    }

    let channel: BroadcastChannel | null = null;

    const handleLocalUpdate = () => {
      onChange();
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage) {
        return;
      }

      const key = legacyStorageKey ?? storageKey;
      if (event.key !== null && event.key !== key) {
        return;
      }

      const nextValue = readLegacyValue({
        emptyValue,
        legacyStorageKey,
        parse,
        storageKey,
      });

      setCache(nextValue);
      isLoaded = true;
      onChange();
    };

    const handleBroadcast = () => {
      void load(true).then(() => {
        onChange();
      });
    };

    window.addEventListener(eventName, handleLocalUpdate);

    window.addEventListener('storage', handleStorage);

    if (isIndexedDbAvailable() && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel(eventName);
      channel.addEventListener('message', handleBroadcast);
    }

    return () => {
      window.removeEventListener(eventName, handleLocalUpdate);
      window.removeEventListener('storage', handleStorage);

      if (channel) {
        channel.removeEventListener('message', handleBroadcast);
        channel.close();
      }
    };
  };

  return {
    ensureLoaded: () => load(),
    isLoaded: () => isLoaded,
    read,
    subscribe,
    write,
  };
}
