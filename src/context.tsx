import React from 'react';
import { IContext, IContextValueId } from './types';

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
    value: Record<symbol, {}>;
  };

  const Provider = ({ children, value }: Props) => {
    const [context] = React.useState<IContext>(() => {
      const map = new Map<IContextValueId, {}>();
      const storeIds = Object.getOwnPropertySymbols(value);
      for (const id of storeIds) {
        map.set(id, value[id]);
      }
      return map;
    });

    return <Context.Provider value={context}>{children}</Context.Provider>;
  };
  return Provider;
};
