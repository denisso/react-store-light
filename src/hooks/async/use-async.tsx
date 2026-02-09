import React from 'react';
import { getAsyncValue, createAsync, runAsyncCallback } from './helpers';
import type { IAsyncCallback } from './types';
import { Store } from '../../store';
import { useConnectListenersToStore } from '../../helpers/use-connect-listeners-to-store';

export const useAsync = <T extends object, Args extends unknown[], K extends keyof T>(
  store: Store<T>,
  key: K,
  cb: (...args: [...Args]) => IAsyncCallback<T, K>,
) => {
  const [value, setValue] = React.useState(getAsyncValue<T, K>(store, key));

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
};