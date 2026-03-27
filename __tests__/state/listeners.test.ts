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

const checkListener = (node: ListenersNode, parentId: bigint, listener: Function) => {
  expect(node.listeners.has(parentId)).toBe(true);
  expect(node.listenersCount.has(parentId)).toBe(true);
  const listeners = node.listeners.get(parentId);
  expect(listeners?.has(listener)).toBe(true);
};

const checkEmpty = (state: State) => {
  forState(state, (node) => {
    expect(node.children.size).toBe(0);
    expect(node.listeners.size).toBe(0);
    expect(node.parents.size).toBe(0);
    expect(node.listenersCount.size).toBe(0);
  });
};

const checkSubscribe = (state: State, path: string[], listener: Function) => {
  const ids = [state.listenersTree.parentId];
  forState(state, (node) => {
    if (node.depth < path.length - 1) {
      ids.push(checkChildAndGetId(node, ids[node.depth + 1], path));
    } else {
      checkListener(node, ids[node.depth + 1], listener);
      // break iterations
      return true;
    }
  });
  return ids;
};
type ExtractMapValueType<T extends Map<any, any>> = T extends Map<any, infer V> ? V : never;

const checkCountListeners = (state: State, path: string[], count: number) => {
  let parentId = state.listenersTree.parentId;
  let indxPath = 0;
  forState(state, (node) => {
    expect(parentId !== undefined).toBe(true);
    expect(node.listenersCount.get(parentId)).toBe(count);
    const children = node.children.get(parentId) as ExtractMapValueType<typeof node.children>;
    if (node.depth <= path.length) {
      // break
      return true;
    }
    expect(children instanceof Map).toBe(true);
    parentId = children.get(path[indxPath++]) as ExtractMapValueType<typeof children>;
  });
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
    const unsubMeta = state.subscribe(pathMeta(), listenerMeta);
    const unsubAuthor = state.subscribe(pathAuthor(), listenerAuthor);
    const unsubName = state.subscribe(pathName(), listenerName);
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
      const unsub = state.subscribe(pathMeta(), listenerMeta);
      unsubs.push(unsub);
      checkSubscribe(state, pathMeta(), listenerMeta);
    }
    checkCountListeners(state, pathMeta(), n);
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
    const unsub = state.subscribe(pathMeta(), listenerMeta);
    checkSubscribe(state, pathMeta(), listenerMeta);

    const anotherListenerMeta = () => {};
    const unsubs: Function[] = Array(n).fill(unsub);
    const unsubsAnother: Function[] = [];

    for (let i = 0; i < n; i++) {
      const unsubAnother = state.subscribe(pathMeta(), anotherListenerMeta);
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
