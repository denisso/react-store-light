import { ListenersNode, ListenersTree } from './subscribe';
import type { Values } from '../state';

function notifyListeners(
  node: ListenersNode,
  nemeId: bigint,
  parent: Record<string, any>,
  key: string,
) {
  const listeners = node.listeners.get(nemeId);

  let values;

  if (parent instanceof Object && parent.hasOwnProperty(key)) {
    values = parent[key];
  }
  if (listeners?.size) {
    if (values instanceof Object) {
      values = { ...values };
      parent[key] = values;
    }
    for (const listener of listeners.keys()) {
      listener(values);
    }
  }
  return values;
}

/**
 *
 * @param tree
 * @param path
 * @param values
 */
export function notifyByPath(tree: ListenersTree, path: string[], values: Values) {
  let parentId = tree.parentId;
  let next: ListenersNode = tree;

  for (const name of path) {
    values = notifyListeners(next, parentId, values, name);
    const children = next.children.get(parentId);
    parentId = children?.get(name) as bigint;
    // end of the path
    if (parentId === undefined || !next.next) {
      return;
    }
    next = next.next;
  }

  notifyBroadcast(next, parentId, values);
}
/**
 * DFS
 * @param node
 * @param parentId
 * @param values
 * @returns
 */
export function notifyBroadcast(node: ListenersNode, parentId: bigint, values: Values) {
  const stackNodes = [node];
  const stackValues = [values];
  const stackIds = [parentId];
  while (stackNodes.length) {
    const parentId = stackIds.pop();
    const values = stackValues.pop();
    const node = stackNodes.pop();

    if (!node || parentId === undefined) {
      continue;
    }

    const listeners = node.listeners.get(parentId);
    if (listeners) {
      for (const listener of listeners.keys()) {
        listener(values);
      }
    }
    const children = node.children.get(parentId);
    if (!children) {
      continue;
    }

    for (const name of children.keys()) {
      const childId = children.get(name) as bigint;
      if (childId === undefined || !node.next) {
        continue;
      }
      stackIds.push(childId);
      stackNodes.push(node.next);
      if (values instanceof Object) {
        stackValues.push(values[name]);
      } else {
        stackValues.push(undefined as unknown as Values);
      }
    }
  }
}
