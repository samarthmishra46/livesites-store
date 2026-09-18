"use client";

import { useSyncExternalStore } from "react";

type Updater<T> = T | ((prev: T) => T);

export interface Store<T> {
  get: () => T;
  set: (next: Updater<T>) => void;
  subscribe: (listener: () => void) => () => void;
  getServerSnapshot: () => T;
}

interface StoreOptions<T> {
  /** localStorage key. Omit for in-memory UI state. */
  persistKey?: string;
  /** Validates persisted data; return null to fall back to the initial value. */
  parse?: (value: unknown) => T | null;
}

/**
 * Tiny external store. Server render and hydration use `initial`; the client then
 * switches to the persisted value, so there is never a hydration mismatch.
 */
export function createStore<T>(initial: T, { persistKey, parse }: StoreOptions<T> = {}): Store<T> {
  let state = initial;
  let loaded = !persistKey;
  const listeners = new Set<() => void>();

  const load = () => {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    try {
      const raw = window.localStorage.getItem(persistKey!);
      if (raw != null) {
        const value = JSON.parse(raw) as unknown;
        state = parse ? (parse(value) ?? initial) : (value as T);
      }
    } catch {
      state = initial;
    }
  };

  const emit = () => listeners.forEach((l) => l());

  const onStorage = (e: StorageEvent) => {
    if (e.key !== persistKey) return;
    loaded = false;
    load();
    emit();
  };

  return {
    get: () => {
      load();
      return state;
    },
    set: (next) => {
      load();
      state = typeof next === "function" ? (next as (prev: T) => T)(state) : next;
      if (persistKey) {
        try {
          window.localStorage.setItem(persistKey, JSON.stringify(state));
        } catch {
          // storage full or unavailable (private mode) — keep in-memory state
        }
      }
      emit();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      if (persistKey && listeners.size === 1) window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(listener);
        if (persistKey && listeners.size === 0) window.removeEventListener("storage", onStorage);
      };
    },
    getServerSnapshot: () => initial,
  };
}

export function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.getServerSnapshot);
}
