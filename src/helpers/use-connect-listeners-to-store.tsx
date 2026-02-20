import React from 'react';
import { Store } from '../store';

/**
 * Connect listeners to store
 *
 * @param setValue - React.useState - setter
 * @param key - store key
 * @param store - IStore<T>
 */
export const useConnectListenersToStore = (store: Store<any>, key: string) => {
  const setState = () => {
    setResult([store.get(key)]);
  };
  const [result, setResult] = React.useState([store.get(key)]);

  React.useEffect(() => {
    store.addListener(key, setState);
    return () => {
      store.removeListener(key, setState);
    };
  }, [setState, key, store]);
  return result;
};
