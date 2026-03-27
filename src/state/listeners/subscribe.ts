type ChildId = bigint;
type ParentId = bigint;
type PathName = string;
type Listener = Function;
type Counter = number;

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

/**
 * Create part of the path
 * traverse top to bottom
 * @param node - ListenersNode
 * @param childName - path[indx]
 * @param parentId - unique id for parent path[indx]
 * @returns ParentId - parent id for next level
 */
function addChildNameToNode(node: ListenersNode, childName: string, parentId: ParentId) {
  // Update counter
  let listenersCount = node.listenersCount.get(parentId);
  if (listenersCount === undefined) {
    listenersCount = 0;
  }
  node.listenersCount.set(parentId, listenersCount + 1);

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
  let parentId = tree.parentId;
  let node: ListenersNode = tree;
  // add path to listener and create ListenersNode's
  for (const name of path) {
    parentId = addChildNameToNode(node, name, parentId);
    if (!node.next) {
      node.next = new ListenersNode(node, node.depth + 1);
      node.next.prev = node;
    }
    node = node.next;
  }
  // Update counter
  let listenersCount = node.listenersCount.get(parentId);
  if (listenersCount === undefined) {
    listenersCount = 0;
  }
  node.listenersCount.set(parentId, listenersCount + 1);

  // add listener by path
  let listeners = node.listeners.get(parentId);
  if (!listeners) {
    listeners = new Map<Listener, Counter>();
    node.listeners.set(parentId, listeners);
  }

  listeners.set(listener, (listeners.get(listener) ?? 0) + 1);

  return () => {
    unSubscribe(node, path, parentId, listener);
  };
}

function decreaseCounter(node: ListenersNode, childId: ChildId) {
  let prevNode: ListenersNode | null = node;
  let prevId: ChildId | undefined = childId;
  while (prevId !== undefined && prevNode) {
    let counter = (prevNode.listenersCount.get(prevId) ?? 1) - 1;
    if (counter) {
      prevNode.listenersCount.set(prevId, counter);
    } else {
      prevNode.listenersCount.delete(prevId);
    }

    prevNode = prevNode.prev;
    prevId = prevNode?.parents.get(prevId);
  }
}

/**
 * Unsubscribe listener and remove path to listener
 * traverse bottom to top
 * @param node
 * @param path
 * @param nameId
 * @param listener
 * @returns
 */
function unSubscribe(node: ListenersNode, path: string[], childId: ChildId, listener: Function) {
  decreaseCounter(node, childId);
  // check the node containing the listener
  // delete listener
  const listeners = node.listeners.get(childId);
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
  const children = node.children.get(childId);
  if (listeners?.size || children?.size) {
    return;
  }
  node.listeners.delete(childId);
  node.children.delete(childId);
  // got to parent prev node
  let prev: ListenersNode | null = node.prev;
  while (prev) {
    // get parent id for check children and listeners on this node
    const parentId = prev.parents.get(childId);

    // first delete child without listeners
    const name = path[prev.depth + 1];
    // Map<PathName, ChildId>
    const children = prev?.children?.get(parentId as ParentId);
    children?.delete(name);
    // If child elements exists, then return
    if (children?.size) {
      return;
    }
    prev?.children?.delete(parentId as ParentId);
    // If listeners exists by parentId, then return
    // Map<ParentId, Set<Listener>>
    const listeners = prev.listeners.get(parentId as ParentId);
    if (listeners?.size) {
      return;
    }

    prev.listeners.delete(parentId as ParentId);
    prev.parents.delete(childId);
    //
    if (prev instanceof ListenersTree) {
      break;
    }
    prev = prev.prev;

    childId = parentId as ParentId;
  }
}
