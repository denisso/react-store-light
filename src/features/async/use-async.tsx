import React from 'react';
import { getAsyncValue, createAsync, runAsyncCallback } from './helpers';
import { UseStoreContext } from '../../helpers/use-store-context';
import type { IContext, IStore } from '../../types';
import type { IAsyncCallback } from './types';
import { useConnectListenerstoStore } from '../../helpers/use-connect-listeners-to-store';

export class UseAsync<T extends object> {
  useStoreContext: (
    hook: string,
    key: string | null,
    Context?: React.Context<IContext> | null,
  ) => IStore<T>;
  getContext: () => React.Context<IContext> | null;

  constructor(uniqId: object, Context: React.Context<IContext> | null) {
    this.useStoreContext = new UseStoreContext<T>(uniqId).hook.bind(this);
    this.getContext = () => Context;
    this.getContext = this.getContext.bind(this);
    this.hook = this.hook.bind(this);
  }

  hook<Args extends unknown[], K extends keyof T>(
    key: K,
    cb: (...args: [...Args]) => IAsyncCallback<T, K>,
    Context?: React.Context<IContext>,
  ) {
    const store = this.useStoreContext(
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

    useConnectListenerstoStore(setValue as (value: T[K]) => void, key, store);

    return { dispatch, abort, value: value as T[K] };
  }
}
