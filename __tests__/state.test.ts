import { describe, it } from 'vitest';
import { State } from '../src/state';
import { posts, type Post } from './data/posts';
import { getPath } from './value.test';

describe('state test', () => {
  it('subscribe', () => {});
  const dict = posts.reduce<Record<string, Post>>((a, post) => {
    a[post.id] = post;
    return a;
  }, {});
  let path: string[] = [];
  for (let i = 0; i < 1 && posts.length; i++) {
    path = getPath(dict)(posts[i].id)('meta')('author')('name')();
  }

  const state = new State(dict);
  const subscribe = state.subsribe(path);
  const foo = () => {};
  if (subscribe) {
    const unsub = subscribe(foo);
    unsub();
  }
});
