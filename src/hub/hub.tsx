import {
  Store,
  type Listener,
  type PreValues,
  type ListenersGroup,
  type SetOptions,
  Value,
} from '../store';
import { addListNode, removeListNode } from '../helpers/list';
import { defaultGroups } from '../store/constants';

const runListenersForUpadateRef = (nodeValue: Value, value: any) => {
  for (const group of defaultGroups) {
    nodeValue.notify(value, group);
  }
};
/**
 * HubStore to work with the Hub class
 */
export class HubStore<T extends object, S extends object = T> extends Store<T, S> {
  __next: HubStore<T, S> | null = null;
  __prev: HubStore<T, S> | null = null;
  __ref: T;
  __refGroup: ListenersGroup = Symbol('RefListenerGroup');
  
  constructor(ref: T, values?: PreValues<S>) {
    const _keys = (values ? Object.keys(values) : Object.keys(ref)) as (keyof S)[];
    super(ref, values as PreValues<any>);
    const __self = this;
    for (const key of _keys) {
      const listener: Listener<S, keyof S> = (key: keyof S, value: S[keyof S]) => {
        if (!values) {
          (this.__ref as Record<string, any>)[key as string] = value;
        } else {
          const path = values[key].path;
          let object = this.__ref as Record<string, any>;
          for (let i = 0; i < path.length - 1; i++) {
            object = object[path[i]];
          }
          object[key as string] = value;
        }

        let next: HubStore<T, S> | null = __self.__next;
        while (next) {
          const valueNode = next.__values[key];
          runListenersForUpadateRef(valueNode, value);
          next = next.__next;
        }
        let prev: HubStore<T, S> | null = __self.__prev;
        while (prev) {
          runListenersForUpadateRef(prev.__values[key], value);
          prev = prev.__prev;
        }
      };
      this.addListener(key, listener, { group: this.__refGroup });
    }

    this.__ref = ref;
  }

  set<K extends keyof S>(key: K, value: S[K], options?: SetOptions) {
    super.set(key, value, options);
    this.__values[key].notify(value, this.__refGroup);
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

    // store.setState(store.__ref, { reason: _REASON_NEW_STATE_UPDATE_ });
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
