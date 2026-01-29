import { UseAsync, UseReducer, UseState, UseStore } from '.';
import type { IReducers, IContext } from '../types';

export type HookOf<T> = T extends { hook: (...args: any[]) => any } ? T['hook'] : never;

export class Hooks<T extends object, R extends IReducers<T>> {
  constructor(uniqId: object, Context: React.Context<IContext>, reducers?: R) {
    this.useAsync = new UseAsync<T>(uniqId, Context).hook;

    this.useState = new UseState<T>(uniqId, Context).hook;

    this.useReducer = new UseReducer<T, R>(uniqId, Context, reducers).hook;

    this.useStore = new UseStore<T>(uniqId, Context).hook;
  }
  useAsync: HookOf<UseAsync<T>>;
  useState: HookOf<UseState<T>>;
  useReducer: HookOf<UseReducer<T, R>>;
  useStore: HookOf<UseStore<T>>;
}

export const createHooks = <T extends object, R extends IReducers<T>>(
  uniqId: object,
  Context: React.Context<IContext>,
  reducers?: R,
) => {
  return new Hooks<T, R>(uniqId, Context, reducers);
};
