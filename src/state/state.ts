type ChildId = bigint;
type ParentId = bigint;
type PropName = string;
type Listener = Function;

class StateNode {
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
  subsribe(path: string[], parentId: bigint) {
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
          if (!listener) {
            _self.unsubscribe(parentId);
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
    this.next.subsribe(path, childrenId);
  }
  unsubscribe(parentId: bigint) {
    if (this.children.has(parentId)) {
      return;
    }
    if (!this.prev) {
      return;
    }
    const prevParentId = this.prev.parents.get(parentId);
    if (prevParentId !== undefined) {
      this.prev.unsubscribe(prevParentId);
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
    let parentPseudo = this.parentsId.get(path[0]);
    if (parentPseudo === undefined) {
      parentPseudo = this.parentCounter++;
      this.parentsId.set(path[0], parentPseudo);
    }
    return super.subsribe(path, parentPseudo);
  }
}

export class State {
  tree = new StateRoot();
  constructor(public object: Record<string, any>) {}
  set(path: string[] = [], value: any) {}
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
