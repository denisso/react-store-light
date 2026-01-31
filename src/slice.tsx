import { Store, createStore } from './store';
import type { ISliceId } from './types';
/**
 * Class Slice for available for custom extension
 * Manage stores and state relation: 
 * - add store to state
 * - remove store from state
 * - create store with sqliceID
 */
class Slice<T extends object> {
  sliceId: ISliceId;
  mapSates: Map<T, Set<Store<T>>>;
  constructor(sliceId: ISliceId | null = null, mapSates: Map<T, Set<Store<T>>> | null = null) {
    this.sliceId = sliceId ? sliceId : {};
    this.mapSates = mapSates ? mapSates : new Map<T, Set<Store<T>>>();
    this.createStore = this.createStore.bind(this);
    this.addStore = this.addStore.bind(this);
    this.removeStore = this.removeStore.bind(this);
    this.updateState = this.updateState.bind(this);
  }
  createStore(state: T) {
    const store = createStore(state, this.sliceId);
    return store
  }

  addStore(state: T, store: Store<T>) {
    const setStores = this.mapSates.get(state);
    store.setState(state);
    if (setStores) {
      setStores.add(store);
    } else {
      this.mapSates.set(state, new Set([store]));
    }
  }
  removeStore(state: T, store: Store<T>) {
    const setStores = this.mapSates.get(state);
    if (!setStores) {
      return;
    }
    setStores.delete(store);
    if (setStores.size === 0) {
      this.mapSates.delete(state);
    }
  }
  updateState(state: T) {
    const setStores = this.mapSates.get(state);
    if (!setStores) {
      return;
    }
    for (const store of setStores) {
      store.setState(state);
    }
  }
}

/**
 * Creates an Slice instance.
 */
export const createSlice = <T extends object>(
  sliceId: ISliceId | null = null,
  mapSates: Map<T, Set<Store<T>>> | null = null,
) => {
  const slice = new Slice(sliceId, mapSates);
  return slice;
};
