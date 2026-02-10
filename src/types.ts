import { Store } from './store';

/**
 * Context value type.
 * key store unique `sliceId`, value store
 */
export type IContext = Map<IStoreId, Store<any>>;

/**
 * Uniq id for Store
 */
export type IStoreId = symbol;
