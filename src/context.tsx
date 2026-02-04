import React from 'react';
import { IContext, ISliceId, ISliceStore } from './types';
import { formatError } from './helpers/error';
import { Store } from './store';
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
    value: ISliceStore[];
  };

  const Provider = ({ children, value }: Props) => {
    const [context] = React.useState<IContext>(() => {
      const map = new Map<ISliceId, Store<any>>();
      for (let i = 0; i < value.length; i++) {
        const store = value[i] as unknown as Store<any> & { sliceId: ISliceId };
        if (store.sliceId || !(store instanceof Store)) {
          map.set(store.sliceId, store);
        } else {
          throw formatError['providerSliceStoreError']();
        }
      }

      return map;
    });

    return <Context.Provider value={context}>{children}</Context.Provider>;
  };
  return Provider;
};
