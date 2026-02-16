import type { Listener, ListenerOptions, SetOptions } from '../store/store';

type PrepValues<S> = {
  [K in keyof S]: {
    object: any;
    key: any;
    value: S[K];
  };
};

class Value {
  path: string[];
  key: string;
  value: any;
  listeners: Set<Function>;
  constructor(path: string[], key: string, value: any) {
    this.path = path;
    this.key = key;
    this.value = value;
    this.listeners = new Set();
  }
  initValue() {}
  setValue(state: object, target: object) {}
  addListener(listener: Function, options?: ListenerOptions) {
    this.listeners.add(listener);
    if (options && options.isAutoCallListener) {
      listener(this.key, this.value, options);
    }
  }

  removeListener(listener: Function) {
    this.listeners.delete(listener);
  }

  /**
   * Update the value and notify subscribers.
   * @param value - new value
   * @param options - SetOptions
   * @returns undefined
   */
  notify(value: any, options?: SetOptions) {
    if (this.value === value) {
      return;
    }

    this.value = value;
    let _options: SetOptions | undefined;

    if (options) {
      _options = {};
      if (options.hasOwnProperty('reason')) _options.reason = options.reason;
    }
    this.listeners.forEach((listener) => {
      listener(this.key, this.value, _options);
    });
  }
}

export const getStateValue = <T extends object, K extends keyof T>(object: T, key: K) => {
  return {
    object,
    key,
  } as {
    object: T;
    key: K;
    value: T[K];
  };
};



export class Store2<T extends object, S extends object = T> {
  /**
   * Cached list of state keys.
   *
   * Initialized once from the initial state:
   * this.keys = Object.keys(state) as (keyof T)[];
   */
  keys: (keyof S)[];

  object: T;
  constructor(object: T, values?: PrepValues<S>) {
    this.object = object;
    this.keys = (values ? Object.keys(values) : Object.keys(object)) as (keyof S)[];
    let _values = values;
    if (!_values) {
      _values = {} as PrepValues<S>;
      for (const key of this.keys) {
        _values[key] = getStateValue(object, key as unknown as keyof T) as unknown as ReturnType<
          typeof getStateValue<S, keyof S>
        >;
      }
    }

    _values;
  }

  initValues(object: T, values: PrepValues<S>) {
    
  }
}
