import React from 'react';
import { Store, Listener } from '../store';
import { Aliases } from '../aliases';

export function useState<T extends Record<string, any>, K extends keyof T>(
  aliases: Aliases<T>,
  key: K,
): T[K];

export function useState<T extends object, K extends keyof T>(store: Store<T>, key: K): T[K];

/**
 * Subscribes a component to a single store field by key.
 *
 * Returns:
 * - analog [value, setValue] = React.useState
 *
 * @param store - Store<T> | IContextValueId<Store<T>>
 * @param key - name field in the store
 */
export function useState<T extends Record<string, any>, K extends keyof T>(
  stateHolder: Store<T> | Aliases<T>,
  key: K,
): T[K] {
  const [args] = React.useState(() => {
    return {
      getSnapshot() {
        return stateHolder.get(key);
      },

      subscribe(listener: Listener<T, K>) {
        return stateHolder.subscribe(key, listener);
      },
    };
  });
  const state = React.useSyncExternalStore(args.subscribe, args.getSnapshot) as T[K];
  return state;
}
