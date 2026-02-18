import type { ListenerOptions, SetOptions } from '../store/store';

/**
 * Typed Value implements a simple observable pattern.
 * It stores a value, allows subscriptions, and notifies observers and listeners
 * when the value changes.
 */
export class Value {
  path: string[];
  children: object[];
  parent: object | null;
  key: string;
  value: any;
  listeners: Set<Function>;
  constructor(path: string[], value: any) {
    this.path = path;
    this.key = path.pop() as string;
    this.value = value;
    this.parent = null;
    this.children = [];
    this.listeners = new Set();
  }

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
