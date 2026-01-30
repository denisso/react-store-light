import React from 'react';
import { Store } from '../store';
import type { IContext } from '../types';
import { UseStoreContext } from '../helpers/use-store-context';
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

export class UseState<T extends object> extends UseStoreContext<T> {
  constructor(sliceId: object, Context: React.Context<IContext>) {
    super(sliceId, Context);
    this.hook = this.hook.bind(this);
  }
  /**
   * Subscribes a component to a single store field by key.
   *
   * Returns:
   * - analog [value, setValue] = React.useState
   *
   * @param key - name field in the store
   */
  hook<K extends keyof T>(key: K): [T[K], (args: IArgs<T, K>) => void] {
    const store = super.getStore();
    const [state, setState] = React.useState<T[K]>(store.get(key));
    const [_setState] = React.useState<ReturnType<typeof setStateProxy<T, K>>>(() => {
      return setStateProxy<T, K>(store, key);
    });

    useConnectListenersToStore(setState, key, store);

    return [state, _setState];
  }
}
