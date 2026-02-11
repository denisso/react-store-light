import React from 'react';
import type { IContext, IContextValueId } from '../types';
import { Store } from '../store';
import { createGetById } from '../hub/use-get-by-id';

export const createStoreHook = <T extends object, S extends Store<T> = Store<T>>(
  Context: React.Context<IContext>,
  storeId: IContextValueId,
) => {
  return createGetById<S>(Context, storeId) as unknown as () => S;
};
