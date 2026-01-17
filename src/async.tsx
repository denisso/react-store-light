import React from 'react';
import { ErrorMessages, ErrorWithMessage } from './helpers/error';
import type { IContext, IStoreApi } from './types';
import { useConnectListenerstoStore } from './helpers/use-connect-listeners-to-store';

type DispatchStatus = 'init' | 'pending' | 'fulfilled' | 'rejected' | 'abort';

/**
 * Discriminated union describing an async state:
 * - init: initial value
 * - pending: request in progress
 * - fulfilled: request succeeded
 * - rejected: request failed
 */
export type IAsync<T, E = any> =
  | {
      status: 'init';
      value: T | null;
      error: null;
    }
  | {
      status: 'pending';
      value: null;
      error: null;
    }
  | { status: 'fulfilled'; value: T; error: null }
  | { status: 'rejected'; value: null; error: E }
  | { status: 'abort'; value: T | null; error: E | null };

/**
 * Extracts the value type from IAsync
 */
export type IAsyncValue<T> = [T] extends [IAsync<infer Val, unknown>] ? Val : never;
/**
 * Extracts the error type from IAsync
 */
export type IAsyncError<T> = [T] extends [IAsync<unknown, infer Err>] ? Err : never;
/**
 * Creates an initial async state
 */
export function asyncInit<T>(value: T): IAsync<T, never> {
  return { status: 'init', value, error: null };
}
/**
 * Creates a pending async state
 */
export function asyncPending(): IAsync<never, never> {
  return { status: 'pending', value: null, error: null };
}
/**
 * Creates a fulfilled async state
 */
export function asyncFulfilled<T>(value: T): IAsync<T, never> {
  return { status: 'fulfilled', value, error: null };
}
/**
 * Creates a rejected async state
 */
export function asyncError<T>(error: T): IAsync<never, T> {
  return { status: 'rejected', value: null, error };
}

/**
 * Wraps a Promise executor into a Promise that always resolves
 * with an IAsync structure instead of throwing
 */
export const createPromise = <T extends IAsync<unknown, unknown>>(
  cb: (resolve: (arg: IAsyncValue<T>) => void, reject: (arg: IAsyncError<T>) => void) => void,
): Promise<IAsync<IAsyncValue<T>, IAsyncError<T>>> => {
  return new Promise((resolve) => {
    new Promise<IAsyncValue<T>>(cb)
      .then((value) => {
        resolve(asyncFulfilled(value));
      })
      .catch((error) => {
        resolve(asyncError(error));
      });
  });
};

const statusAsyncSet = new Set<DispatchStatus>([
  'init',
  'pending',
  'fulfilled',
  'rejected',
  'abort',
]);

function isAsync(item: unknown): item is IAsync<unknown, unknown> {
  const _item = item as IAsync<unknown, unknown>;
  return (
    _item instanceof Object &&
    _item.hasOwnProperty('value') &&
    _item.hasOwnProperty('error') &&
    _item.hasOwnProperty('status') &&
    statusAsyncSet.has(_item.status)
  );
}

function getAsyncValueByKey<P>(value: P) {
  if (!isAsync(value)) {
    throw ErrorWithMessage(ErrorMessages['isNotAsync']);
  }
  return value;
}

export function useAsync<T extends object, Args extends unknown[], K extends keyof T>(
  key: K,
  cb: (...args: [...Args]) => Promise<T[K]>,
  store: IStoreApi<T>,
  _Context?: React.Context<IContext>,
) {
  const [value, setValue] = React.useState(getAsyncValueByKey(store.get(key)));
  const refDispatch = React.useRef<(...args: [...Args]) => void>(null);
  const refAbort = React.useRef<() => void>(() => {
    store.set(key, asyncInit(store.get(key)) as T[K]);
  });
  useConnectListenerstoStore(setValue as (value: T[K]) => void, key, store);

  if (!refDispatch.current) {
    const dispatch = (...args: [...Args]): void => {
      // It is necessary that there was no race
      const val = getAsyncValueByKey(store.get(key));
      if (val.status == 'pending') {
        return;
      }

      store.set(key, asyncPending() as T[K]);

      ((_uniq) => {
        cb(...args)
          .then((result) => {
            if (_uniq === store.get(key)) {
              store.set(key, result);
            }
          })
          .catch((error) => {
            // just in case
            if (_uniq === store.get(key)) {
              store.set(key, error);
            }
          });
      })(store.get(key));
    };
    refDispatch.current = dispatch;
  }

  return { dispatch: refDispatch.current, abort: refAbort.current, value: value as T[K] };
}
