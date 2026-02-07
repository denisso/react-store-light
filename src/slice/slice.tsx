import { Store } from '../store';
import type { ISliceId } from '../types';
import { addListNode, removeListNode } from '../helpers/list';
import { Listener } from '../store';

export class SliceStoreNode<T extends object> extends Store<T> {
  /**
   * id for Slice
   */
  next: SliceStoreNode<T> | null = null;
  prev: SliceStoreNode<T> | null = null;
  sliceId: ISliceId;
  listeners = {} as Record<keyof T, Listener<T, keyof T>>;
  constructor(ref: T, sliceId: symbol) {
    super(ref);
    this.sliceId = sliceId;
  }
}

/**
 * Class Slice for available for custom extension
 * Manage stores and state relation:
 * - add store to state
 * - remove store from state
 * - create store with sqliceID
 */
export class Slice<T extends object> {
  sliceId: ISliceId = Symbol();
  mapRefStores = new Map<T, SliceStoreNode<T>>();

  constructor() {
    this.createStore = this.createStore.bind(this);
    this.mountStore = this.mountStore.bind(this);
    this.unMountStore = this.unMountStore.bind(this);
    this.updateState = this.updateState.bind(this);
    this.updateKey = this.updateKey.bind(this);
  }

  /**
   * Create Store instance
   *
   * @param ref T
   * @returns
   */
  createStore(ref: T) {
    const store = new SliceStoreNode<T>(ref, this.sliceId);
    return store;
  }

  /**
   * Mount Store to Ref in Slace
   * Pattern Smart Pointer C++: increment counter refs
   *
   * @param store SliceStoreNode<T>
   * @param newRef T
   * @param prevRef T
   */
  mountStore(store: SliceStoreNode<T>, newRef: T, prevRef: T) {
    let listStores: SliceStoreNode<T> | null = null;
    if (this.mapRefStores.has(prevRef)) {
      listStores = this.mapRefStores.get(prevRef) ?? null;
    } else {
      listStores = this.mapRefStores.get(newRef) ?? null;
    }

    listStores = addListNode(store, listStores);
    if (newRef !== prevRef && this.mapRefStores.has(prevRef)) {
      this.mapRefStores.delete(prevRef);
    }
    this.mapRefStores.set(newRef, listStores);
    store.setRef(newRef);
    for (const key of store.keys) {
      let listener: Listener<T, keyof T> = store.listeners[key];
      if (!listener) {
        listener = (_: keyof T, value: T[keyof T], runsCount) => {
          if (runsCount > 1) return;
          let next: SliceStoreNode<T> | null = this.mapRefStores.get(store.getRef()) ?? null;
          while (next) {
            if (next !== store) {
              next.set(key, value, { runsCount: runsCount + 1 });
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
   * Pattern Smart Pointer C++: decrement  counter refs
   *
   * @param state T
   */
  unMountStore(store: SliceStoreNode<T>, ref: T) {
    let listStores: SliceStoreNode<T> | null = this.mapRefStores.get(ref) ?? null;

    for (const key of store.keys) {
      if (store.listeners[key]) {
        store.removeListener(key, store.listeners[key]);
      }
    }

    listStores = removeListNode(store, listStores);

    if (!listStores) {
      this.mapRefStores.delete(ref);
    }
  }

  /**
   * Manual update Store Ref
   *
   * @param ref T
   * @returns boolean
   */
  updateState(ref: T): boolean {
    let listStores: SliceStoreNode<T> | null = this.mapRefStores.get(ref) ?? null;

    if (!listStores) {
      return false;
    }

    while (listStores) {
      listStores.setRef(ref);
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
    let listStores: SliceStoreNode<T> | null = this.mapRefStores.get(ref) ?? null;
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
 * Creates an Slice instance.
 */
export const createSlice = <T extends object>() => {
  const slice = new Slice<T>();
  return slice;
};
