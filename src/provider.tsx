import React from 'react';
import { ErrorWithMessage, ErrorMessages } from './helpers/error';
import { IContext } from './types';

/**
 * Provider value type.
 * An array of store instances, each identified by its unique `uniqId`.
 */
export type IProviderValue = { uniqId: {} }[];

/**
 * Creates a Context + Provider pair for store injection.
 *
 * The provider accepts multiple store instances and maps them by `uniqId`.
 * This allows different slices to coexist in the same React tree.
 */
export const createContext = () => {
  const Context = React.createContext<IContext>(null as unknown as IContext);

  const Provider = ({ children, value }: { children: React.ReactNode; value: IProviderValue }) => {
    const ref = React.useRef<IContext>(null as unknown as IContext);

    if (!ref.current) {
      const map = new Map();
      for (const item of value) {
        if (map.has(item.uniqId)) {
          throw ErrorWithMessage(ErrorMessages['storeUniqIdAlreadyExist']);
        }
        map.set(item.uniqId, item);
      }
      ref.current = map;
    }

    return <Context.Provider value={ref.current}>{children}</Context.Provider>;
  };
  return { Context, Provider };
};
