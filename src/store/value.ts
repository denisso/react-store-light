import type { ListenersGroup, ValueListener } from './types';

const ArrayPlaceholder: any[] = [];

/**
 * Typed Value implements a simple observable pattern.
 * It stores a value, allows subscriptions, and notifies observers and listeners
 * when the value changes.
 */
export class Value {
  private groups: Map<ListenersGroup, Set<ValueListener>> = new Map();
  private listeners: Map<ValueListener, ListenersGroup> = new Map();
  children?: Map<string, Value>;
  constructor(
    public key: string | null,
    public value: any,
    public path: string[] = ArrayPlaceholder,
    public parent: Value | null = null,
  ) {}

  addListener(listener: Function, group: symbol) {
    let groupSet = this.groups.get(group);
    if (!groupSet) {
      groupSet = new Set();
      this.groups.set(group, groupSet);
    }
    this.listeners.set(listener, group);
    groupSet.add(listener);
  }

  removeListener(listener: Function) {
    const group = this.listeners.get(listener);
    this.listeners.delete(listener);
    if (!group) {
      return;
    }
    // without delete group with size 0 for optimization time
    // because i think group not too much,
    // and group with size 0 not a big memory problem
    const listenersSet = this.groups.get(group);
    listenersSet?.delete(listener);
  }

  /**
   * Update the value and notify addListenerrs.
   * @param value - new value
   * @param options - SetOptions
   * @returns undefined
   */
  notify(value: any, group: ListenersGroup) {
    this.value = value;

    const listeners = this.groups.get(group);
    if (!listeners) {
      return;
    }
    listeners.forEach((listener) => {
      listener(this.key, this.value, { group });
    });
  }
}
