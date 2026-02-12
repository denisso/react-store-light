import React from 'react';
import type { IContext, IContextValueId } from './types';

export function createContextValueId<T extends object>(): IContextValueId<T> {
  return Symbol() as IContextValueId<T>;
}

/**
 * Creates a Context.
 */

export const Context = React.createContext<IContext>(null as unknown as IContext);

/**
 * Creates a Provider
 *
 * The provider accepts multiple store instances and maps them by `sliceId`.
 * This allows different slices to coexist in the same React tree.
 *
 *  @param Context React Context
 */

type Props = {
  children: React.ReactNode;
  value: Record<symbol, {}>;
};

export const Provider = ({ children, value }: Props) => {
  const [context] = React.useState<IContext>(() => {
    const _context: IContext = {};
    const storeIds = Object.getOwnPropertySymbols(value);
    for (const id of storeIds) {
      _context[id] = value[id];
    }
    return _context;
  });

  return <Context.Provider value={context}>{children}</Context.Provider>;
};
