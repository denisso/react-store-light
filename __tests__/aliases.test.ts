import { describe, it, expect } from 'vitest';
import { dictPosts, type Post } from './__stubs__/posts';
import Light from '../src';

describe('Aliases', () => {
  it('Create aliases', () => {
    const keys = Object.keys(dictPosts);
    const store = new Light.Store(dictPosts);

    const getAliases = (id: string) => {
      const p = Light.createAlias(store)(id);

      const aliases = {
        meta: p('meta'),
        header: p('meta')('header'),
        tags: p('meta')('tags'),
        author: p('meta')('author'),
        images: p('images'),
        text: p('text'),
      };
      return aliases;
    };

    const post = new Light.Aliases(getAliases(keys[0]));

    expect(post.get('author')).toEqual(dictPosts[keys[0]].meta.author);

    const author: Post['meta']['author'] = { name: 'John Doe' };
    post.set('author', author);

    expect(post.get('author')).toEqual(author);
  });
});
