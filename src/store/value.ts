import type { ListenerOptions, SetOptions, TreeNode } from './store';

/**
 * Typed Value implements a simple observable pattern.
 * It stores a value, allows subscriptions, and notifies observers and listeners
 * when the value changes.
 */
export class Value {
  private listeners = new Set<Function>();
  constructor(
    public node: TreeNode,
    public value: any,
    public key: string,
    public path: string[],
  ) {}

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
