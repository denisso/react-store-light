import { type StoreApi } from 'observable-store-light';

export type IContext = Map<{}, unknown>;
export type IStoreApi<T extends object> = StoreApi<T> & { uniqId: {} };
