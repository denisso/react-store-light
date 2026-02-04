import React from 'react';
import { UseStoreContext } from '../helpers/use-store-context';
import type { IContext, ISliceId } from '../types';

export class UseStore<T extends object> extends UseStoreContext<T> {
  constructor(sliceId: ISliceId, Context: React.Context<IContext>) {
    super(sliceId, Context);
    this.hook = this.hook.bind(this);
  }
  /**
   * Returns the store instance directly.
   *
   * @param _Context - [optional] React Context
   */
  hook() {
    const store = super.getStore();
    return store;
  }
}
