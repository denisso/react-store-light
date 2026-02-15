import type { Listener, ListenerOptions, SetOptions } from './store';

/**
 * Typed Value implements a simple observable pattern.
 * It stores a value, allows subscriptions, and notifies observers and listeners
 * when the value changes.
 */
export class Value<T extends object, K extends keyof T> {
  // Listeners will called when the value is changed
  private listeners: Set<Listener<T, K>>;
  // name for value in store
  private name: K;
  public value: T[K];
  constructor(name: K, value: T[K]) {
    this.name = name;
    this.listeners = new Set();
    this.value = value;
  }

  addListener(listener: Listener<T, K>, options?: ListenerOptions) {
    this.listeners.add(listener);
    if (options && options.isAutoCallListener) {
      listener(this.name, this.value, options);
    }
  }

  removeListener(listener: Listener<T, K>) {
    this.listeners.delete(listener);
  }

  /**
   * Update the value and notify subscribers.
   * @param value - new value
   * @param options - SetOptions
   * @returns undefined
   */
  notify(value: T[K], options?: SetOptions) {
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
      listener(this.name, this.value, _options);
    });
  }
}
