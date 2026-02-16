import { describe, it } from 'vitest';

describe('test', () => {
  it('multi level structured state', () => {
    type Post = {
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

    const getStateValue = <T extends object, K extends keyof T>(object: T, key: K) => {
      return {
        object,
        key,
      } as {
        object: T;
        key: K;
        value: T[K];
      };
    };

    type PrepValues<S> = {
      [K in keyof S]: {
        object: any;
        key: any;
        value: S[K];
      };
    };

    class Store<T extends object, S extends object = T> {
      keys: (keyof S)[];

      object: T;
      constructor(object: T, values?: PrepValues<S>) {
        this.object = object;
        this.keys = (values ? Object.keys(values) : Object.keys(object)) as (keyof S)[];
        let _values = values;
        if (!_values) {
          _values = {} as PrepValues<S>;
          for (const key of this.keys) {
            _values[key] = getStateValue(
              object,
              key as unknown as keyof T,
            ) as unknown as ReturnType<typeof getStateValue<S, keyof S>>;
          }
        }

        _values;
      }
    }
    type State = {
      header: string;
      author: Post['meta']['author']['name'];
      image: Post['meta']['image'];
    };

    class CustomStore extends Store<Post, State> {
      constructor(post: Post) {
        const values = {
          header: getStateValue(post.meta, 'header'),
          author: getStateValue(post.meta.author, 'name'),
          image: getStateValue(post.meta, 'image'),
        };
        super(post, values);
      }
    }

    const store = new Store<Post, State>(post);
  });
});
