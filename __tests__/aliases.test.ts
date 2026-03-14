import { describe, it, expect } from 'vitest';
import { dict } from './data/posts';
import Light, { getPath } from '../src';

describe('Aliases', () => {
  it('Create aliases', () => {
    const keys = Object.keys(dict);
    const store = new Light.Store(dict);
    const p = getPath(store)(keys[0]);

    const postAliases = {
      meta: p('meta'),
      header: p('meta')('header'),
      tags: p('meta')('tags'),
      author: p('meta')('author'),
      images: p('images'),
      text: p('text'),
    };

    const post = new Light.Aliases(postAliases, store.getState());
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
