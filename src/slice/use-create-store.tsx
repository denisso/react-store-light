import React from 'react';
import { Slice } from './slice';

/**
 * Hook for create store in React Component
 * 
 * @param ref T
 * @param slice Slice<T>
 * @returns SliceStoreNode<T>
 */
export const useCreateStore = <T extends object>(ref: T, slice: Slice<T>) => {
  const [store] = React.useState(() => {
    return slice.createStore(ref);
  });

  React.useEffect(() => {
    slice.mountStore(store, ref, store.getRef());
    return () => {
      slice.unMountStore(store, store.getRef());
    };
  }, [ref, store]);
  return store;
};
