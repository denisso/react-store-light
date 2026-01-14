import React from 'react';
import { IStoreApi } from '../types';

export const useConnectListenerstoStore = <T extends object, K extends keyof T>(
  setValue: (value: T[K]) => void,
  key: K,
  store: IStoreApi<T>,
) => {
  React.useEffect(() => {
    const listener = (_: string, value: T[K]) => {
      setValue(value);
    };
    store.addListener(key, listener);
    return () => {
      store.removeListener(key, listener);
    };
  }, [setValue, key, store]);
};
