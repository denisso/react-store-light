import React from 'react';
import { Store, Listener } from '../store';
import { Aliases } from '../aliases';
export function useState<T extends Record<string, any>, K extends keyof T>(
  aliases: Aliases<T>,
  key: K,
): T[K];

export function useState<T extends Record<string, any>, K extends keyof T, R>(
  aliases: Aliases<T>,
  key: K,
  cb: (value: T[K]) => R,
): R;

export function useState<T extends object, K extends keyof T>(store: Store<T>, key: K): T[K];

export function useState<T extends object, K extends keyof T, R>(
  store: Store<T>,
  key: K,
  cb: (value: T[K]) => R,
): R;
/**
 * Subscribes a component to a single store field by key.
 *
 * Returns:
 * - analog [value, setValue] = React.useState
 *
 * @param store - Store<T> | IContextValueId<Store<T>>
 * @param key - name field in the store
 */
export function useState<T extends Record<string, any>, K extends keyof T, R = T[K]>(
  stateHolder: Store<T> | Aliases<T>,
  key: K,
  transform?: (value: T[K]) => R,
): R {
  const [args] = React.useState(() => {
    return {
      getSnapshot() {
        try {
          return stateHolder.get(key);
        } catch {}
      },

      subscribe(listener: Listener<T, K>) {
        return stateHolder.subscribe(key, listener);
      },
    };
  });

  const state = React.useSyncExternalStore(args.subscribe, args.getSnapshot) as T[K];

  const [result] = React.useState(() => {
    return { result: transform ? transform(state) : (state as unknown as R), state };
  });
  if (result.state !== state) {
    result.result = transform ? transform(state) : (state as unknown as R);
    result.state = state;
  }
  return result.result;
}
