type ChildId = bigint;
type ParentId = bigint;
type PropName = string;
type Listener = Function;
type Subscribe = (listener: Function) => () => void;

export class StateNode {
  // name, uniqId for name - for bottom top updates
  childrenCounter = 0n;
  listeners = new Map<ParentId, Set<Listener>>();
  // for top bottom
  children = new Map<ParentId, Map<PropName, ChildId>>();
  next: StateNode | null = null;
  // for bottom top
  parents = new Map<ChildId, ParentId>();
  constructor(
    public prev: StateNode | null,
    public depth: number,
  ) {
    this.subsribe = this.subsribe.bind(this);
  }
  subsribe(path: string[], parentId: bigint): Subscribe {
    if (this.depth == path.length - 1) {
      // register and return listener
      const _self = this;
      return (listener: Function) => {
        let listeners = this.listeners.get(parentId);
        if (listeners === undefined) {
          listeners = new Set();
          this.listeners.set(parentId, listeners);
        }
        listeners.add(listener);
        return () => {
          listeners.delete(listener);
          if (!listeners.size) {
            _self.unSubscribe(path, parentId);
          }
        };
      };
    }

    let children = this.children.get(parentId);
    if (!children) {
      children = new Map();
      this.children.set(parentId, children);
    }
    let childrenId = children.get(path[this.depth]);

    if (childrenId === undefined) {
      childrenId = this.childrenCounter++;
      children.set(path[this.depth], childrenId);
    }
    this.parents.set(childrenId, parentId);
    if (!this.next) {
      this.next = new StateNode(this, this.depth + 1);
    }
    return this.next.subsribe(path, childrenId);
  }
  unSubscribe(path: string[], parentId: bigint) {
    const listeners = this.listeners.get(parentId);
    if (listeners && listeners.size) {
      return;
    }
    this.children.delete(parentId);
    if (!this.prev) {
      return;
    }
    const prevParentId = this.prev.parents.get(parentId);

    if (prevParentId !== undefined) {
      this.prev.unSubscribe(path, prevParentId);
    }
  }
}

export class StateRoot extends StateNode {
  parentsId = new Map<string, bigint>();
  parentCounter = 0n;
  constructor() {
    super(null, 0);
    this.subsribe = this.subsribe.bind(this);
  }
  subsribe(path: string[]) {
    let parentId = this.parentsId.get(path[0]);
    if (parentId === undefined) {
      parentId = this.parentCounter++;
      this.parentsId.set(path[0], parentId);
    }
    return super.subsribe(path, parentId);
  }
}

export class State {
  tree = new StateRoot();
  constructor(public object: Record<string, any>) {
    this.set = this.set.bind(this);
    this.get = this.get.bind(this);
    this.subsribe = this.subsribe.bind(this);
  }
  getState(isDeepCopy = false) {
    if (isDeepCopy) {
      return structuredClone(this.object);
    }
    return this.object;
  }
  setState(object: Record<string, any>) {
    // not implemented yet
  }
  set(path: string[] = [], value: any) {
    let indxPath = 0;
    let next = this.tree;
    let parentObject = this.object;

    let parentId = this.tree.parentsId.get(path[0]);

    while (indxPath < path.length) {
      let object = parentObject[path[indxPath]];
      let prev = object;
      if (object === undefined) {
        object = {};
        parentObject[path[indxPath]] = object;
      }
      if (parentId !== undefined) {
        const children = next.children.get(parentId);
        const listeners = next.listeners.get(parentId);
        if (listeners?.size) {
          if (object instanceof Object) {
            if (prev === object) {
              object = { ...object };
            }
          } else {
            parentObject[path[indxPath]] = value;
            object = value;
          }
          for (const listener of listeners) {
            listener();
          }
        }
        parentId = children?.get(path[indxPath]);
      }

      parentObject = object;
      indxPath++;
    }
  }
  get(path: string[]) {
    let value = this.object;
    for (const name of path) {
      if (value instanceof Object) {
        value = value[name];
      } else {
        break;
      }
    }
    return value;
  }
  subsribe(path: string[]) {
    // let node: TreeNode;
    return this.tree.subsribe(path);
  }
}
