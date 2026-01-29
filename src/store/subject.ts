import type { Listener } from './store';

/**
 * Subject implements a simple observable pattern.
 * It stores a value, allows subscriptions, and notifies observers and listeners
 * when the value changes.
 */
export class Subject<T extends object, K extends keyof T> {
  // Listeners will called when the value is changed
  private listeners: Set<Listener<T,K>>;
  // name for value in store
  private name: K;
  public value: T[K];
  constructor(name: K, value: T[K]) {
    this.name = name;
    this.listeners = new Set();
    this.value = value;
  }

  addListener(listener: Listener<T,K>, autoCallListener: boolean = true) {
    this.listeners.add(listener);
    if (autoCallListener) {
      listener(this.name, this.value);
    }
  }

  removeListener(listener: Listener<T,K>) {
    this.listeners.delete(listener);
  }

  /**
   * Update the value and notify subscribers.
   * @param value - new value
   * @param isAlwaysNotify - notify listiners always
   * @returns undefined
   */
  notify(value: T[K], isAlwaysNotify: boolean) {

    if (!isAlwaysNotify && this.value === value) {
      return;
    }

    this.value = value;

    this.listeners.forEach((listener) => {
      listener(this.name, this.value);
    });
  }
}
