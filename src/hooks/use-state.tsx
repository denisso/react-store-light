import React from 'react';
import { Store } from '../store';
import { useConnectListenersToStore } from '../helpers/use-connect-listeners-to-store';

type IArgs<T extends object, K extends keyof T> = T[K] | ((prev: T[K]) => T[K]);

// proxy method for set field in the store by key
const setStateProxy = <T extends object, K extends keyof T>(store: Store<T>, key: K) => {
  return (arg: IArgs<T, K>) => {
    if (typeof arg === 'function') {
      return store.set(key, (arg as (prev: T[K]) => T[K])(store.get(key)));
    }
    store.set(key, arg);
  };
};
  /**
   * Subscribes a component to a single store field by key.
   *
   * Returns:
   * - analog [value, setValue] = React.useState
   * 
   * @param store - Store<T>
   * @param key - name field in the store
   */
export const useState = <T extends object, K extends keyof T>(
  store: Store<T>,
  key: K,
): [T[K], (args: IArgs<T, K>) => void] => {
  const [state, setState] = React.useState<T[K]>(store.get(key));
  const [_setState] = React.useState<ReturnType<typeof setStateProxy<T, K>>>(() => {
    return setStateProxy<T, K>(store, key);
  });

  useConnectListenersToStore(setState, key, store);

  return [state, _setState];
};

