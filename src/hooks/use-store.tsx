import React from 'react';
import { UseStoreContext } from '../helpers/use-store-context';
import type { IContext } from '../types';

export class UseStore<T extends object> extends UseStoreContext<T> {
  constructor(uniqId: object, Context: React.Context<IContext>) {
    super(uniqId, Context);
    this.hook = this.hook.bind(this);
  }
  /**
   * Returns the store instance directly.
   *
   * @param _Context - [optional] React Context
   */
  hook() {
    const store = super.getStore('useStore', null);
    return store;
  }
}
