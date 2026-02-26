import { Store } from '../store';
import { FormatError } from '../../helpers/error';
import type { PreValues } from '../types';
import { Value } from '../value';
import { ParentValueListenerGroup, ChildrenValueListenerGroup } from '../constants';
type TreeNode = {
  children?: Record<string, TreeNode>;
  key?: string;
};

export function initValues(preValues: PreValues<any>, store: Store<any>) {
  const keys = store.__keys as string[];
  const rootValue = store.__rootValue;
  const tree: TreeNode = {};
  for (const key of keys) {
    let parent = tree;
    for (const name of preValues[key].path) {
      if (!parent.children) {
        parent.children = {};
      }
      let child = parent.children[name];
      if (!child) {
        child = {};
        parent.children[name] = child;
      }

      parent = child;
    }
    if (parent.key) {
      throw FormatError['notAllowedStoreProp']();
    }
    parent.key = key as string;
  }

  return shrinkTreeAndInitValues(preValues, tree, rootValue);
}

function initValue(
  node: TreeNode,
  parents: Value[],
  preValues: PreValues<any>,
  values: Record<string, Value>,
) {
  if (typeof node.key !== 'string') {
    return false;
  }
  const parentValue = parents.at(-1) as Value;
  if (!parentValue.children) {
    parentValue.children = new Map();
  }

  const value = new Value(
    node.key,
    preValues[node.key].value,
    preValues[node.key].path,
    parentValue,
  );
  values[node.key] = value;
  parentValue.children.set(node.key, value);

  if (node.children) {
    parents.push(value);
  }
  return true;
}

function addChildrenListener(parent: Value) {
  if (!parent.children) {
    return;
  }
  parent.addListener(() => {
    if (!parent.children) {
      return;
    }
    for (const child of parent.children.values()) {
      let indxPath = parent.path.length;
      let value = parent.value;
      for (; indxPath < child.path.length; indxPath++) {
        value = value[child.path[indxPath]];
      }
      child.notify(value, ChildrenValueListenerGroup);
    }
  }, ChildrenValueListenerGroup);
}

function addParentListener(child: Value) {
  if (!child.parent || !child.parent.key) {
    return;
  }
  const parent = child.parent;
  let value = parent.value;
  child.addListener(() => {
    let indxPath = parent.path.length;
    for (; indxPath < child.path.length - 1; indxPath++) {
      value = value[child.path[indxPath]];
    }
    value[child.path[indxPath]] = child.value;
    parent.notify(parent.value, ParentValueListenerGroup);
  }, ParentValueListenerGroup);
}

function addListeners(values: Record<string, Value>) {
  // update from parent to children
  for (const value of Object.values(values)) {
    addChildrenListener(value);
    addParentListener(value);
  }
}

function shrinkTreeAndInitValues(preValues: PreValues<any>, tree: TreeNode, rootValue: Value) {
  const stack = Object.values(tree.children ?? {});
  const parents: Value[] = [rootValue];
  const visited = new Set<TreeNode>();
  const values = {} as Record<string, Value>;
  while (stack.length) {
    const node = stack.at(-1) as TreeNode;
    if (visited.has(node)) {
      // remove processed parents
      // stack.at(-1) and parents.at(-1) cannot be undefined
      if ((stack.pop() as TreeNode).key === (parents.at(-1) as Value).key) {
        parents.pop();
      }
      continue;
    }
    visited.add(node);

    if (!initValue(node, parents, preValues, values)) {
      stack.pop();
    }

    if (!node.children) {
      continue;
    }
    for (const key of Object.keys(node.children)) {
      stack.push(node.children[key]);
    }
  }
  addListeners(values);
  return values;
}
