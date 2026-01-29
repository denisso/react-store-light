import React from 'react';
import { IContext, IStore } from './types';

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
 * The provider accepts multiple store instances and maps them by `uniqId`.
 * This allows different slices to coexist in the same React tree.
 *
 *  @param Context React Context
 */
export const createProvider = (Context: React.Context<IContext>) => {
  type Props = {
    children: React.ReactNode;
    value: IStore<any>[];
  };

  const Provider = ({ children, value }: Props) => {
    const [context] = React.useState<IContext>(() => {
      const map = new Map<{}, IStore<any>>();
      for (const store of value) {
        map.set(store.uniqId, store);
      }

      return map;
    });

    return <Context.Provider value={context}>{children}</Context.Provider>;
  };
  return Provider;
};
