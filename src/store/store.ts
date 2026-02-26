import { Value } from './value';
import type { PreValues, SetOptions, Listener, ListenerOptions } from './types';
import { initValues } from './helpers/init-values';
import { createStateValue } from './helpers/creatre-value';
import { defaultGroups, ThisValueListenerGroup, UserListenerGroup } from './constants';

/**
 * Branding type Store
 */
export interface StoreBase {
  readonly __brand: 'Store';
}

export class Store<T extends object, S extends object = T> {
  /**
   * Cached list of state keys.
   *
   * Initialized once from the initial state:
   * this.__keys = Object.keys(state) as (keyof T)[];
   */
  readonly __keys: (keyof S)[];

  __parentStore?: Store<any>;

  __values: Record<keyof S, Value> = {} as Record<keyof S, Value>;

  __rootValue: Value;

  constructor(object: T, prepValues?: PreValues<S>) {
    this.__rootValue = new Value(null, object);
    this.__keys = (prepValues ? Object.keys(prepValues) : Object.keys(object)) as (keyof S)[];
    if (!prepValues) {
      prepValues = {} as PreValues<S>;
      for (const key of this.__keys) {
        prepValues[key] = createStateValue<any>(object)(key)();
      }
    }
    this.__rootValue.children = new Map();
    this.get = this.get.bind(this);
    this.set = this.set.bind(this);
    this.getState = this.getState.bind(this);
    this.setState = this.setState.bind(this);
    this.addListener = this.addListener.bind(this);
    this.removeListener = this.removeListener.bind(this);

    this.__values = initValues(prepValues, this) as Record<keyof S, Value>;
  }

  /**
   * Returns the current value for a given key.
   *
   * @param key K - key of Store state
   * @param isDeepCopy - is need to make a deep copy? [default: false
   * @returns T[K] - value
   */
  get<K extends keyof S>(key: K, isDeepCopy = false) {
    let value = this.__values[key].value as S[K];
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
  set<K extends keyof S>(key: K, value: S[K], options?: SetOptions) {
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
    const state = {} as S;
    for (const key of this.__keys) {
      state[key] = this.__values[key].value;
    }
    if (isDeepCopy) {
      return structuredClone(state);
    }
    return state;
  }

  /**
   * Set state
   *
   * @param state - Initial store state
   * @param options.isAlwaysNotify - notify listiners always [default: false]
   */
  setState(state: S) {
    for (const key of this.__keys) {
      this.__values[key].notify(state[key], ThisValueListenerGroup);
    }
  }

  /**
   * Get Store.__object
   *
   * @param isDeepCopy - is need to make a deep copy? [default: false
   * @returns
   */
  getObject(isDeepCopy = false) {
    if (isDeepCopy) {
      return structuredClone(this.__rootValue.value);
    }
    return this.__rootValue.value;
  }

  setObject(object: T) {
    for (const key of this.__keys) {
      let value: any = object;
      if (this.__values[key].path) {
        for (let i = 0; i < this.__values[key].path.length; i++) {
          value = value[this.__values[key].path[i]];
        }
      }
      this.__values[key].notify(value, ThisValueListenerGroup);
    }
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
  addListener<K extends keyof S>(key: K, listener: Listener<S, K>, options?: ListenerOptions) {
    let group = UserListenerGroup;
    if (options?.group) {
      group = options.group;
    }
    this.__values[key].addListener(listener, group);

    if (options?.isAutoCallListener) {
      listener(key, this.__values[key].value);
    }
  }

  /**
   * Removes a previously registered listener for a key.
   *
   * @param key Store key to subscribe to
   * @param listener Callback invoked on value changes
   */
  removeListener<K extends keyof S>(key: K, listener: Listener<S, K>) {
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
export const createStore = <T extends object, S extends object = T>(
  object: T,
  values?: PreValues<S>,
) => {
  return new Store<T, S>(object, values);
};
