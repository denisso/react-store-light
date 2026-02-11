import { Store, Listener } from '../store';
import { addListNode, removeListNode } from '../helpers/list';

const setReasonUpdate = Symbol();

export class HubStore<T extends object> extends Store<T> {
  next: HubStore<T> | null = null;
  prev: HubStore<T> | null = null;
  ref: T;
  listeners = {} as Record<keyof T, Listener<T, keyof T>>;
  constructor(ref: T) {
    super(ref);
    this.ref = ref;
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
    const prevRef = store.ref;
    let listStores: HubStore<T> | null = null;
    if (this.mapRefStores.has(prevRef)) {
      listStores = this.mapRefStores.get(prevRef) ?? null;
    } else {
      listStores = this.mapRefStores.get(newRef) ?? null;
    }

    listStores = addListNode(store, listStores);
    if (newRef !== store.ref && this.mapRefStores.has(prevRef)) {
      this.mapRefStores.delete(prevRef);
    }
    this.mapRefStores.set(newRef, listStores);

    store.setState(newRef, { reason: setReasonUpdate });
    for (const key of store.keys) {
      let listener: Listener<T, keyof T> = store.listeners[key];
      if (!listener) {
        listener = (_: keyof T, value: T[keyof T], options) => {
          const runsCounter = options?.runsCounter ?? 0;
          const reason = options?.reason;
          if (runsCounter > 1 || reason === setReasonUpdate) return;
          let next: HubStore<T> | null = this.mapRefStores.get(store.ref) ?? null;
          while (next) {
            if (next !== store) {
              next.set(key, value, { runsCounter: runsCounter + 1 });
            }
            next = next.next;
          }
        };
        store.listeners[key] = listener;
      }
      store.addListener(key, listener);
    }
  }

  /**
   * UnMount Store from Ref (decrement counter refs)
   *
   * @param state T
   */
  unMountStore(store: HubStore<T>) {
    let listStores: HubStore<T> | null = this.mapRefStores.get(store.ref) ?? null;

    for (const key of store.keys) {
      if (store.listeners[key]) {
        store.removeListener(key, store.listeners[key]);
      }
    }

    listStores = removeListNode(store, listStores);

    if (!listStores) {
      this.mapRefStores.delete(store.ref);
    }
  }

  /**
   * Manual update Store Ref
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
      listStores = listStores.next;
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
    ref[key] = value;
    let listStores: HubStore<T> | null = this.mapRefStores.get(ref) ?? null;
    if (!listStores) {
      return false;
    }

    while (listStores) {
      listStores.values[key].notify(value as any);
      listStores = listStores.next;
    }

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
