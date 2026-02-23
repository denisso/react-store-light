import type { ListenerOptions, SetOptions } from './store';

const UPDATE_TREE = Symbol();

const ArrayPlaceholder: any[] = [];
/**
 * Typed Value implements a simple observable pattern.
 * It stores a value, allows subscriptions, and notifies observers and listeners
 * when the value changes.
 */
export class Value {
  private listeners?: Set<Function>;
  children?: Map<string, Value>;
  constructor(
    public value: any,
    public key: string | null = null,
    public path: string[] = ArrayPlaceholder,
    public parent: Value | null = null,
  ) {}

  addListener(listener: Function, options?: ListenerOptions) {
    if (!this.listeners) {
      // lazy inintialization Set listeners
      this.listeners = new Set();
    }
    this.listeners.add(listener);
    if (options && options.isAutoCallListener) {
      listener(this.key, this.value, options);
    }
  }

  removeListener(listener: Function) {
    if (this.listeners) this.listeners.delete(listener);
  }

  private notifyParents = () => {
    let parent = this.parent;
    let prevParent: Value = this;

    while (parent) {
      let value = parent.value;
      let indxPath = parent.path.length;
      for (; indxPath < prevParent.path.length - 1; indxPath++) {
        value = value[prevParent.path[indxPath]];
      }
      value[prevParent.path[indxPath]] = prevParent.value;
      parent.notify(parent.value, { reason: UPDATE_TREE });
      prevParent = parent;
      parent = parent.parent;
    }
  };

  private notifyChildren = () => {
    if (!this.children) {
      return;
    }

    const parents: Value[] = [this];
    while (parents.length) {
      const parent = parents.pop() as Value;

      if (!parent.children) {
        continue;
      }
      for (const child of parent.children.values()) {
        let indxPath = parent.path.length;
        let value = parent.value;
        for (; indxPath < child.path.length - 1; indxPath++) {
          value = value[child.path[indxPath]];
        }
        child.notify(value[child.path[indxPath]], { reason: UPDATE_TREE });
        if (child.children) {
          parents.push(child);
        }
      }
    }
  };
  /**
   * Update the value and notify subscribers.
   * @param value - new value
   * @param options - SetOptions
   * @returns undefined
   */
  notify(value: any, options?: SetOptions) {
    this.value = value;
    if (options?.reason !== UPDATE_TREE) {
      this.notifyParents();
      this.notifyChildren();
    }

    let _options: SetOptions | undefined;

    if (options) {
      _options = {};
      if (options.hasOwnProperty('reason')) _options.reason = options.reason;
    }
    if (this.listeners) {
      this.listeners.forEach((listener) => {
        listener(this.key, this.value, _options);
      });
    }
  }
}
