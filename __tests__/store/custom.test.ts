import { describe, it, expect } from 'vitest';
import { Store, getStateValue } from '../../src/';

describe('test', () => {
  it('Multi-level structured object', () => {
    type Post = {
      text: string;
      meta: {
        header: string;
        author: {
          name: string;
        };
        image: {
          h: number;
          w: number;
          quality: {
            low: {
              h: number;
              w: number;
            };
            high: {
              h: number;
              w: number;
            };
          };
        };
      };
    };
    const post: Post = {
      text: 'Text',
      meta: {
        header: 'Example header',
        author: {
          name: 'Some name',
        },
        image: {
          h: 800,
          w: 1200,
          quality: {
            low: {
              h: 200,
              w: 300,
            },
            high: {
              h: 1600,
              w: 2400,
            },
          },
        },
      },
    };

    type State = {
      header: string;
      authorName: Post['meta']['author']['name'];
      image: Post['meta']['image'];
    };

    const meta = getStateValue(post)('meta');
    const values = {
      text: getStateValue(post)('text')(),
      header: meta('header')(),
      authorName: meta('author')('name')(),
      image: meta('image')(),
      imageHigh: meta('image')('quality')('high')(),
      imageLow: meta('image')('quality')('low')(),
    };
    const store = new Store<Post, State>(post, values);
  });

  it('single level', () => {
    const state = {
      a: 'a',
      b: 'b',
      c: 'c',
      d: 'd',
      e: 'e',
    };
    const store = new Store(state);
  });
});
