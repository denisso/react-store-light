import React from 'react';
import type { IContext, IStoreId } from '../types';
import { formatError } from '../helpers/error';
import { Store } from '../store';

export const createStoreHook = <T extends object>(
  Context: React.Context<IContext>,
  storeId: IStoreId,
) => {
  return () => {
    if (!Context) {
      throw formatError['contextIsEmpty']();
    }
    const context = React.useContext(Context) as IContext;
    if (!context) {
      throw formatError['hookMustBeInsideProvider']();
    }
    const store = context.get(storeId) as unknown as Store<T>;
    if (!store) {
      throw formatError['storeNotExist']();
    }
    return store;
  };
};
