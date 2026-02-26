import { describe, it, expect } from 'vitest';
import Light from '../../src';
import { Post, post } from '../data/post';

describe('Store init', () => {
  type TN = Light.Store<any>['__rootValue'];
  type TestNode = {
    children: Record<string, TestNode>;
    key: string | null;
    value: any;
  };

  const dfs = (node: TN, testNode: TestNode = {} as TestNode): TestNode => {
    testNode.key = node.key;
    testNode.value = node.value;

    if (node?.children) {
      testNode.children = {};
      for (const child of node?.children.values()) {
        const testChild = {} as TestNode;
        testNode.children[child.key as string] = dfs(child, testChild);
      }
    }
    return testNode;
  };
  it('Usage class Store', () => {
    type Counter = { count: number };
    const store = new Light.Store<Counter>({ count: 0 });
    let name = '';
    let value = 0;

    store.addListener('count', (_name: string, _value: number) => {
      name = _name;
      value = _value;
    });
    store.set('count', store.get('count') + 1);
    expect(name).toEqual('count');

    expect(value).toEqual(1);
  });

  it('Multi-level structured object', () => {
    type State = {
      text: string;
      quality: (typeof post)['meta']['image']['quality'];
      lowH: number;
      highH: number;
    };

    {
      const q = Light.createStateValue(post)('meta')('image')('quality');
      const values = {
        text: Light.createStateValue(post)('text')(),
        quality: q(),
        lowH: q('low')('h')(),
        highH: q('high')('h')(),
      };

      const testData = {
        key: null,
        value: post,
        children: {
          quality: {
            key: 'quality',
            value: post['meta']['image']['quality'],
            children: {
              highH: {
                key: 'highH',
                value: post['meta']['image']['quality']['high']['h'],
              },
              lowH: {
                key: 'lowH',
                value: post['meta']['image']['quality']['low']['h'],
              },
            },
          },
          text: {
            key: 'text',
            value: post['text'],
          },
        },
      };
      const store = Light.createStore<Post, State>(post, values);
      const result = dfs(store.__rootValue);
      expect(result).toEqual(testData);
    }
    return;
  });

  it('Single level', () => {
    const state = {
      a: 'a',
      b: 'b',
      c: 'c',
      d: 'd',
      e: 'e',
    };

    const store = Light.createStore(state);
    const result = dfs(store.__rootValue);
    const testData = {
      key: null,
      value: state,
      children: {
        e: {
          key: 'e',
          value: 'e',
        },
        d: {
          key: 'd',
          value: 'd',
        },
        c: {
          key: 'c',
          value: 'c',
        },
        b: {
          key: 'b',
          value: 'b',
        },
        a: {
          key: 'a',
          value: 'a',
        },
      },
    };
    expect(result).toEqual(testData);
  });
  
});
