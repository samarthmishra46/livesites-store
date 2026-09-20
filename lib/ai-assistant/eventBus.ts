/** Minimal typed pub/sub used by assistant providers. */
export function createEventBus<Events extends object>() {
  const listeners = new Map<keyof Events, Set<(value: never) => void>>();
  return {
    on<K extends keyof Events>(event: K, cb: (value: Events[K]) => void) {
      const set = listeners.get(event) ?? new Set();
      set.add(cb as (value: never) => void);
      listeners.set(event, set);
      return () => void set.delete(cb as (value: never) => void);
    },
    emit<K extends keyof Events>(event: K, value: Events[K]) {
      listeners.get(event)?.forEach((cb) => (cb as (value: Events[K]) => void)(value));
    },
  };
}
