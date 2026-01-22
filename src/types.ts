import { type Store } from 'observable-store-light';

/**
 * Context value type.
 * key store unique `uniqId`, value store
 */
export type IContext = Map<{}, IStore<{}>>;

export type IStore<T extends object> = Store<T> & { uniqId: {} };
