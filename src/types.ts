import { Store } from './store';

/**
 * Context value type.
 * key store unique `sliceId`, value store
 */
export type IContext = Map<ISliceId, Store<any>>;

/**
 * Reducer function.
 * Mutates the store.
 * The first argument is always the store instance,
 * the rest are user-defined arguments.
 */
export type IReducer<T extends object> = (...args: any[]) => (store: Store<T>) => void;

/**
 * Type from record reducers
 */
export type IReducers<T extends object> = Record<string, IReducer<T>>;

/**
 * Uniq id for slice
 */
export type ISliceId = {};
