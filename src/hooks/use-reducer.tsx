import React from 'react';
import { Store } from '../store';

/**
 * Reducer function.
 * Mutates the store.
 * The first argument is always the store instance,
 * the rest are user-defined arguments.
 */
export type IReducer<T extends object> = (...args: any[]) => (store: Store<T>) => void;

/**
 * Type from record reducers
 */
export type IReducers<T extends object> = Record<string, IReducer<T>>;

type ReducerArgsFn<R> = R extends (...args: infer A) => (store: Store<any>) => void
  ? (...args: A) => void
  : never;

type BindStoreReducers<R> = {
  [K in keyof R]: ReducerArgsFn<R[K]>;
};
  /**
   * Returns reducers already bound to the store.
   * Reducers are created once and cached.
   *
   * @param store - Store<T>
   * @param argReducers - reducers
   * @return Record reducers
   */
export const useReducer = <T extends object, R extends IReducers<T>>(
  store: Store<T>,
  argReducers: R,
) => {
  const [reducersState] = React.useState(() => {
    const reducersDict = {} as BindStoreReducers<R>;
    if (!argReducers) {
      return reducersDict;
    }
    for (const key in argReducers) {
      const fn = argReducers[key];
      reducersDict[key] = ((...args: Parameters<typeof fn>) => {
        fn(...args)(store);
      }) as BindStoreReducers<R>[typeof key];
    }
    return reducersDict;
  });
  return reducersState;
};
