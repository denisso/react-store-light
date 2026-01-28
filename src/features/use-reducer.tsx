import React from 'react';
import { UseStoreContext } from '../helpers/use-store-context';
import type { IContext, IStore, IReducer, IReducers } from '../types';

type ReducerArgsFn<R> = R extends (...args: infer A) => (store: IStore<any>) => void
  ? (...args: A) => void
  : never;

type BindStoreReducers<R> = {
  [K in keyof R]: ReducerArgsFn<R[K]>;
};

export class UseReducer<T extends object, R extends IReducers<T>> extends UseStoreContext<T> {
  Context: React.Context<IContext> | null;
  reducers?: R;
  constructor(uniqId: object, Context: React.Context<IContext> | null, reducers?: R) {
    super(uniqId);
    this.Context = Context;
    this.reducers = reducers;
    this.hook = this.hook.bind(this);
  }
  /**
   * Returns reducers already bound to the store.
   * Reducers are created once and cached.
   *
   * @param _Context - [optional] React Context
   * @return Record reducers
   */
  hook(Context?: React.Context<IContext>) {
    const store = super.getStore('useReducer', null, Context ? Context : this.Context);
    const [reducers] = React.useState(() => {
      const reducers = {} as BindStoreReducers<R>;
      if (!this.reducers) {
        return reducers;
      }
      for (const key in this.reducers) {
        const fn = this.reducers[key];
        reducers[key] = ((...args: Parameters<typeof fn>) => {
          fn(...args)(store);
        }) as BindStoreReducers<R>[typeof key];
      }
      return reducers;
    });
    return reducers;
  }
}
