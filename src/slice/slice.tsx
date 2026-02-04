import { Store } from '../store';
import type { ISliceId } from '../types';
import { List } from '../helpers/list';

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
  mapRefStores = new Map<T, List<SliceStoreNode<T>>>();

  constructor() {
    this.createStore = this.createStore.bind(this);
    this.mountStore = this.mountStore.bind(this);
    this.unMountStore = this.unMountStore.bind(this);
    this.updateState = this.updateState.bind(this);
    this.updateKey = this.updateKey.bind(this);
  }

  /**
   * Create Store instance or get from cache
   *
   * @param state T
   * @returns
   */
  createStore(state: T) {
    const store = new SliceStoreNode<T>(state, this.sliceId);
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

    if (!listStores) {
      listStores = new List<SliceStoreNode<T>>();
    }
    listStores.add(store);
    if (newRef !== prevRef) {
      this.mapRefStores.delete(prevRef);
    }
    this.mapRefStores.set(newRef, listStores);

    let nextStore = listStores.head;
    while (nextStore) {
      nextStore.setRef(newRef);
      nextStore = nextStore.next;
    }
  }

  /**
   * UnMount Store from Ref (decrement counter refs)
   * Pattern Smart Pointer C++: decrement  counter refs
   *
   * @param state T
   */
  unMountStore(store: SliceStoreNode<T>, ref: T) {
    const listStores = this.mapRefStores.get(ref);

    if (!listStores) {
      this.mapRefStores.delete(ref);
      return;
    }

    listStores.remove(store);

    if (!listStores.head) {
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
    const listStores = this.mapRefStores.get(ref);

    if (!listStores) {
      return false;
    }
    let nextStore = listStores.head;
    while (nextStore) {
      nextStore.setRef(ref);
      nextStore = nextStore.next;
    }
    return true;
  }

  updateKey<K extends keyof T>(ref: T, key: K, value: T[K]) {
    ref[key] = value;
    const listStores = this.mapRefStores.get(ref);
    if (!listStores) {
      return false;
    }
    let nextStore = listStores.head;
    while (nextStore) {
      nextStore.values[key].notify(value as any);
      nextStore = nextStore.next;
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
