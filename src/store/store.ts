import { Subject } from './subject';
import { formatError } from '../helpers/error';

/**
 * Runtime check that ensures the key exists in the store object.
 * Even though TypeScript restricts keys at compile time,
 * this protects against invalid access at runtime.
 */
const checkKey = (object: object, key: PropertyKey) => {
  if (object.hasOwnProperty(key)) {
    return;
  }
  throw formatError['errorKeyMessage'](key);
};

/**
 * Internal store representation:
 * each property of the state is wrapped into a Subject.
 *
 * If T has no keys, Store<T> becomes never.
 */
type Values<T extends object> = keyof T extends never
  ? never
  : {
      [K in keyof T]: Subject<T, K>;
    };

/**
 * Listener signature for store updates.
 * Receives the key name and the new value.
 */
export type Listener<T extends object, K extends keyof T> = (name: K, value: T[K]) => void;

/**
 * Observer pattern based store
 */
export class Store<T extends object> {
  /**
   * Map of Subjects.
   *
   * Each Subject represents a single key of the state
   * and notifies its listeners when the value changes.
   */
  values: Values<T>;

  /**
   * Cached list of state keys.
   *
   * Initialized once from the initial state:
   * this.keys = Object.keys(state) as (keyof T)[];
   */
  keys: (keyof T)[];

  /**
   * Current store state.
   *
   * T is expected to be a plain object.
   */
  state: T;

  /**
   * id for slice
   */
  sliceId: {} | null;
  /**
   * Store constructor.
   *
   * Each property of the initial state is converted into a Subject,
   * allowing independent subscriptions per key.
   *
   * @param state - Initial store state
   * @param isMutateState - [optional] mutate state on value updates
   */
  constructor(state: T, sliceId: {} | null = null) {
    this.sliceId = sliceId;
    this.values = {} as Values<T>;
    this.state = state;
    this.keys = Object.keys(state) as (keyof T)[];
    // Initialize a Subject for each key in the initial state
    this.keys.forEach((key) => {
      this.values[key] = new Subject<T, keyof T>(key, state[key]) as unknown as Values<T>[keyof T];
    });
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
   * @param key K - key
   * @returns T[K] - value
   */
  get<K extends keyof T>(key: K) {
    checkKey(this.values, key);
    return this.values[key].value as T[K];
  }

  /**
   * Updates the value for a given key
   * and notifies all registered listeners.
   *
   * @param key - K - key
   * @param value - T[K] - value
   * @param isAlwaysNotify - notify listiners always
   */
  set<K extends keyof T>(key: K, value: T[K], isAlwaysNotify: boolean = false) {
    checkKey(this.values, key);
    (this.values[key] as unknown as Subject<T, K>).notify(value, isAlwaysNotify);
  }

  /**
   * return state
   *
   * @returns state
   */
  getState() {
    return this.state;
  }

  /**
   * Set state
   *
   * @param state - Initial store state
   * @param isAlwaysNotify - notify listiners always
   */
  setState(state: T, isAlwaysNotify: boolean = false) {
    this.state = state;
    for (const key of this.keys) {
      this.values[key].notify(this.state[key] as any, isAlwaysNotify);
    }
  }

  /**
   * Subscribes a listener to changes of a specific key.
   *
   * @param key Store key to subscribe to
   * @param listener Callback invoked on value changes
   * @param autoCallListener [default: false] - Whether to call the listener immediately
   *                         with the current value
   * @returns Unsubscribe function
   */
  addListener<K extends keyof T>(
    key: K,
    listener: Listener<T, K>,
    isAutoCallListener: boolean = false,
  ) {
    checkKey(this.values, key);
    (this.values[key] as unknown as Subject<T, K>).addListener(listener, isAutoCallListener);
    return () => this.removeListener(key, listener);
  }

  /**
   * Removes a previously registered listener for a key.
   *
   * @param key Store key to subscribe to
   * @param listener Callback invoked on value changes
   */
  removeListener<K extends keyof T>(key: K, listener: Listener<T, K>) {
    checkKey(this.values, key);
    (this.values[key] as unknown as Subject<T, K>).removeListener(listener);
  }
}

/**
 * Creates a new isolated store instance.
 *
 * Each property of the initial state is converted into a Subject,
 * allowing independent subscriptions per key.
 *
 * @param state - Initial store state
 * @returns Store API with get/set and subscription methods
 */
export const createStore = <T extends object>(state: T, sliceId: {} | null = null) => {
  return new Store<T>(state, sliceId);
};
