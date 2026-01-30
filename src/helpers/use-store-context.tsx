import React from 'react';
import { Store } from '../store';
import type { IContext } from '../types';
import { formatError } from './error';

/**
 *
 * @param sliceId
 * @param Context
 * @returns
 */
export const useGetStorefromContext = <T extends object>(
  sliceId: object,
  Context: React.Context<IContext>,
  error?: false,
) => {
  if (!Context && error !== false) {
    throw formatError['contextIsEmpty']();
  }
  const context = React.useContext(Context) as IContext;
  if (!context && error !== false) {
    throw formatError['hookMustBeInsideProvider']();
  }
  const store = context.get(sliceId) as unknown as Store<T>;
  if (!store && error !== false) {
    throw formatError['storeNotExist']();
  }
  return store;
};

export class UseStoreContext<T extends object> {
  sliceId: object;
  Context: React.Context<IContext>;
  constructor(sliceId: object, Context: React.Context<IContext>) {
    this.sliceId = sliceId;
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
  getStore(error?: false): Store<T> {
    const store = useGetStorefromContext<T>(this.sliceId, this.Context, error);
    return store;
  }
}
