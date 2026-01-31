import { UseAsync, UseReducer, UseState, UseStore } from '.';
import type { IReducers, IContext } from '../types';

export type HookOf<T> = T extends { hook: (...args: any[]) => any } ? T['hook'] : never;
/**
 * Class Hooks for available for custom extension
 */
export class Hooks<T extends object, R extends IReducers<T> = {}> {
  constructor(sliceId: object, Context: React.Context<IContext>, reducers?: R) {
    this.useAsync = new UseAsync<T>(sliceId, Context).hook;

    this.useState = new UseState<T>(sliceId, Context).hook;

    this.useReducer = new UseReducer<T, R>(sliceId, Context, reducers).hook;

    this.useStore = new UseStore<T>(sliceId, Context).hook;
  }
  useAsync: HookOf<UseAsync<T>>;
  useState: HookOf<UseState<T>>;
  useReducer: HookOf<UseReducer<T, R>>;
  useStore: HookOf<UseStore<T>>;
}

export const createHooks = <T extends object, R extends IReducers<T> = {}>(
  sliceId: object,
  Context: React.Context<IContext>,
  reducers?: R,
) => {
  return new Hooks<T, R>(sliceId, Context, reducers);
};
