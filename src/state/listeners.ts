type ChildId = bigint;
type ParentId = bigint;
type PropName = string;
type Listener = Function;

export class ListenersNode {
  // name, uniqId for name - for bottom top updates
  childrenCounter = 0n;
  listeners = new Map<ParentId, Set<Listener>>();
  // for top bottom
  children = new Map<ParentId, Map<PropName, ChildId>>();
  next: ListenersNode | null = null;
  // for bottom top
  parents = new Map<ChildId, ParentId>();
  constructor(
    public prev: ListenersNode | null,
    public depth: number,
  ) {}
}

export class ListenersTree extends ListenersNode {
  nameToId = new Map<string, bigint>();
  parentCounter = 0n;
  constructor() {
    super(null, -1);
  }
}

/**
 *
 * @param node
 * @param path - string[]
 * @param parentId - used in node.listeners Map<ParentId, Set<Listener>>
 * @returns bigint - parent id for next level
 */
function addChildNameToNode(node: ListenersNode, name: string, parentId: bigint) {
  // Get a dictionary of child elements.
  let children = node.children.get(parentId);
  if (!children) {
    // Create a dictionary of child elements if it doesn't exist.
    children = new Map<PropName, ChildId>();
    node.children.set(parentId, children);
  }
  // Get unique IDs based on real names in the path.
  let childrenId = children.get(name);

  if (childrenId === undefined) {
    // Generate a unique id for the name in this ListenersNode.
    childrenId = node.childrenCounter++;
    children.set(name, childrenId);
  }
  // Associate a unique ID with the parent for traversal from "bottom to top".
  node.parents.set(childrenId, parentId);
  return childrenId;
}

export function subscribe(tree: ListenersTree, path: string[], listener: Function) {
  let topNameId = tree.nameToId.get(path[0]);
  if (topNameId === undefined) {
    // Add new top name to root node tree
    topNameId = tree.parentCounter++;
    tree.nameToId.set(path[0], topNameId);
  }
  let nameId = topNameId;
  let nextNode: ListenersNode = tree;
  for (const name of path) {
    //
    nameId = addChildNameToNode(nextNode, name, nameId);
    if (!nextNode.next) {
      nextNode.next = new ListenersNode(nextNode, nextNode.depth + 1);
      nextNode.next.prev = nextNode;
    }
    nextNode = nextNode.next;
  }
  let listeners = nextNode.listeners.get(nameId);
  if (!listeners) {
    listeners = new Set<Listener>();
    nextNode.listeners.set(nameId, listeners);
  }
  listeners.add(listener);

  return () => {
    unSubscribe(nextNode, path, nameId, listener);
  };
}

function unSubscribe(node: ListenersNode, path: string[], nameId: bigint, listener: Function) {
  let listeners = node.listeners.get(nameId);
  if (listeners && listeners.has(listener)) {
    listeners.delete(listener);
  }
  if (listeners?.size) {
    return;
  }
  node.listeners.delete(nameId);
  let prev: ListenersNode | null = node;
  while (prev) {
    const parentId = prev.parents.get(nameId);
    const name = path[prev.depth];
    const children = prev.children.get(parentId as bigint);
    children?.delete(name);
    if (children?.size) {
      return;
    }
    listeners = prev.listeners.get(parentId as bigint);
    if (listeners?.size) {
      return;
    }
    prev = prev.prev;
  }
}
/**
 *
 * @param node
 * @param childId
 */
export function removePathById(node: ListenersNode, path: string[], parentId: bigint) {
  const children = node.children.get(parentId);
  const name = path[node.depth];
  if (children?.size) {
    node.children.delete(parentId);
  }
  const prevParentId = node.prev?.parents.get(parentId);
  // node.prev?.children.get();
}
