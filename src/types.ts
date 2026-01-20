import { type Store } from 'observable-store-light';

export type IContext = Map<{}, unknown>;
export type IStore<T extends object> = Store<T> & { uniqId: {} };
