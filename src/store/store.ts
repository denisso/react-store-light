import { Value } from './value';
import { formatError } from '../helpers/error';

/**
 * Branding type Store
 */
export interface StoreBase {
  readonly __brand: 'Store';
}

export type SetOptions = Partial<{
  reason: symbol;
  visited: Set<Function>;
  isAlwaysNotify: boolean;
}>;

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
 * each property of the state is wrapped into a Value.
 *
 * If T has no keys, Store<T> becomes never.
 */
type Values<T extends object> = {
  [K in keyof T]: Value<T, K>;
};

export type ListenerOptions = Pick<NonNullable<SetOptions>, 'reason' | 'visited'> & {
  isAutoCallListener: boolean;
};
/**
 * Listener signature for store updates.
 * Receives the key name and the new value.
 */
export type Listener<T extends object, K extends keyof T> = (
  name: K,
  value: T[K],
  options?: Omit<ListenerOptions, 'isAutoCallListener'>,
) => void;

/**
 * Observer pattern based store
 */
export class Store<T extends object> implements StoreBase {
  readonly __brand = 'Store' as const;

  /**
   * Map of Values.
   *
   * Each Value represents a single key of the state
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
  private state: T;

  /**
   * Store constructor.
   *
   * Each property of the initial state is converted into a Value,
   * allowing independent subscriptions per key.
   *
   * @param state - Initial store state
   * @param keys - [optional] (keyof T)[]
   */
  constructor(state: T, keys?: (keyof T)[]) {
    this.values = {} as Values<T>;
    this.state = state;
    this.keys = keys ? keys : (Object.keys(state) as (keyof T)[]);
    // Initialize a Value for each key in the initial state
    this.keys.forEach((key) => {
      this.values[key] = new Value<T, keyof T>(key, state[key]) as unknown as Values<T>[keyof T];
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
   * @param options.isAlwaysNotify - notify listiners always
   * @param options.runsCount - number of runs [default: false]
   */
  set<K extends keyof T>(key: K, value: T[K], options?: SetOptions) {
    checkKey(this.values, key);
    (this.values[key] as unknown as Value<T, K>).notify(value, options);
  }

  /**
   * Return state
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
   * @param isAlwaysNotify - notify listiners always [default: false]
   */
  setState(state: T, options?: SetOptions) {
    this.state = state;
    for (const key of this.keys) {
      this.values[key].notify(this.state[key] as any, options);
    }
  }

  /**
   * Make deep copy
   *
   * @param isRewriteSelf - is rewrite this.state [default: false]
   */
  makeDeepCopy(isRewriteSelf = false) {
    const state = structuredClone(this.state);

    if (isRewriteSelf) {
      this.state = state;
      this.setState(state);
    }

    return this.state;
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
  addListener<K extends keyof T>(key: K, listener: Listener<T, K>, options?: ListenerOptions) {
    checkKey(this.values, key);

    (this.values[key] as unknown as Value<T, K>).addListener(listener, options);
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
    (this.values[key] as unknown as Value<T, K>).removeListener(listener);
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
export const createStore = <T extends object>(state: T) => {
  return new Store<T>(state);
};
