import { Store } from "../../store";

export type IDispatchStatus = 'initial' | 'pending' | 'fulfilled' | 'rejected' | 'aborted';

/**
 * Discriminated union describing an async state:
 * - init: initial value
 * - pending: request in progress
 * - fulfilled: request succeeded
 * - rejected: request failed
 */
export type IAsync<T, E = any> =
  | {
    status: 'initial';
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
  | { status: 'aborted'; value: null; error: null };

/**
 * Extracts the value type from IAsync
 */
export type IAsyncValue<T> = [T] extends [IAsync<infer Val, unknown>] ? Val : never;

/**
 * Extracts the error type from IAsync
 */
export type IasyncRejected<T> = [T] extends [IAsync<unknown, infer Err>] ? Err : never;

/**
 * Wraps a Promise executor into a Promise that always resolves
 * with an IAsync structure instead of throwing
 */
export interface IAsyncCallback<T extends object, K extends keyof T> {
  (
    store: Store<T>,
    resolve: (arg: IAsyncValue<T[K]> | PromiseLike<IAsyncValue<T[K]>>) => void,
    reject: (arg: IasyncRejected<T[K]>) => void,
  ): void;
}