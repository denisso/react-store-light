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

export type PrepValues<S> = {
  [K in keyof S]: {
    path: string[];
    value: S[K];
  };
};

type TreeNode = {
  children?: Record<string, TreeNode>;
  key?: string;

  // valDeep: number
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
 * template param 'S' is state of Store
 */
export type Listener<S extends object, K extends keyof S> = (
  name: K,
  value: S[K],
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

  __parentStore?: Store<any>;

  __values: Record<keyof S, Value> = {} as Record<keyof S, Value>;

  __rootValue: Value;

  __object: T;

  constructor(object: T, prepValues?: PrepValues<S>) {
    this.__object = object;
    this.__rootValue = new Value(object);
    this.__keys = (prepValues ? Object.keys(prepValues) : Object.keys(object)) as (keyof S)[];
    if (!prepValues) {
      prepValues = {} as PrepValues<S>;
      for (const key of this.__keys) {
        prepValues[key] = getStateValue<any>(object)(key)();
      }
    }
    this.__rootValue.children = new Map();
    this.get = this.get.bind(this);
    this.set = this.set.bind(this);
    this.getState = this.getState.bind(this);
    this.setState = this.setState.bind(this);
    this.addListener = this.addListener.bind(this);
    this.removeListener = this.removeListener.bind(this);

    this.initValues(prepValues);
  }

  private initValues(values: PrepValues<S>) {
    const tree: TreeNode = {};
    for (const key of this.__keys) {
      let parent = tree;
      for (const name of values[key].path) {
        if (!parent.children) {
          parent.children = {};
        }
        let child = parent.children[name];
        if (!child) {
          child = {};
          parent.children[name] = child;
        }

        parent = child;
      }
      if (parent.key) {
        throw Error('not allowed property with same path');
      }
      parent.key = key as string;
    }
    this.shrinkTreeAndInitValues(values, tree);
    return;
  }

  private shrinkTreeAndInitValues(values: PrepValues<S>, tree: TreeNode) {
    const stack = Object.values(tree.children ?? {});
    const parents: Value[] = [this.__rootValue];
    const visited = new Set<TreeNode>();
    while (stack.length) {
      const node = stack.at(-1) as TreeNode;
      if (visited.has(node)) {
        // stack.at(-1) and parents.at(-1) cannot be undefined
        if ((stack.pop() as TreeNode).key === (parents.at(-1) as Value).key) {
          parents.pop();
        }
        continue;
      }
      visited.add(node);

      if (typeof node.key === 'string') {
        const parentValue = parents.at(-1) as Value;
        if (!parentValue.children) {
          parentValue.children = new Map();
        }

        const value = new Value(
          values[node.key as keyof S].value,
          node.key,
          values[node.key as keyof S].path,
          parentValue,
        );
        this.__values[node.key as keyof S] = value;
        parentValue.children.set(node.key, value);

        if (node.children) {
          parents.push(value);
        }
      } else {
        stack.pop();
      }
      if (!node.children) {
        continue;
      }
      for (const key of Object.keys(node.children)) {
        stack.push(node.children[key]);
      }
    }
    return;
  }

  getObject(isDeepCopy = true) {
    if (isDeepCopy) {
      return structuredClone(this.__object);
    }
    return this.__object;
  }

  setObject(object: T) {
    for (const key of this.__keys) {
      let value: any = object;
      if (this.__values[key].path) {
        for (let i = 0; i < this.__values[key].path.length; i++) {
          value = value[this.__values[key].path[i]];
        }
      }
      this.set(key, value);
    }
    this.__object = object;
  }
  /**
   * Returns the current value for a given key.
   *
   * @param key K - key
   * @returns T[K] - value
   */
  get<K extends keyof S>(key: K, isDeepCopy = true) {
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
