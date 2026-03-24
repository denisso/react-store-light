/**
 * Context value type.
 * key store unique `sliceId`, value store
 */
export type IContext = Record<IContextValueId<{}>, {}>;

/**
 * Unique id for Store
 */

export type IContextValueId<T> = symbol & { readonly __type?: T };