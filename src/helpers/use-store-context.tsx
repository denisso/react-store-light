import React from 'react';
import type { IContext, IStore } from '../types';
import { formatError } from './error';

export class UseStoreContext<T extends object> {
  uniqId: object;
  Context: React.Context<IContext>;
  constructor(uniqId: object, Context: React.Context<IContext>) {
    this.uniqId = uniqId;
    this.Context = Context;
    this.getStore = this.getStore.bind(this);
  }
  /**
   * get store By Vontext
   *
   * @param hook - name hook for formatError
   * @param key - name key for formatError
   * @param Context - context
   * @returns IStore<T>
   */
  getStore(hook: string, key: string | null) {
    if (!this.Context) {
      throw formatError['contextNotExist'](hook, key);
    }
    const context = React.useContext(this.Context) as IContext;
    const store = context.get(this.uniqId) as unknown as IStore<T>;
    if (!store) {
      throw formatError['storeNotExist'](hook, key);
    }
    return store;
  }
}
