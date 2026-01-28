import React from 'react';
import { IStore } from '../types';

/**
 * Connect listeners to store
 * 
 * @param setValue - React.useState - setter
 * @param key - store key
 * @param store - IStore<T>  
 */
export const useConnectListenersToStore = <T extends object, K extends keyof T>(
  setValue: (value: T[K]) => void,
  key: K,
  store: IStore<T>,
) => {
  React.useEffect(() => {
    const listener = (_: K, value: T[K]) => {
      setValue(value);
    };
    store.addListener(key, listener);
    return () => {
      store.removeListener(key, listener);
    };
  }, [setValue, key, store]);
};
