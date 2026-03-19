import { describe, it, expect } from 'vitest';
import { State, ListenersNode, ListenersTree } from '../src/state';
import { posts, dict as _dict, Post } from './data/posts';
import { getPath } from '../src/helpers/get-path';

const checkNode = (node: ListenersNode, nameId: bigint, path: string[]) => {
  const children = node.children.get(nameId);
  expect(children?.has(path[node.depth + 1])).toBe(true);
  const nextId = children?.get(path[node.depth + 1]) as bigint;
  expect(typeof nextId).toBe('bigint');
  expect(node.parents.get(nextId)).toBe(nameId);
  return nextId;
};
const forState = (state: State, cb: (node: ListenersNode) => void) => {
  const tree = state.listenersTree;

  let next: ListenersNode | null = tree;

  while (next) {
    cb(next);
    next = next.next;
  }
};

describe('state test', () => {
  it('subscribe', () => {
    const dict = structuredClone(_dict);
    const state = new State(dict);
    const pathMeta = getPath<typeof dict>()(posts[0].id)('meta')();
    const listener = () => {};
    const unsub = state.subsribe(pathMeta, listener);
    let nameId = state.listenersTree.parentId;

    forState(state, (node) => {
      if (node.depth < 1) {
        nameId = checkNode(node, nameId, pathMeta);
      } else {
        expect(node.listeners.size).toBe(1);
        const listeners = node.listeners.get(nameId);
        expect(listeners instanceof Set).toBe(true);
        expect(listeners?.has(listener)).toBe(true);
      }
    });

    unsub();

    forState(state, (node) => {
      expect(node.children.size).toBe(0);
      expect(node.listeners.size).toBe(0);
      expect(node.parents.size).toBe(0);
    });
  });
});
