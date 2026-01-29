import React from 'react';
import { UseStoreContext } from '../helpers/use-store-context';
import type { IContext, IStore, IReducers } from '../types';

type ReducerArgsFn<R> = R extends (...args: infer A) => (store: IStore<any>) => void
  ? (...args: A) => void
  : never;

type BindStoreReducers<R> = {
  [K in keyof R]: ReducerArgsFn<R[K]>;
};

export class UseReducer<T extends object, R extends IReducers<T>> extends UseStoreContext<T> {
  reducers?: R;
  constructor(uniqId: object, Context: React.Context<IContext>, reducers?: R) {
    super(uniqId, Context);
    this.reducers = reducers;
    this.hook = this.hook.bind(this);
  }
  /**
   * Returns reducers already bound to the store.
   * Reducers are created once and cached.
   *
   * @return Record reducers
   */
  hook() {
    const store = super.getStore();
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
