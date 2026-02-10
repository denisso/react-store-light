import React from 'react';
import { HubStore, Hub } from './hub';

type HubStoreCtor<T extends object, S extends HubStore<T>> = new (ref: T) => S;

/**
 * Hook for create store in React Component
 *
 * @param ref T
 * @param hub Hub<T>
 * @param CustomHubStore S extends HubStore<T> [optional]
 * @returns HubStore<T>
 */
export const useCreateHubStore = <T extends object, S extends HubStore<T>>(
  ref: T,
  hub: Hub<T>,
  CustomHubStore?: HubStoreCtor<T, S>,
) => {
  const [store] = React.useState(() => {
    if (CustomHubStore) {
      return new CustomHubStore(ref);
    }
    return new HubStore(ref);
  });

  React.useEffect(() => {
    hub.mountStore(store, ref);
    return () => {
      hub.unMountStore(store);
    };
  }, [ref, store]);
  return store;
};
