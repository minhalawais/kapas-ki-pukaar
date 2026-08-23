export interface KeyValueStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export function createMemoryStore(initial: Record<string, string> = {}): KeyValueStore {
  const data = new Map(Object.entries(initial));
  return {
    async getItem(key) {
      return data.get(key) ?? null;
    },
    async setItem(key, value) {
      data.set(key, value);
    },
    async removeItem(key) {
      data.delete(key);
    },
  };
}

export function createWebStorageAdapter(): KeyValueStore {
  return {
    async getItem(key) {
      if (typeof localStorage === "undefined") {
        return null;
      }
      return localStorage.getItem(key);
    },
    async setItem(key, value) {
      if (typeof localStorage === "undefined") {
        return;
      }
      localStorage.setItem(key, value);
    },
    async removeItem(key) {
      if (typeof localStorage === "undefined") {
        return;
      }
      localStorage.removeItem(key);
    },
  };
}
