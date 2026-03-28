export type ChildId = bigint;
export type ParentId = bigint;
export type PathName = string;
export type Listener = Function;
export type Counter = number;

export class ListenersNode {
  // name, uniqId for name - for bottom top updates
  childrenCounter = 0n;
  listeners = new Map<ParentId, Map<Listener, Counter>>();
  listenersCount = new Map<ParentId, number>();
  // for top bottom
  children = new Map<ParentId, Map<PathName, ChildId>>();
  next: ListenersNode | null = null;
  // for bottom top
  parents = new Map<ChildId, ParentId>();
  constructor(
    public prev: ListenersNode | null,
    public depth: number,
  ) {}
}

export class ListenersTree extends ListenersNode {
  parentId = 0n;
  constructor() {
    super(null, -1);
  }
}