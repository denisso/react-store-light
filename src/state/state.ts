import { ListenersTree, subscribe } from './listeners';
import { Accessor } from '../helpers';

export class State {
  listenersTree = new ListenersTree();
  constructor(public values: Record<string, any>) {
    this.set = this.set.bind(this);
    this.get = this.get.bind(this);
    this.subsribe = this.subsribe.bind(this);
    this.setValues = this.setValues.bind(this);
    this.getValues = this.getValues.bind(this);
  }
  getValues(isDeepCopy = false) {
    if (isDeepCopy) {
      return structuredClone(this.values);
    }
    return this.values;
  }

  setValues(values: Record<string, any>) {
    // const prev = this.values;
    // this.values = values;
    // const keys = Object.keys(values);
    // for (const key of keys) {
    //   this._notifyBroadCast;
    // }
  }
  set(path: string[], value: any, parentAccessor?: Accessor) {
    // let parentId = this.listenersTree.parentsId.get(path[0]);
    // let parent = this.values;
    // if (parentAccessor) {
    //   parent = parentAccessor(this);
    // } else if (path instanceof Array) {
    //   for (let i = 0; i < path.length - 1; i++) {
    //     parent = parent[path[i]];
    //   }
    // }
    // parent[path.at(-1) as string] = value;
    // if (parentId !== undefined) {
    //   this._notifyByPath(path, parentId);
    // }
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
  subsribe(path: string[], listener: Function) {
    // let node: TreeNode;
    return subscribe(this.listenersTree, path, listener);
  }
}
