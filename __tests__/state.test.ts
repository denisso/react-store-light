import { describe, it, expect } from 'vitest';
import { State, type StateNode } from '../src/state';
import { posts, type Post } from './data/posts';
import { getPath } from '../src/helpers/get-path-value';

const _dict = posts.reduce<Record<string, Post>>((a, post) => {
  a[post.id] = post;
  return a;
}, {});

const checkList = (node: StateNode, cb: (node: StateNode) => void) => {
  let next: StateNode | null = node;
  while (next) {
    cb(next);
    next = next.next;
  }
};

const isListEmpty = (node: StateNode) => {
  let count = 0;
  checkList(node, (node) => {
    count += node.parents.size;
    count += node.children.size;
    count += node.listeners.size;
  });
  return !count;
};

describe('state test', () => {
  it('Create tree', () => {
    const dict = structuredClone(_dict);
    const path = getPath(dict)(posts[0].id)('meta')('author')('name')();
    const state = new State(dict);
    const subscribe = state.subsribe(path);
    let levels = 0;
    checkList(state.tree, () => levels++);
    expect(levels).toBe(path.length);
    const unsub = subscribe(() => {});
    unsub();
    expect(levels).toBe(path.length);
    expect(isListEmpty(state.tree)).toBe(false);
  });

  it('Subscribe same path and unsubscribe', () => {
    const dict = structuredClone(_dict);
    let paths: string[][] = [
      getPath(dict)(posts[0].id)('meta')('author')('name')(),
      getPath(dict)(posts[0].id)('meta')('author')('name')(),
    ];
    const state = new State(dict);

    const usubs: Function[] = [];
    for (const path of paths) {
      const subscribe = state.subsribe(path);
      usubs.push(subscribe(() => {}));
    }

    for (const unsub of usubs) {
      expect(state.tree.children.size).toBe(1);
      unsub();
    }

    expect(isListEmpty(state.tree)).toBe(false);
  });

  it('subscribe same path', () => {
    const dict = structuredClone(_dict);

    let paths: string[][] = [
      getPath(dict)(posts[0].id)('meta')('author')('name')(),
      getPath(dict)(posts[1].id)('meta')('author')('name')(),
    ];
    const state = new State(dict);

    const usubs: Function[] = [];
    for (const path of paths) {
      const subscribe = state.subsribe(path);
      usubs.push(subscribe(() => {}));
    }
    let count = 2;
    for (const unsub of usubs) {
      expect(state.tree.children.size).toBe(count--);
      unsub();
    }
    expect(isListEmpty(state.tree)).toBe(false);
  });
});
