import React from 'react';
import type { IContext, IStore } from '../types';
import { formatError } from './error';

/**
 *
 * @param uniqId
 * @param Context
 * @returns
 */
export const useGetStorefromContext = <T extends object>(
  uniqId: object,
  Context: React.Context<IContext>,
  error?: false,
) => {
  if (!Context && error !== false) {
    throw formatError['contextNotExist']();
  }
  const context = React.useContext(Context) as IContext;
  const store = context.get(uniqId) as unknown as IStore<T>;
  if (!store && error !== false) {
    throw formatError['storeNotExist']();
  }
  return store;
};

export class UseStoreContext<T extends object> {
  uniqId: object;
  Context: React.Context<IContext>;
  constructor(uniqId: object, Context: React.Context<IContext>) {
    this.uniqId = uniqId;
    this.Context = Context;
    this.getStore = this.getStore.bind(this);
  }
  /**
   * get store By
   * throw Error contextNotExist and storeNotExist
   *
   * @param isError [optional] false turnoff error
   * @returns IStore<T>
   */
  getStore(error?: false): IStore<T> {
    const store = useGetStorefromContext<T>(this.uniqId, this.Context, error);
    return store;
  }
}
