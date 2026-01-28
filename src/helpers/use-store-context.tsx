import React from 'react';
import type { IContext, IStore } from '../types';
import { formatError } from './error';

export class UseStoreContext<T extends object> {
  uniqId: object;
  constructor(uniqId: object) {
    this.uniqId = uniqId;
    this.hook = this.hook.bind(this);
  }
  /**
   * get store By Vontext
   * 
   * @param hook - name hook for formatError
   * @param key - name key for formatError
   * @param Context - context
   * @returns IStore<T>
   */
  hook(hook: string, key: string | null, Context?: React.Context<IContext> | null) {
    if (!Context) {
      throw formatError['contextNotExist'](hook, key);
    }
    const context = React.useContext(Context) as IContext;
    const store = context.get(this.uniqId) as unknown as IStore<T>;
    if (!store) {
      throw formatError['storeNotExist'](hook, key);
    }
    return store;
  }
}
