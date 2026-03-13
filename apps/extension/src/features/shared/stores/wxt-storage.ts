import type { StateStorage } from "zustand/middleware";

export const wxtStorage: StateStorage = {
  getItem: async (name) => {
    const value = await storage.getItem<string>(`local:${name}`);
    return value ?? null;
  },

  setItem: async (name, value) => {
    await storage.setItem(`local:${name}`, value);
  },

  removeItem: async (name) => {
    await storage.removeItem(`local:${name}`);
  },
};
