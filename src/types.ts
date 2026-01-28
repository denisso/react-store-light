import { type Store } from 'observable-store-light';

/**
 * Context value type.
 * key store unique `uniqId`, value store
 */
export type IContext = Map<{}, IStore<any>>;

export type IStore<T extends object> = Store<T> & { uniqId: {} };

export type ISubStore<T extends object> = {
  /**
   * unlink state
   * 
   * @param hard - default true, unlint and assign new undepended state to this store
   * @returns
   */
  unLinkState: (hard?: boolean) => void;
} & IStore<T>;

/**
 * Reducer function.
 * Mutates the store.
 * The first argument is always the store instance,
 * the rest are user-defined arguments.
 */
export type IReducer<T extends object> = (...args: any[]) => (store: IStore<T>) => void;

/**
 * type from record reducers
 */
export type IReducers<T extends object> = Record<string, IReducer<T>>;