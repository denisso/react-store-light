import React from 'react';
import { getAsyncValue, createAsync, runAsyncCallback } from './helpers';
import type { IAsyncCallback } from './types';
import { Store } from '../../store';
import { useConnectListenersToStore } from '../../helpers/use-connect-listeners-to-store';
import type { IContextValueId } from '../../types';
import { useStore } from '../use-store';

export function useAsync<T extends object, Args extends unknown[], K extends keyof T>(
  id: IContextValueId<Store<T>>,
  key: K,
  cb: (...args: [...Args]) => IAsyncCallback<T, K>,
): {
  dispatch: (...args: Args) => void;
  abort: () => void;
  value: T[K];
};

export function useAsync<T extends object, Args extends unknown[], K extends keyof T>(
  store: Store<T>,
  key: K,
  cb: (...args: [...Args]) => IAsyncCallback<T, K>,
): {
  dispatch: (...args: Args) => void;
  abort: () => void;
  value: T[K];
};

/**
 * Subscribes a component to a single async store field by key.
 *
 * Returns:
 * - dispatch: runs async callback
 * - value: current async state
 * - abort: break async callback and resets to {status: 'aborted', value: current; error: current;}
 *
 * @param store - Store<T>
 * @param key - name field in the store
 * @param cb - async callback
 */
export function useAsync<T extends object, Args extends unknown[], K extends keyof T>(
  storeOrId: Store<T> | IContextValueId<Store<T>>,
  key: K,
  cb: (...args: [...Args]) => IAsyncCallback<T, K>,
): {
  dispatch: (...args: Args) => void;
  abort: () => void;
  value: T[K];
} {
  const store = typeof storeOrId === 'symbol' ? useStore(storeOrId) : storeOrId;

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

  const [value] = useConnectListenersToStore(store, key as string);

  return { dispatch, abort, value: value as T[K] };
}
