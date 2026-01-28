import React from 'react';
import { getAsyncValue, createAsync, runAsyncCallback } from './helpers';
import { UseStoreContext } from '../../helpers/use-store-context';
import type { IContext } from '../../types';
import type { IAsyncCallback } from './types';
import { useConnectListenersToStore } from '../../helpers/use-connect-listeners-to-store';

export class UseAsync<T extends object> extends UseStoreContext<T>{
  getContext: () => React.Context<IContext> | null;
  constructor(uniqId: object, Context: React.Context<IContext> | null) {
    super(uniqId)
    this.getContext = () => Context;
    this.getContext = this.getContext.bind(this);
    this.hook = this.hook.bind(this);
  }
  /**
   * Subscribes a component to a single async store field by key.
   *
   * Returns:
   * - dispatch: runs async callback
   * - value: current async state
   * - abort: break async callback and resets to {status: 'aborted', value: current; error: current;}
   *
   * @param key - name field in the store
   * @param callback - async callback
   * @param _Context - [optional] React Context
   */
  hook<Args extends unknown[], K extends keyof T>(
    key: K,
    cb: (...args: [...Args]) => IAsyncCallback<T, K>,
    Context?: React.Context<IContext>,
  ) {
    const store = super.getStore(
      'useAsynk',
      key as string,
      Context ? Context : this.getContext(),
    );
    const [value, setValue] = React.useState(getAsyncValue(store, key));

    const [dispatch] = React.useState<(...args: [...Args]) => void>(() => {
      return (...args: [...Args]): void => {
        runAsyncCallback(store, key, cb(...args));
      };
    });
    const [abort] = React.useState<() => void>(() => {
      return () => {
        return store.set(key, createAsync.aborted() as T[K]);
      };
    });

    useConnectListenersToStore(setValue as (value: T[K]) => void, key, store);

    return { dispatch, abort, value: value as T[K] };
  }
}
