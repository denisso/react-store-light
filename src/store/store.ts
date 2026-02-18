import { Value } from './value';

type DeepGetter<T> = (<K extends keyof T>(key: K) => DeepGetter<T[K]>) &
  (() => { value: T; path: string[] });

export const getStateValue = <T>(obj: T, currentPath: string[] = []): DeepGetter<T> => {
  const fn = ((key?: PropertyKey) => {
    if (key === undefined) {
      return {
        value: obj,
        path: currentPath,
      };
    }

    return getStateValue((obj as any)[key], [...currentPath, String(key)]);
  }) as DeepGetter<T>;

  return fn;
};

type PrepValues<S> = {
  [K in keyof S]: {
    path: string[];
    value: S[K];
  };
};

type TreeNode = {
  parent?: TreeNode;
  children?: Record<string, TreeNode>;
  values?: Record<string, Value>;
};

/**
 * Branding type Store
 */
export interface StoreBase {
  readonly __brand: 'Store';
}

export type SetOptions = Partial<{
  reason: symbol;
}>;

export type ListenerOptions = Pick<NonNullable<SetOptions>, 'reason'> & {
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

export class Store<T extends object, S extends object = T> {
  /**
   * Cached list of state keys.
   *
   * Initialized once from the initial state:
   * this.__keys = Object.keys(state) as (keyof T)[];
   */
  __keys: (keyof S)[];

  __object: T;

  __tree: TreeNode;

  __values: Record<keyof S, Value>;

  constructor(object: T, values?: PrepValues<S>) {
    this.__object = object;
    this.__keys = (values ? Object.keys(values) : Object.keys(object)) as (keyof S)[];
    let _values = values;
    if (!_values) {
      _values = {} as PrepValues<S>;
      for (const key of this.__keys) {
        _values[key] = getStateValue<any>(object)(key)();
      }
    }
    this.__tree = {};
    this.__values = {} as Record<keyof S, Value>;
    this.initValues(_values);
  }

  private initValues(values: PrepValues<S>) {
    for (const key of this.__keys) {
      let parent = this.__tree;
      for (let i = 0; i < values[key].path.length - 1; i++) {
        if (!parent.children) {
          parent.children = {};
        }
        let child = parent.children[values[key].path[i]];
        if (!child) {
          child = { parent };
        }
        parent.children[values[key].path[i]] = child;
        parent = child;
      }
      if (!parent.values) {
        parent.values = {};
      }
      this.__values[key] = new Value(values[key].path, values[key].value);
      parent.values[key as string] = this.__values[key];
    }
    return;
  }
  /**
   * Returns the current value for a given key.
   *
   * @param key K - key
   * @returns T[K] - value
   */
  get<K extends keyof S>(key: K) {
    return this.__values[key].value as S[K];
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
    this.__values[key].notify(value, options);
  }

  /**
   * Return state
   *
   * @returns state
   */
  getState(isDeepCopy = true) {
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
   * @param isAlwaysNotify - notify listiners always [default: false]
   */
  setState(state: S, options?: SetOptions) {
    for (const key of this.__keys) {
      this.__values[key].notify(state[key], options);
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
    this.__values[key].addListener(listener, options);
    return () => this.removeListener(key, listener);
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
  values?: PrepValues<S>,
) => {
  return new Store<T, S>(object, values);
};
