import { describe, it, expect } from 'vitest';
import { State } from '../../src/state';
import { posts, dictPosts as _dict, type Post } from '../__stubs__/posts';
import { createPath } from '../../src/helpers/get-path';
import { compileAccessor } from '../../src/state/compile-accessor';

describe('State Values', () => {
  it('Usage State.set and trigger listeners', () => {
    const dictPosts = structuredClone(_dict);
    const state = new State(dictPosts);
    const pathMeta = createPath<typeof dictPosts>()(posts[0].id)('meta');
    const newMeta = {
      tags: ['art', 'exhibition', 'culture'],
      header: 'Contemporary Art: New Horizons',
      author: {
        name: 'Ivan Sidorov',
      },
    };
    const listenerMeta = (meta: Post['meta']) => {
      expect(meta).toEqual(newMeta);
    };
    state.subsribe(pathMeta(), listenerMeta);
    state.set(pathMeta(), newMeta);
    expect(state.get(pathMeta())).toEqual(newMeta);
  });

  it('Usage State.setValues and trigger listeners', () => {
    const dictPosts = structuredClone(_dict);
    const state = new State({});
    const pathMeta = createPath<typeof dictPosts>()(posts[0].id)('meta');

    const listenerMeta = (meta: Post['meta']) => {
      expect(meta).toEqual(dictPosts[posts[0].id]['meta']);
    };
    state.subsribe(pathMeta(), listenerMeta);
    state.setValues(dictPosts);
    expect(state.getValues()).toEqual(dictPosts);
  });

  it('Usage accessor in State.set', () => {
    const dictPosts = structuredClone(_dict);
    const state = new State(dictPosts);
    const pathMeta = createPath<typeof dictPosts>()(posts[0].id)('meta');
    const newMeta = {
      tags: ['art', 'exhibition', 'culture'],
      header: 'Contemporary Art: New Horizons',
      author: {
        name: 'Ivan Sidorov',
      },
    };
    const accessorMeta = compileAccessor(pathMeta());
    const listenerMeta = (meta: Post['meta']) => {
      expect(meta).toEqual(newMeta);
    };
    expect(accessorMeta(state)).toEqual(dictPosts[posts[0].id]['meta']);
    state.subsribe(pathMeta(), listenerMeta);
    state.set(pathMeta(), newMeta, accessorMeta);
    expect(state.get(pathMeta())).toEqual(newMeta);
  });
});
