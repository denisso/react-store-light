import React from 'react';
import { Store } from './store';
import { IContext } from './types';
import { ISliceId } from './types';
import { formatError } from './helpers/error';
/**
 * Creates a Context.
 */
export const createContext = () => {
  const Context = React.createContext<IContext>(null as unknown as IContext);
  return Context;
};

/**
 * Creates a Provider
 *
 * The provider accepts multiple store instances and maps them by `sliceId`.
 * This allows different slices to coexist in the same React tree.
 *
 *  @param Context React Context
 */
export const createProvider = (Context: React.Context<IContext>) => {
  type Props = {
    children: React.ReactNode;
    value: Store<any>[];
  };

  const Provider = ({ children, value }: Props) => {
    const [context] = React.useState<IContext>(() => {
      const map = new Map<ISliceId, Store<any>>();
      for (const store of value) {
        if (store.sliceId !== null) {
          map.set(store.sliceId, store);
        } else {
          throw formatError['providerSliceIdNull']();
        }
      }

      return map;
    });

    return <Context.Provider value={context}>{children}</Context.Provider>;
  };
  return Provider;
};
