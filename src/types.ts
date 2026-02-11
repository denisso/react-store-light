import { Store } from './store';

/**
 * Context value type.
 * key store unique `sliceId`, value store
 */
export type IContext = Map<IContextValueId, {}>;

/**
 * Uniq id for Store
 */
export type IContextValueId = symbol;
