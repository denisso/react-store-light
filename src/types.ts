import { type Store } from 'observable-store-light';

/**
 * Context value type.
 * key store unique `uniqId`, value store
 */
export type IContext = Map<{}, IStore<{}>>;

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
