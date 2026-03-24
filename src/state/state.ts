import { ListenersTree, subscribe } from './listeners/subscribe';
import { notifyByPath, notifyBroadcast } from './listeners/notify';
import { type Accessor } from './compile-accessor';

export type Values = Record<string, any>;

export class State {
  listenersTree = new ListenersTree();
  values: Values;
  constructor(values: Values) {
    this.values = structuredClone(values);
    this.set = this.set.bind(this);
    this.get = this.get.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.setValues = this.setValues.bind(this);
    this.getValues = this.getValues.bind(this);
  }

  getValues(isDeepCopy = false) {
    if (isDeepCopy) {
      return structuredClone(this.values);
    }
    return this.values;
  }

  setValues(values: Values) {
    this.values = structuredClone(values);
    notifyBroadcast(this.listenersTree, this.listenersTree.parentId, values);
  }
  set(path: string[], value: any, parentAccessor?: Accessor) {
    let parent = this.values;
    if (parentAccessor) {
      parent = parentAccessor(this, true);
    } else if (path instanceof Array) {
      for (let i = 0; i < path.length - 1; i++) {
        parent = parent[path[i]];
      }
    }
    parent[path.at(-1) as string] = structuredClone(value);
    notifyByPath(this.listenersTree, path, this.values);
  }
  get(path: string[]) {
    let value = this.values;
    for (const name of path) {
      if (value instanceof Object) {
        value = value[name];
      } else {
        break;
      }
    }
    return value;
  }
  subscribe(path: string[], listener: Function) {
    return subscribe(this.listenersTree, path, listener);
  }
}
