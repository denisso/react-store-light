import React from 'react';
import { createStore as _createStore} from 'observable-store-light';
import { IContext, IStoreApi } from './types';
import { getStoreByContextFactory } from './helpers/get-store-by-context';
import { useSelectorAsyncFactory } from './async';
import { useConnectListenerstoStore } from './helpers/use-connect-listeners-to-store';

export const createSlice = <T extends object>() => {
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

  const getStoreByContext = getStoreByContextFactory<T>(uniqId);

  const useSelector = <K extends keyof T>(
    Context: React.Context<IContext>,
    key: K,
  ): [T[K], (args: IArgs<K>) => void] => {
    const store = getStoreByContext(Context);
    const [state, setState] = React.useState<T[K]>(store.get(key));
    const setStateRef = React.useRef<ReturnType<typeof setStateProxy<K>>>(null);
    if (setStateRef.current === null) {
      setStateRef.current = setStateProxy(store, key);
    }
    useConnectListenerstoStore(setState, key, store);

    return [state, setStateRef.current];
  };

  const useSelectorAsync = useSelectorAsyncFactory<T>(uniqId);

  const useStore = (Context: React.Context<IContext>) => {
    const store = getStoreByContext(Context);
    return store;
  };

  return { createStore, useSelector, useSelectorAsync, useStore };
};
