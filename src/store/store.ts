import { State } from '../state';
import type { Listener } from './types';
import { AbstractStore } from './abstract';

export class Store<T extends object> extends AbstractStore {
  __state: State;

  constructor(state: T) {
    super();
    this.__state = new State(state);
    this.get = this.get.bind(this);
    this.set = this.set.bind(this);
    this.getState = this.getState.bind(this);
    // this.setState = this.setState.bind(this);
    this.addListener = this.addListener.bind(this);
  }

  /**
   * Returns the current value for a given key.
   *
   * @param key K - key of Store state
   * @param isDeepCopy - is need to make a deep copy? [default: false
   * @returns T[K] - value
   */
  get<K extends keyof T>(key: K): T[K] {
    return this.__state.get([key as string]) as T[K];
  }
  /**
   * Updates the value for a given key
   * and notifies all registered listeners.
   *
   * @param key - K - key
   * @param value - T[K] - value
   * @param options - SetOptions
   */
  set<K extends keyof T>(key: K, value: T[K]) {
    this.__state.set([key as string], value);
  }

  /**
   * Return state
   *
   * @param isDeepCopy - is need to make a deep copy? [default: false]
   * @returns state
   */
  getState(isDeepCopy = false) {
    return this.__state.getState(isDeepCopy);
  }

  /**
   * Set state
   *
   * @param state - Initial store state
   * @param options.isAlwaysNotify - notify listiners always [default: false]
   */
  setState(state: T) {
    this.__state.setState(state);
  }
  /**
   * Subscribes a listener to changes of a specific key.
   *
   * @param key Store key to addListener to
   * @param listener Callback invoked on value changes
   * @param isAutoCallListener - Whether to call the listener immediately
   *                         with the current value [default: false]
   * @returns UnSubscribe function
   */
  addListener<K extends keyof T>(key: K, listener: Listener<T, K>) {
    const subscribe = this.__state.subsribe([key as string])
    return subscribe(listener)
  }
}

/**
 * Creates a new isolated store instance.
 *
 * Each property of the initial state is converted into a Value,
 * allowing independent subscriptions per key.
 *
 * @param state - Initial store state
 * @returns Store API with get/set and subscription methods
 */
export const createStore = <T extends object>(object: T) => {
  return new Store<T>(object);
};
