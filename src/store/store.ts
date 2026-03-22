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
    this.getValues = this.getValues.bind(this);
    this.setValues = this.setValues.bind(this);
    this.subscribe = this.subscribe.bind(this);
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
   * @returns state
   */
  getState() {
    return this.__state;
  }

  getValues(isDeepCopy = false): T {
    return this.__state.getValues(isDeepCopy) as T;
  }
  /**
   * Set state
   *
   * @param state - Initial store state
   * @param options.isAlwaysNotify - notify listiners always [default: false]
   */
  setValues(values: T) {
    this.__state.setValues(values);
  }
  /**
   * Subscribes a listener to changes of a specific key.
   *
   * @param key Store key to subscribe to
   * @param listener Callback invoked on value changes
   * @param isAutoCallListener - Whether to call the listener immediately
   *                         with the current value [default: false]
   * @returns UnSubscribe function
   */
  subscribe<K extends keyof T>(key: K, listener: Listener<T, K>) {
    const subscribe = this.__state.subsribe([key as string], listener);
    return subscribe;
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
