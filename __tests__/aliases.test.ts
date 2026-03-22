import { describe, it, expect } from 'vitest';
import { dict } from './__stubs__/posts';
import Light, { getPath } from '../src';

describe('Aliases', () => {
  it('Create aliases', () => {
    const keys = Object.keys(dict);
    const store = new Light.Store(dict);

    const getAliases = (id: string) => {
      const p = getPath(store)(id);

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

    const post = new Light.Aliases(getAliases(keys[0]), store.getState());
    const author = post.get('author');
    expect(author).toEqual(dict[keys[0]].meta.author);
    const im = post.getAliases('images')(0);
    const imageAliases = {
      h: im('h'),
      alt: im('alt'),
      w: im('w'),
    };

    const image = new Light.Aliases(imageAliases, store.getState());
    const alt = image.get('alt');
    expect(alt).toEqual(dict[keys[0]].images[0].alt);
  });
});
