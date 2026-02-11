import type { Listener, ListenerOptions, SetOptions } from './store';

/**
 * Typed Subject implements a simple observable pattern.
 * It stores a value, allows subscriptions, and notifies observers and listeners
 * when the value changes.
 */
export class Subject<T extends object, K extends keyof T> {
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
   * @param isAlwaysNotify - notify listiners always [default: false]
   * @param options - SetOptions
   * @returns undefined
   */
  notify(value: T[K], options?: SetOptions) {

    if (options && !options.isAlwaysNotify && this.value === value) {
      return;
    }

    this.value = value;

    this.listeners.forEach((listener) => {
      listener(this.name, this.value, options);
    });
  }
}
