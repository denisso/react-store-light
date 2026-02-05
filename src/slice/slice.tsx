import { Store } from '../store';
import type { ISliceId } from '../types';
import { addListNode, removeListNode } from '../helpers/list';

export class SliceStoreNode<T extends object> extends Store<T> {
  /**
   * id for Slice
   */
  next: SliceStoreNode<T> | null = null;
  prev: SliceStoreNode<T> | null = null;
  sliceId: ISliceId;
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
    let listStores = this.mapRefStores.get(prevRef);

    listStores = addListNode(store, listStores);
    if (newRef !== prevRef) {
      this.mapRefStores.delete(prevRef);
    }
    this.mapRefStores.set(newRef, listStores);
    store.setRef(newRef);
  }

  /**
   * UnMount Store from Ref (decrement counter refs)
   * Pattern Smart Pointer C++: decrement  counter refs
   *
   * @param state T
   */
  unMountStore(store: SliceStoreNode<T>, ref: T) {
    let listStores: SliceStoreNode<T> | null = this.mapRefStores.get(ref) ?? null;

    if (!listStores) {
      this.mapRefStores.delete(ref);
      return;
    }

    listStores = removeListNode(store, listStores);

    if (!listStores) {
      this.mapRefStores.delete(ref);
    }
  }

  /**
   * Update Store State
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
