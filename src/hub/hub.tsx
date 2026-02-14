import { Store, type Listener } from '../store';
import { addListNode, removeListNode, ListNode } from '../helpers/list';

const _REASON_NEW_STATE_UPDATE_ = Symbol();

/**
 * HubStore to work with the Hub class
 */
export class HubStore<T extends object> extends Store<T> {
  __next: HubStore<T> | null = null;
  __prev: HubStore<T> | null = null;
  __ref: T;
  constructor(ref: T, keys?: (keyof T)[]) {
    const _keys = keys ? keys : (Object.keys(ref) as (keyof T)[]);
    super(ref, _keys);
    const __self = this;
    for (const key of _keys) {
      const listener: Listener<T, keyof T> = (key: keyof T, value: T[keyof T], options) => {
        const reason = options?.reason;
        __self.__ref[key] = value;
        if (reason === _REASON_NEW_STATE_UPDATE_) return;
        let next: HubStore<T> | null = __self.__next;
        while (next) {
          next.set(key, value);
          next = next.__next;
        }
        let prev: HubStore<T> | null = __self.__prev;
        while (prev) {
          prev.set(key, value);
          prev = prev.__prev;
        }
      };
      this.addListener(key, listener);
    }

    this.__ref = ref;
  }
}

/**
 * Class Hub for available for custom extension
 * Manage stores and state relation:
 * - add store to state
 * - remove store from state
 * - create store with sqliceID
 */
export class Hub<T extends object> {
  mapRefStores = new Map<T, HubStore<T>>();

  constructor() {
    this.mountStore = this.mountStore.bind(this);
    this.unMountStore = this.unMountStore.bind(this);
    this.updateState = this.updateState.bind(this);
    this.updateKey = this.updateKey.bind(this);
  }

  /**
   * Mount Store to Ref in Slace
   *
   * @param store HubStore<T>
   * @param newRef T
   * @param prevRef T
   */
  mountStore(store: HubStore<T>, newRef: T) {
    const prevRef = store.__ref;
    store.__ref = newRef;
    let head: HubStore<T> | null = null;
    if (this.mapRefStores.has(prevRef)) {
      head = this.mapRefStores.get(prevRef) ?? null;
    } else {
      head = this.mapRefStores.get(store.__ref) ?? null;
    }

    head = addListNode(store, head);
    if (store.__ref !== prevRef && this.mapRefStores.has(prevRef)) {
      this.mapRefStores.delete(prevRef);
    }
    this.mapRefStores.set(store.__ref, head);

    store.setState(store.__ref, { reason: _REASON_NEW_STATE_UPDATE_ });
  }

  /**
   * UnMount Store from Ref (decrement counter refs)
   *
   * @param state T
   */
  unMountStore(store: HubStore<T>) {
    let head: HubStore<T> | null = this.mapRefStores.get(store.__ref) ?? null;

    head = removeListNode(store, head);

    if (!head) {
      this.mapRefStores.delete(store.__ref);
    } else {
      this.mapRefStores.set(store.__ref, head);
    }
  }

  /**
   * Manual update Store state
   *
   * @param ref T
   * @returns boolean
   */
  updateState(ref: T): boolean {
    let listStores: HubStore<T> | null = this.mapRefStores.get(ref) ?? null;

    if (!listStores) {
      return false;
    }

    while (listStores) {
      listStores.setState(ref);
      listStores = listStores.__next;
    }
    return true;
  }

  /**
   * Manual update Store Ref by Key
   * @param ref
   * @param key
   * @param value
   * @returns
   */
  updateKey<K extends keyof T>(ref: T, key: K, value: T[K]) {
    let listStores: HubStore<T> | null = this.mapRefStores.get(ref) ?? null;
    if (!listStores) {
      return false;
    }

    while (listStores) {
      listStores.set(key, value);
      listStores = listStores.__next;
    }
    ref[key] = value;
    return true;
  }
}

/**
 * Creates an Hub instance.
 */
export const createHub = <T extends object>() => {
  const hub = new Hub<T>();
  return hub;
};
