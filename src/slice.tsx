import React from 'react';
import { createStore as _createStore } from 'observable-store-light';
import { IContext, IStore, ISubStore, IReducers } from './types';
import { useConnectListenersToStore } from './helpers/use-connect-listeners-to-store';
import { UseStoreContext } from './helpers/use-store-context';
import { UseAsync, UseReducer, UseState } from './hooks';

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
 * @param reducers - [optional] object with reducers, reducers are created once and cached. signature reducer object {[key:string]: (store, ...custom args) => void}
 */
export const createSlice = <T extends object, R extends IReducers<T> = {}>(
  Context: React.Context<IContext>,
  reducers?: R,
) => {
  // uniq id for store in context provider
  const uniqId = {};

  // get store by context
  const useStoreContext = new UseStoreContext<T>(uniqId, Context).getStore;

  const mapSates = new Map<T, Set<IStore<T>>>();

  class Slice {
    /**
     * Creates a store instance and attaches uniqId,
     * so the Provider can register it in Context.
     *
     * Returns:
     * - store with type IStore\<T>
     *
     * @param initState - Initial store state
     * @param isMutateState - [optional] is mutate initState
     */
    createStore(initState: T, isMutateState?: boolean): IStore<T> {
      const store = _createStore<T>(initState, isMutateState) as IStore<T>;
      store.uniqId = uniqId;
      return store;
    }
    /**
     * Creates a store instance for build tree stores,
     *
     * Returns:
     * - store with type IStore\<T>
     *
     * @param initState - Initial store state
     */
    createSubStore(initState: T): ISubStore<T> {
      const store = _createStore<T>(initState, true) as ISubStore<T>;
      store.uniqId = uniqId;
      const setState = store.setState.bind(store);
      const set = store.set.bind(store);
      const setStores = mapSates.get(initState);
      if (setStores) {
        setStores.add(store);
      } else {
        mapSates.set(initState, new Set([store]));
      }
      store.set = <K extends keyof T>(key: K, value: T[K]) => {
        set(key, value);
        const state = store.getState();
        const setStores = mapSates.get(state);
        for (const _store of setStores ?? []) {
          if (_store !== store) {
            _store.setState(state);
          }
        }
      };
      store.setState = (state: T) => {
        const prevState = store.getState();
        setState(state, true);
        const setStores = mapSates.get(state);
        if (prevState !== state) {
          mapSates.delete(prevState);
        }

        if (setStores) {
          for (const _store of setStores) {
            if (!_store.isStateActual() && _store !== store) {
              _store.setState(state);
            }
          }
          setStores.add(store);
          mapSates.set(state, setStores);
        } else {
          mapSates.set(state, new Set([store]));
        }
      };

      store.unLinkState = (hard: boolean = true) => {
        const state = store.getState();
        const setStores = mapSates.get(state);
        if (setStores) {
          setStores.delete(store);
          if (setStores.size === 0) {
            mapSates.delete(state);
          }
        }
        if (hard) {
          setState(Object.assign({}, state));
        }
      };
      return store;
    }

    useAsync = new UseAsync<T>(uniqId, Context).hook;

    useState = new UseState<T>(uniqId, Context).hook;

    useReducer = new UseReducer<T, R>(uniqId, Context, reducers).hook;

    /**
     * Returns the store instance directly.
     *
     * @param _Context - [optional] React Context
     */
    useStore() {
      const store = useStoreContext('useStore', null);
      return store;
    }
  }

  const slice = new Slice();
  return slice;
};
