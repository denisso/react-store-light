import React from 'react';
import { Slice } from './slice';

/**
 * Hook for create store in React Component
 * 
 * @param state T
 * @param slice Slice<T>
 * @returns SliceStoreNode<T>
 */
export const useCreateStore = <T extends object>(state: T, slice: Slice<T>) => {
  const [store] = React.useState(() => {
    return slice.createStore(state);
  });

  React.useEffect(() => {
    slice.mountStore(store, state, store.getRef());
    return () => {
      slice.unMountStore(store, store.getRef());
    };
  }, [state, store]);
  return store;
};
