type ChildId = bigint;
type ParentId = bigint;
type PathName = string;
type Listener = Function;
type Counter = number;

export class ListenersNode {
  // name, uniqId for name - for bottom top updates
  childrenCounter = 0n;
  listeners = new Map<ParentId, Map<Listener, Counter>>();
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

/**
 * Create part of the path
 * @param node - ListenersNode
 * @param childName - path[indx]
 * @param parentId - unique id for parent path[indx]
 * @returns bigint - parent id for next level
 */
function addChildNameToNode(node: ListenersNode, childName: string, parentId: bigint) {
  // Get a dictionary of child elements.
  let children = node.children.get(parentId);
  if (!children) {
    // Create a dictionary of child elements if it doesn't exist.
    children = new Map<PathName, ChildId>();
    node.children.set(parentId, children);
  }
  // Get unique IDs based on real names in the path.
  let childrenId = children.get(childName);

  if (childrenId === undefined) {
    // Generate a unique id for the name in this ListenersNode.
    childrenId = node.childrenCounter++;
    children.set(childName, childrenId);
  }
  // Associate a unique ID with the parent for traversal from "bottom to top".
  node.parents.set(childrenId, parentId);
  return childrenId;
}

/**
 * Subscribe listener and add path to listener
 * @param tree
 * @param path
 * @param listener
 * @returns
 */
export function subscribe(tree: ListenersTree, path: string[], listener: Function) {
  let nameId = tree.parentId;
  let node: ListenersNode = tree;
  // add path to listener and create ListenersNode's
  for (const name of path) {
    nameId = addChildNameToNode(node, name, nameId);
    if (!node.next) {
      node.next = new ListenersNode(node, node.depth + 1);
      node.next.prev = node;
    }
    node = node.next;
  }
  // add listener by path
  let listeners = node.listeners.get(nameId);
  if (!listeners) {
    listeners = new Map<Listener, Counter>();
    node.listeners.set(nameId, listeners);
  }
  const listenerCounter = listeners.get(listener);

  listeners.set(listener, (listenerCounter ?? 0) + 1);

  return () => {
    unSubscribe(node, path, nameId, listener);
  };
}

/**
 * Unsubscribe listener and remove path to listener
 * @param node
 * @param path
 * @param nameId
 * @param listener
 * @returns
 */
function unSubscribe(node: ListenersNode, path: string[], nameId: bigint, listener: Function) {
  // check the node containing the listener
  // delete listener
  const listeners = node.listeners.get(nameId);
  if (listeners && listeners.has(listener)) {
    let counter = listeners.get(listener);
    if (counter === undefined) {
      return;
    }
    counter--;
    if (counter == 0) {
      listeners.delete(listener);
    } else {
      listeners.set(listener, counter);
      return;
    }
  } else {
    return;
  }
  // if got children break, because they have listeners
  const children = node.children.get(nameId);
  if (listeners?.size || children?.size) {
    return;
  }
  node.listeners.delete(nameId);
  node.children.delete(nameId);
  // got to parent prev node
  let prev: ListenersNode | null = node.prev;
  while (prev) {
    // get parent id for check children and listeners on this node
    const parentId = prev.parents.get(nameId);

    // first delete child without listeners
    const name = path[prev.depth + 1];
    // Map<PathName, ChildId>
    const children = prev?.children?.get(parentId as bigint);
    children?.delete(name);
    // If child elements exists, then return
    if (children?.size) {
      return;
    }
    prev?.children?.delete(parentId as bigint);
    // If listeners exists by parentId, then return
    // Map<ParentId, Set<Listener>>
    const listeners = prev.listeners.get(parentId as bigint);
    if (listeners?.size) {
      return;
    }

    prev.listeners.delete(parentId as bigint);
    prev.parents.delete(nameId);
    //
    if (prev instanceof ListenersTree) {
      break;
    }
    prev = prev.prev;

    nameId = parentId as bigint;
  }
}
