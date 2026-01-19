import React from 'react';
import { createStore as _createStore } from 'observable-store-light';
import { IContext, IStoreApi } from './types';
import { ErrorMessages, ErrorWithMessage } from './helpers/error';
import { useAsync as _useAsync, type IAsyncCallback } from './async';
import { useConnectListenerstoStore } from './helpers/use-connect-listeners-to-store';

/**
 * Reducer function.
 * Mutates the store.
 * The first argument is always the store instance,
 * the rest are user-defined arguments.
 */
type IReducer<T extends object> = (...args: any[]) => (store: IStoreApi<T>) => void;

/**
 * Creates an isolated slice definition with Store type and reducers.
 *
 * Returns:
 * - createStore - creates a store instance with uniq id for this slice.
 * - useState - subscribes a component to a single store field by key.
 * - useAsync - subscribes a   component to a single **async store field** by key.
 * - useReducer - returns registered reducers
 * - useStore - returns the store for imperative access.
 *
 * @param Context - React Context or null, if the Context is null, it will need to be specified in each hook.
 * @param reducers - object with reducers, reducers are created once and cached. signature reducer object {[key:string]: (store, ...custom args) => void}
 */
export const createSlice = <T extends object, R extends Record<string, IReducer<T>> = {}>(
  Context: React.Context<IContext> | null,
  reducers?: R,
) => {
  // uniq id for store in context provider
  const uniqId = {};

  type IArgs<K extends keyof T> = T[K] | ((prev: T[K]) => T[K]);

  // proxy method for set field in the store by key
  const setStateProxy = <K extends keyof T>(store: IStoreApi<T>, key: K) => {
    return (arg: IArgs<K>) => {
      if (typeof arg === 'function') {
        return store.set(key, (arg as (prev: T[K]) => T[K])(store.get(key)));
      }
      store.set(key, arg);
    };
  };

  // get store by Context and uniqId
  const useStoreByContext = (Context?: React.Context<IContext> | null) => {
    if (!Context) {
      throw ErrorWithMessage(ErrorMessages['context']);
    }
    const context = React.useContext(Context) as IContext;
    const store = context.get(uniqId) as IStoreApi<T>;
    if (!store) {
      throw ErrorWithMessage(ErrorMessages['context']);
    }
    return store;
  };

  type ReducerArgsFn<R> = R extends (...args: infer A) => (store: IStoreApi<any>) => void
    ? (...args: A) => void
    : never;

  type BindStoreReducers<R> = {
    [K in keyof R]: ReducerArgsFn<R[K]>;
  };

  class Slice {
    /**
     * Creates a store instance and attaches uniqId,
     * so the Provider can register it in Context.
     *
     * Returns:
     * - store with type IStoreAPI\<T>
     *
     * @param data - data for store
     */
    createStore(data: T): IStoreApi<T> {
      const store = _createStore<T>(data) as IStoreApi<T>;
      store.uniqId = uniqId;
      return store;
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
     * @param _Context - optional React Context
     */
    useAsync<Args extends unknown[], K extends keyof T>(
      key: K,
      callback: (...args: [...Args]) => IAsyncCallback<T, K>,
      _Context?: React.Context<IContext>,
    ) {
      const store = useStoreByContext(_Context ? _Context : Context);
      return _useAsync(key, callback, store);
    }

    /**
     * Subscribes a component to a single store field by key.
     *
     * Returns:
     * - analog [value, setValue] = React.useState
     *
     * @param key - name field in the store
     * @param _Context - optional React Context
     */
    useState<K extends keyof T>(
      key: K,
      _Context?: React.Context<IContext>,
    ): [T[K], (args: IArgs<K>) => void] {
      const store = useStoreByContext(_Context ? _Context : Context);
      const [state, setState] = React.useState<T[K]>(store.get(key));
      const setStateRef = React.useRef<ReturnType<typeof setStateProxy<K>>>(null);
      if (setStateRef.current === null) {
        setStateRef.current = setStateProxy(store, key);
      }
      useConnectListenerstoStore(setState, key, store);

      return [state, setStateRef.current];
    }

    /**
     * Returns reducers already bound to the store.
     * Reducers are created once and cached.
     * @param _Context - optional React Context
     */

    useReducer(_Context?: React.Context<IContext>) {
      const store = useStoreByContext(_Context ? _Context : Context);
      const bindStoreReducersRef = React.useRef<BindStoreReducers<R>>(null);

      if (!bindStoreReducersRef.current) {
        if (!reducers) {
          bindStoreReducersRef.current = {} as BindStoreReducers<R>;
          return bindStoreReducersRef.current;
        }
        const bindStoreReducers = {} as BindStoreReducers<R>;

        for (const key in reducers) {
          const fn = reducers[key];
          bindStoreReducers[key] = ((...args: Parameters<typeof fn>) => {
            fn(...args)(store);
          }) as BindStoreReducers<R>[typeof key];
        }
        bindStoreReducersRef.current = bindStoreReducers;
      }

      return bindStoreReducersRef.current as BindStoreReducers<R>;
    }

    /**
     * Returns the store instance directly.
     * @param _Context - optional React Context
     */
    useStore(_Context?: React.Context<IContext>) {
      const store = useStoreByContext(_Context ? _Context : Context);
      return store;
    }
  }

  const slice = new Slice();
  return slice;
};
