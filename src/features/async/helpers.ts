import type { IAsync, IAsyncCallback, IAsyncValue, IDispatchStatus } from './types';
import type { IStore } from '../../types';
import { formatError } from '../../helpers/error';

function asyncInitial<T>(value: T): IAsync<T, never> {
  return { status: 'initial', value, error: null };
}
/**
 * Creates a pending async state
 */
function asyncPending(): IAsync<never, never> {
  return { status: 'pending', value: null, error: null };
}
/**
 * Creates a fulfilled async state
 */
function asyncFulfilled<T>(value: T): IAsync<T, never> {
  return { status: 'fulfilled', value, error: null };
}
/**
 * Creates a rejected async state
 */
function asyncRejected<T>(error: T): IAsync<never, T> {
  return { status: 'rejected', value: null, error };
}

/**
 * Creates a aborted async state
 */
function asyncAborted(): IAsync<never, never> {
  return { status: 'aborted', value: null, error: null };
}

export const createAsync = {
  initial: asyncInitial,
  pending: asyncPending,
  fulfilled: asyncFulfilled,
  rejected: asyncRejected,
  aborted: asyncAborted,
};


/**
 * Runs an asynchronous callback associated with a specific store key
 * and manages its async lifecycle state.
 *
 * Behavior:
 * - If the current async value is already in `pending` state,
 *   the function immediately resolves with the existing value
 *   to prevent duplicate executions.
 * - Otherwise, the state is switched to `pending` before executing
 *   the callback.
 * - On successful resolution, the state is updated to `fulfilled`
 *   only if the value has not been changed externally in the meantime.
 * - On rejection, the state is updated to `rejected` under the same condition.
 *
 * This comparison (`prev === store.get(key)`) protects against race conditions
 * when multiple async operations are triggered for the same key.
 *
 * @typeParam T - Store state shape
 * @typeParam K - Key of the async field in the store
 * @param store - Store API instance
 * @param key - Store key associated with the async value
 * @param cb - Asynchronous callback that performs the async operation
 * @returns - A promise resolving to the resulting async value
 */
export const runAsyncCallback = async <T extends object, K extends keyof T>(
  store: IStore<T>,
  key: K,
  cb: IAsyncCallback<T, K>,
) => {
  const val = getAsyncValue(store, key);
  if (val.status == 'pending') {
    return Promise.resolve(val);
  }

  store.set(key, asyncPending() as T[K]);

  const prev = store.get(key);

  return new Promise<IAsyncValue<T[K]>>((resolve, reject) => {
    cb(store, resolve, reject);
  })
    .then((result) => {
      if (prev === store.get(key)) {
        store.set(key, asyncFulfilled(result) as T[K]);
      }
      return asyncFulfilled(result);
    })
    .catch((error) => {
      if (prev === store.get(key)) {
        store.set(key, asyncRejected(error) as T[K]);
      }
      return asyncRejected(error);
    });
};

const statusAsyncSet = new Set<IDispatchStatus>([
  'initial',
  'pending',
  'fulfilled',
  'rejected',
  'aborted',
]);

/**
 * Type guard that checks whether a value conforms to the `IAsync` structure.
 *
 * The function performs a runtime shape check:
 * - ensures the value is an object
 * - verifies presence of `value`, `error`, and `status` properties
 * - validates that `status` is one of the allowed async states
 *
 * @param item Any value to check
 * @returns `true` if the value is an `IAsync` object, otherwise `false`
 */
export function isAsync(item: unknown): item is IAsync<unknown, unknown> {
  const _item = item as IAsync<unknown, unknown>;
  return (
    _item instanceof Object &&
    _item.hasOwnProperty('value') &&
    _item.hasOwnProperty('error') &&
    _item.hasOwnProperty('status') &&
    statusAsyncSet.has(_item.status)
  );
}

export function getAsyncValue<T extends object, K extends keyof T>(store: IStore<T>, key: K) {
  const value = store.get(key);
  if (!isAsync(value)) {
    throw formatError['isNotAsync'](key as string);
  }
  return value;
}