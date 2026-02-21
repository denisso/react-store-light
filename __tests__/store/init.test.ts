import { describe, it, expect } from 'vitest';
import Light, { Store, getStateValue } from '../../src';

describe('Store init', () => {
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
      text: string;
      lowH: number;
      highH: number;
    };
    type TN = Light.Store<any>['__headTreeNode'];
    type TestNode = { children: Record<string, TestNode>; values: Record<string, number | string> };
    const dfs = (node: TN, testNode: TestNode = {} as TestNode): TestNode => {
      if (node?.values) {
        const values = node?.values;
        testNode.values = Object.keys(node.values).reduce<Record<string, number | string>>(
          (a, key) => {
            a[key] = values[key].value;
            return a;
          },
          {},
        );
      }

      if (node?.children) {
        testNode.children = {};
        for (const child of node?.children.values()) {
          const testChild = {} as TestNode;
          testNode.children[child.name] = dfs(child, testChild);
        }
      }
      return testNode;
    };
    {
      const q = getStateValue(post)('meta')('image')('quality');
      const values = {
        text: getStateValue(post)('text')(),
        lowH: q('low')('h')(),
        highH: q('high')('h')(),
      };
      // shrink meta and image
      const testData = {
        children: {
          quality: {
            children: { low: { values: { lowH: 200 } }, high: { values: { highH: 1600 } } },
          },
        },
        values: { text: 'Text' },
      };
      const store = new Store<Post, State>(post, values);
      const result = dfs(store.__headTreeNode);
      expect(result).toEqual(testData);
    }
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
