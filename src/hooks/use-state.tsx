import React from 'react';
import { Store } from '../store';
import { useConnectListenersToStore } from '../helpers/use-connect-listeners-to-store';
import { useStore } from './use-store';
import type { IContextValueId } from '../types';

type IArgs<T extends object, K extends keyof T> = T[K] | ((prev: T[K]) => T[K]);

export function useState<T extends object, S extends object, K extends keyof S>(
  contextValueId: IContextValueId<Store<T, S>>,
  key: K,
): [S[K], (args: IArgs<S, K>) => void];

export function useState<T extends object, S extends object, K extends keyof S>(
  store: Store<T, S>,
  key: K,
): [S[K], (args: IArgs<S, K>) => void];

/**
 * Subscribes a component to a single store field by key.
 *
 * Returns:
 * - analog [value, setValue] = React.useState
 *
 * @param store - Store<T> | IContextValueId<Store<T>>
 * @param key - name field in the store
 */
export function useState<T extends object, S extends object, K extends keyof S>(
  storeOrId: Store<T, S> | IContextValueId<Store<T, S>>,
  key: K,
): [S[K], (args: IArgs<S, K>) => void] {
  const store = typeof storeOrId === 'symbol' ? useStore(storeOrId) : storeOrId;

  const [_setState] = React.useState(() => (arg: IArgs<S, K>) => {
    if (arg instanceof Function) {
      return store.set(key, arg(store.get(key)));
    }
    store.set(key, arg);
  });

  const [state] = useConnectListenersToStore(store, key as string);

  return [state, _setState];
}
