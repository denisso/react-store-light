import { Subject } from './subject';
import { formatError } from '../helpers/error';
import { IStoreID } from '../types';

/**
 * Branding type Store
 */
export interface StoreBase {
  readonly __brand: 'Store';
}

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
 * each property of the ref is wrapped into a Subject.
 *
 * If T has no keys, Store<T> becomes never.
 */
type Values<T extends object> = {
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
export class Store<T extends object> implements StoreBase {
  readonly __brand = 'Store' as const;

  /**
   * Map of Subjects.
   *
   * Each Subject represents a single key of the ref
   * and notifies its listeners when the value changes.
   */
  values: Values<T>;

  /**
   * Cached list of ref keys.
   *
   * Initialized once from the initial ref:
   * this.keys = Object.keys(ref) as (keyof T)[];
   */
  keys: (keyof T)[];

  /**
   * Current store ref.
   *
   * T is expected to be a plain object.
   */
  ref: T;

  /**
   * unused but may be used ;)
   */
  storeId: IStoreID = Symbol();
  /**
   * Store constructor.
   *
   * Each property of the initial ref is converted into a Subject,
   * allowing independent subscriptions per key.
   *
   * @param ref - Initial store ref
   * @param isMutateState - [optional] mutate ref on value updates
   */
  constructor(ref: T) {
    this.values = {} as Values<T>;
    this.ref = ref;
    this.keys = Object.keys(ref) as (keyof T)[];
    // Initialize a Subject for each key in the initial ref
    this.keys.forEach((key) => {
      this.values[key] = new Subject<T, keyof T>(key, ref[key]) as unknown as Values<T>[keyof T];
    });
    this.get = this.get.bind(this);
    this.set = this.set.bind(this);
    this.getRef = this.getRef.bind(this);
    this.setRef = this.setRef.bind(this);
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
   * return ref
   *
   * @returns ref
   */
  getRef() {
    return this.ref;
  }

  /**
   * Set ref
   *
   * @param ref - Initial store ref
   * @param isAlwaysNotify - notify listiners always
   */
  setRef(ref: T, isAlwaysNotify: boolean = false) {
    this.ref = ref;
    for (const key of this.keys) {
      this.values[key].notify(this.ref[key] as any, isAlwaysNotify);
    }
  }
  /**
   * i go watch scrims with my friends 
   */
  deepCopt(){
    // not implemented yet =)
  }
  /**
   * Subscribes a listener to changes of a specific key.
   *
   * @param key Store key to subscribe to
   * @param listener Callback invoked on value changes
   * @param autoCallListener [default: false] - Whether to call the listener immediately
   *                         with the current value
   * @returns UnSubscribe function
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
 * Each property of the initial ref is converted into a Subject,
 * allowing independent subscriptions per key.
 *
 * @param ref - Initial store ref
 * @returns Store API with get/set and subscription methods
 */
export const createStore = <T extends object>(ref: T) => {
  return new Store<T>(ref);
};
