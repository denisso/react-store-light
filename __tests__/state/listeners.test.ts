import { describe, it, expect } from 'vitest';
import { State, ListenersNode } from '../../src/state';
import { posts, dictPosts as _dict } from '../__stubs__/posts';
import { createPath } from '../../src/helpers/get-path';

const forState = (state: State, cb: (node: ListenersNode) => boolean | void) => {
  const tree = state.listenersTree;
  let next: ListenersNode | null = tree;
  while (next) {
    if (cb(next)) {
      break;
    }
    next = next.next;
  }
};

const checkChildAndGetId = (node: ListenersNode, nameId: bigint, path: string[]) => {
  const children = node.children.get(nameId);
  expect(children?.has(path[node.depth + 1])).toBe(true);
  const nextId = children?.get(path[node.depth + 1]) as bigint;
  expect(typeof nextId).toBe('bigint');
  expect(node.parents.get(nextId)).toBe(nameId);
  return nextId;
};

const checkListener = (node: ListenersNode, nameId: bigint, listener: Function) => {
  expect(node.listeners.has(nameId)).toBe(true);
  const listeners = node.listeners.get(nameId);
  expect(listeners?.has(listener)).toBe(true);
};

const checkEmpty = (state: State) => {
  forState(state, (node) => {
    expect(node.children.size).toBe(0);
    expect(node.listeners.size).toBe(0);
    expect(node.parents.size).toBe(0);
  });
};

const checkSubscribe = (state: State, path: string[], listener: Function) => {
  const ids = [state.listenersTree.parentId];
  forState(state, (node) => {
    if (node.depth < path.length - 1) {
      ids.push(checkChildAndGetId(node, ids[node.depth + 1], path));
    } else {
      checkListener(node, ids[node.depth + 1], listener);
      return true;
    }
  });
  return ids;
};

describe('State Listeners', () => {
  it('Subscribe different listeners', () => {
    const dictPosts = structuredClone(_dict);
    const state = new State(dictPosts);
    const pathMeta = createPath<typeof dictPosts>()(posts[0].id)('meta');
    const pathAuthor = pathMeta('author');
    const pathName = pathAuthor('name');
    const listenerMeta = () => {};
    const listenerAuthor = () => {};
    const listenerName = () => {};
    const unsubMeta = state.subsribe(pathMeta(), listenerMeta);
    const unsubAuthor = state.subsribe(pathAuthor(), listenerAuthor);
    const unsubName = state.subsribe(pathName(), listenerName);
    checkSubscribe(state, pathMeta(), listenerMeta);
    checkSubscribe(state, pathAuthor(), listenerAuthor);
    checkSubscribe(state, pathName(), listenerName);
    unsubMeta();
    checkSubscribe(state, pathAuthor(), listenerAuthor);
    checkSubscribe(state, pathName(), listenerName);
    unsubAuthor();
    checkSubscribe(state, pathName(), listenerName);
    unsubName();
    checkEmpty(state);
  });

  it('Subscribe same listeners', () => {
    const dictPosts = structuredClone(_dict);
    const state = new State(dictPosts);
    const pathMeta = createPath<typeof dictPosts>()(posts[0].id)('meta');
    const listenerMeta = () => {};
    const unsubs: Function[] = [];
    const n = 3;
    for (let i = 0; i < n; i++) {
      const unsub = state.subsribe(pathMeta(), listenerMeta);
      unsubs.push(unsub);
      checkSubscribe(state, pathMeta(), listenerMeta);
    }
    for (let i = 0; i < n - 1; i++) {
      const unsub = unsubs.pop() as Function;
      unsub();
      checkSubscribe(state, pathMeta(), listenerMeta);
    }
    const unsub = unsubs.pop() as Function;
    unsub();
    checkEmpty(state);
  });

  it('Unsubscribe unsubscribed listener', () => {
    const dictPosts = structuredClone(_dict);
    const state = new State(dictPosts);
    const pathMeta = createPath<typeof dictPosts>()(posts[0].id)('meta');
    const listenerMeta = () => {};
    const n = 3;
    const unsub = state.subsribe(pathMeta(), listenerMeta);
    checkSubscribe(state, pathMeta(), listenerMeta);

    const anotherListenerMeta = () => {};
    const unsubs: Function[] = Array(n).fill(unsub);
    const unsubsAnother: Function[] = [];

    for (let i = 0; i < n; i++) {
      const unsubAnother = state.subsribe(pathMeta(), anotherListenerMeta);
      unsubsAnother.push(unsubAnother);
      checkSubscribe(state, pathMeta(), anotherListenerMeta);
    }
    for (let i = 0; i < n - 1; i++) {
      const unsub = unsubs.pop() as Function;
      const unsubAnother = unsubsAnother.pop() as Function;
      unsubAnother();
      checkSubscribe(state, pathMeta(), anotherListenerMeta);
      unsub();
    }
    unsub();
    const unsubAnother = unsubsAnother.pop() as Function;
    unsubAnother();
    checkEmpty(state);
  });
});
