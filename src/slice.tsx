import React from 'react';
import { createStore as _createStore } from 'observable-store-light';
import { IContext, IStoreApi } from './types';
import { createGetStoreByContext } from './helpers/get-store-by-context';
import { createUseAsync } from './async';
import { useConnectListenerstoStore } from './helpers/use-connect-listeners-to-store';

type Reducer<T extends object> = (store: IStoreApi<T>, ...args: any[]) => void;

export const createSlice = <T extends object, R extends Record<string, Reducer<IStoreApi<T>>> = {}>(
  Context: React.Context<IContext> | null,
  reducers?: R,
) => {
  // uniq id for store in context provider
  const uniqId = {};

  const createStore = (initState: T): IStoreApi<T> => {
    const store = _createStore<T>(initState) as IStoreApi<T>;
    store.uniqId = uniqId;
    return store;
  };

  type IArgs<K extends keyof T> = T[K] | ((prev: T[K]) => T[K]);

  const setStateProxy = <K extends keyof T>(store: IStoreApi<T>, key: K) => {
    return (arg: IArgs<K>) => {
      if (typeof arg === 'function') {
        return store.set(key, (arg as (prev: T[K]) => T[K])(store.get(key)));
      }
      store.set(key, arg);
    };
  };

  const getStoreByContext = createGetStoreByContext<T>(uniqId);

  const useState = <K extends keyof T>(
    key: K,
    _Context?: React.Context<IContext>,
  ): [T[K], (args: IArgs<K>) => void] => {
    const store = getStoreByContext(_Context ? _Context : Context);
    const [state, setState] = React.useState<T[K]>(store.get(key));
    const setStateRef = React.useRef<ReturnType<typeof setStateProxy<K>>>(null);
    if (setStateRef.current === null) {
      setStateRef.current = setStateProxy(store, key);
    }
    useConnectListenerstoStore(setState, key, store);

    return [state, setStateRef.current];
  };

  const useAsync = createUseAsync<T>(uniqId, Context);

  const useStore = (_Context?: React.Context<IContext>) => {
    const store = getStoreByContext(_Context ? _Context : Context);
    return store;
  };

  type DropFirstArg<F> = F extends (store: IStoreApi<T>, ...args: infer A) => void
    ? (...args: A) => void
    : never;

  type BindStoreReducers<R> = {
    [K in keyof R]: DropFirstArg<R[K]>;
  };

  const useReducer = (_Context?: React.Context<IContext>) => {
    const store = getStoreByContext(_Context ? _Context : Context);
    const bindStoreReducersRef = React.useRef<BindStoreReducers<R>>(null);

    if (!bindStoreReducersRef.current) {
      if (!reducers) {
        bindStoreReducersRef.current = {} as BindStoreReducers<R>;
        return bindStoreReducersRef.current;
      }
      const bindStoreReducers = {} as BindStoreReducers<R>;

      for (const key in reducers) {
        const fn = reducers[key];
        // save context "this" in function
        bindStoreReducers[key] = ((...args: any[]) =>
          fn(store, ...args)) as BindStoreReducers<R>[typeof key];
      }
      bindStoreReducersRef.current = bindStoreReducers;
    }

    return bindStoreReducersRef.current as BindStoreReducers<R>;
  };
  return { createStore, useState, useAsync, useReducer, useStore };
};
