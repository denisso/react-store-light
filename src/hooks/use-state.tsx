import React from 'react';
import type { IContext, IStore } from '../types';
import { UseStoreContext } from '../helpers/use-store-context';
import { useConnectListenersToStore } from '../helpers/use-connect-listeners-to-store';
type IArgs<T extends object, K extends keyof T> = T[K] | ((prev: T[K]) => T[K]);

// proxy method for set field in the store by key
const setStateProxy = <T extends object, K extends keyof T>(store: IStore<T>, key: K) => {
  return (arg: IArgs<T, K>) => {
    if (typeof arg === 'function') {
      return store.set(key, (arg as (prev: T[K]) => T[K])(store.get(key)));
    }
    store.set(key, arg);
  };
};

export class UseState<T extends object> extends UseStoreContext<T> {
  constructor(uniqId: object, Context: React.Context<IContext>) {
    super(uniqId, Context);
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
    const store = super.getStore('useState', key as string);
    const [state, setState] = React.useState<T[K]>(store.get(key));
    const [_setState] = React.useState<ReturnType<typeof setStateProxy<T, K>>>(() => {
      return setStateProxy(store, key);
    });

    useConnectListenersToStore(setState, key, store);

    return [state, _setState];
  }
}
