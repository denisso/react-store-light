import React from 'react';
import type { IContext, ISliceId } from '../types';
import { formatError } from '../helpers/error';
import { Store } from '../store';

export const createStoreHook = <T extends object>(
  Context: React.Context<IContext>,
  sliceId: ISliceId,
) => {
  return () => {
    if (!Context) {
      throw formatError['contextIsEmpty']();
    }
    const context = React.useContext(Context) as IContext;
    if (!context) {
      throw formatError['hookMustBeInsideProvider']();
    }
    const store = context.get(sliceId) as unknown as Store<T>;
    if (!store) {
      throw formatError['storeNotExist']();
    }
    return store;
  };
};
