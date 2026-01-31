import { Store, createStore } from './store';
import type { ISliceId } from './types';
/**
 * Class Slice for available for custom extension
 * Manage stores and state relation:
 * - add store to state
 * - remove store from state
 * - create store with sqliceID
 */
export class Slice<T extends object> {
  sliceId: ISliceId = {};
  mapSates = new Map<T, Store<T>>();
  constructor() {
    this.createStore = this.createStore.bind(this);
    this.mountStore = this.mountStore.bind(this);
    this.unMountStore = this.unMountStore.bind(this);
    this.updateState = this.updateState.bind(this);
  }
  /**
   * Create Store instance or get from cache
   * 
   * @param state T
   * @returns 
   */
  createStore(state: T) {
    let store = this.mapSates.get(state);
    if (!store) {
      store = createStore<T>(state, this.sliceId);
      this.mapSates.set(state, store);
    }
    return store as Store<T>;
  }

  /**
   * Mount Store to slice (increment counter states)
   * 
   * @param state T
   */
  mountStore(state: T) {
    const store = this.mapSates.get(state);
    if (!store) {
      throw Error();
    }
    store.count++;
  }

  /**
   * UnMount Store to slice (decrement counter states)
   * 
   * @param state T
   * @param wait false | number - false unmount immediatly 
   */
  unMountStore(state: T, wait: false | number = false) {
    const store = this.mapSates.get(state);
    if (store && store.count > 0) {
      store.count--;
      if (wait === false && store.count <= 0) {
        this.mapSates.delete(state);
        return;
      }
      setTimeout(() => {
        if (store.count <= 0) {
          this.mapSates.delete(state);
        }
      }, 100);
    }
  }

  /**
   * Update Store State 
   * 
   * @param state T
   * @returns boolean
   */
  updateState(state: T): boolean {
    const store = this.mapSates.get(state);
    if (!store) {
      return false;
    }
    store.setState(state);
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
