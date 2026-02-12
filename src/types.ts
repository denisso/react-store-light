/**
 * Context value type.
 * key store unique `sliceId`, value store
 */
export type IContext = Record<IContextValueId<{}>, {}>;

/**
 * Uniq id for Store
 */

export type IContextValueId<T extends object> = symbol & { readonly __type?: T };