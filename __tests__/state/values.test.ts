import { describe, it, expect } from 'vitest';
import { State } from '../../src/state';
import { posts, dict as _dict, type Post } from '../data/posts';
import { getPath } from '../../src/helpers/get-path';
import { compileAccessor } from '../../src/state/compile-accessor';

describe('State Values', () => {
  it('Usage State.set and trigger listeners', () => {
    const dict = structuredClone(_dict);
    const state = new State(dict);
    const pathMeta = getPath<typeof dict>()(posts[0].id)('meta');
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
    const dict = structuredClone(_dict);
    const state = new State({});
    const pathMeta = getPath<typeof dict>()(posts[0].id)('meta');

    const listenerMeta = (meta: Post['meta']) => {
      expect(meta).toEqual(dict[posts[0].id]['meta']);
    };
    state.subsribe(pathMeta(), listenerMeta);
    state.setValues(dict);
    expect(state.getValues()).toEqual(dict);
  });

  it('Usage accessor in State.set', () => {
    const dict = structuredClone(_dict);
    const state = new State(dict);
    const pathMeta = getPath<typeof dict>()(posts[0].id)('meta');
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
    expect(accessorMeta(state)).toEqual(dict[posts[0].id]['meta']);
    state.subsribe(pathMeta(), listenerMeta);
    state.set(pathMeta(), newMeta, accessorMeta);
    expect(state.get(pathMeta())).toEqual(newMeta);
  });
});
