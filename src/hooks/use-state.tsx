import React from 'react';
import { Store, Listener } from '../store';
import { useStore } from './use-store';
import type { IContextValueId } from '../types';

type IArgs<T extends object, K extends keyof T> = T[K] | ((prev: T[K]) => T[K]);

export function useState<T extends object, K extends keyof T>(
  contextValueId: IContextValueId<Store<T>>,
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
export function useState<T extends object, K extends keyof T>(
  storeOrId: Store<T> | IContextValueId<Store<T>>,
  key: K,
): T[K] {
  const store = typeof storeOrId === 'symbol' ? useStore(storeOrId) : storeOrId;
  const [args] = React.useState(() => {
    return {
      getSnapshot() {
        return store.get(key);
      },

      subscribe(listener: Listener<T, K>) {
        const remove = store.addListener(key, listener);
        return () => remove();
      },
    };
  });
  const state = React.useSyncExternalStore(args.subscribe, args.getSnapshot);
  return state;
}
