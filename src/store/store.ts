import { Value } from './value';
import type { SetOptions, Listener, ListenerOptions } from './types';
import { defaultGroups, ThisValueListenerGroup, UserListenerGroup } from './constants';
import { AbstractStore } from './abstract';

export class Store<T extends object> extends AbstractStore {
  readonly __keys: (keyof T)[];

  __values = {} as Record<keyof T, Value>;

  __state: T;

  constructor(state: T) {
    super();
    this.__state = state;
    this.__keys = Object.keys(state) as (keyof T)[];
    this.get = this.get.bind(this);
    this.set = this.set.bind(this);
    this.getState = this.getState.bind(this);
    this.setState = this.setState.bind(this);
    this.addListener = this.addListener.bind(this);
    this.removeListener = this.removeListener.bind(this);
  }

  /**
   * Returns the current value for a given key.
   *
   * @param key K - key of Store state
   * @param isDeepCopy - is need to make a deep copy? [default: false
   * @returns T[K] - value
   */
  get<K extends keyof T>(key: K, isDeepCopy = false) {
    let value = this.__values[key].value as T[K];
    if (value instanceof Object && isDeepCopy) {
      return structuredClone(value);
    }
    return value;
  }
  /**
   * Updates the value for a given key
   * and notifies all registered listeners.
   *
   * @param key - K - key
   * @param value - T[K] - value
   * @param options - SetOptions
   */
  set<K extends keyof T>(key: K, value: T[K], options?: SetOptions) {
    for (const group of defaultGroups) {
      this.__values[key].notify(value, group);
    }
    const groups = options?.groups;
    if (!groups) {
      this.__values[key].notify(value, UserListenerGroup);
      return;
    }
    for (const group of groups) {
      this.__values[key].notify(value, group);
    }
  }

  /**
   * Return state
   *
   * @param isDeepCopy - is need to make a deep copy? [default: false]
   * @returns state
   */
  getState(isDeepCopy = false) {
    if (isDeepCopy) {
      return structuredClone(this.__state);
    }
    return this.__state;
  }

  /**
   * Set state
   *
   * @param state - Initial store state
   * @param options.isAlwaysNotify - notify listiners always [default: false]
   */
  setState(state: T) {
    return (this.__state = state);
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
  addListener<K extends keyof T>(key: K, listener: Listener<T, K>, options?: ListenerOptions) {
    let group = UserListenerGroup;
    if (options?.group) {
      group = options.group;
    }
    this.__values[key].addListener(listener, group);

    if (options?.isAutoCallListener) {
      listener(key, this.__values[key].value);
    }
    return () => this.__values[key].removeListener(listener);
  }

  /**
   * Removes a previously registered listener for a key.
   *
   * @param key Store key to addListener to
   * @param listener Callback invoked on value changes
   */
  removeListener<K extends keyof T>(key: K, listener: Listener<T, K>) {
    this.__values[key].removeListener(listener);
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
