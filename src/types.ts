import { Store, type StoreBase } from './store';

/**
 * Context value type.
 * key store unique `sliceId`, value store
 */
export type IContext = Map<ISliceId, Store<any>>;

/**
 * Uniq id for Slice
 */
export type ISliceId = symbol;

/**
 * Uniq id for Store
 */
export type IStoreID = symbol;

/**
 * Interface for Store with sliceID
 */
export type ISliceStore =  StoreBase & { sliceId: ISliceId };
