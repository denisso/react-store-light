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

export type TreeNode = {
  parent?: TreeNode | null;
  name: string;
  children?: Map<string, TreeNode>;
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

  __parentStore?: Store<any>;

  __headTreeNode: TreeNode = { name: '' };

  __parentTreeNode?: TreeNode;

  __values: Record<keyof S, Value> = {} as Record<keyof S, Value>;

  __object: T;

  constructor(object: T, prepValues?: PrepValues<S>) {
    this.__object = object;
    this.__keys = (prepValues ? Object.keys(prepValues) : Object.keys(object)) as (keyof S)[];
    if (!prepValues) {
      prepValues = {} as PrepValues<S>;
      for (const key of this.__keys) {
        prepValues[key] = getStateValue<any>(object)(key)();
      }
    }
    this.initTree(prepValues);
    this.shrinkTree();
  }

  private initTree(values: PrepValues<S>) {
    // init tree
    for (const key of this.__keys) {
      let parent = this.__headTreeNode;
      for (let i = 0; i < values[key].path.length - 1; i++) {
        if (!parent.children) {
          parent.children = new Map<string, TreeNode>();
        }
        let child = parent.children.get(values[key].path[i] as string);
        if (!child) {
          child = { parent, name: values[key].path[i] };
          parent.children.set(values[key].path[i], child);
        }

        parent = child;
      }
      if (!parent.values) {
        parent.values = {};
      }
      this.__values[key] = new Value(parent, values[key].value, key as string, values[key].path);
      parent.values[key as string] = this.__values[key];
    }
    return;
  }

  private shrinkTree = () => {
    const parentsStack: TreeNode[] = [];
    const stack: TreeNode[] = [this.__headTreeNode];
    const visited = new Set<TreeNode>();
    while (stack.length) {
      const node = stack.at(-1) as TreeNode;
      if (visited.has(node)) {
        const parent = stack.pop();
        if (parent === parentsStack.at(-1)) {
          parentsStack.pop();
        }
        continue;
      }
      visited.add(node);

      node.parent = null;

      if (!node.name || (node?.children && node.children.size > 1) || node.values) {
        if (parentsStack.length) {
          const parent = parentsStack.at(-1) as TreeNode;
          node.parent = parent;
          parent.children?.set(node.name, node);
        }
        parentsStack.push(node);
      } else {
        stack.pop();
      }

      if (node.children) {
        for (const child of node.children?.values()) {
          stack.push(child);
        }
        node.children.clear();
      }
    }
    return;
  };

  getObject(isDeepCopy = true) {
    if (isDeepCopy) {
      return structuredClone(this.__object);
    }
    return this.__object;
  }

  setObject(object: T) {
    for (const key of this.__keys) {
      let value: any = object;
      for (let i = 0; i < this.__values[key].path.length; i++) {
        value = value[this.__values[key].path[i]];
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
