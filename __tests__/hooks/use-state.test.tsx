import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import { dictPosts, type Post } from '../__stubs__/posts';
import Light from '../../src';

describe('useState', () => {
  it('useState with Store', () => {
    type Counter = { count: number };
    const store = Light.createStore<Counter>({ count: 0 });
    let trigger!: () => void;
    const testData: number[] = [];
    const TestComponent = () => {
      const [count, setCount] = Light.useState(store, 'count');

      React.useEffect(() => {
        testData.push(count);
      }, [count]);

      trigger = () => {
        setCount(count + 2);
      };

      return null;
    };

    render(<TestComponent />);

    expect(testData).toEqual([0]);
    act(() => {
      trigger();
    });

    expect(testData).toEqual([0, 2]);
  });

  it('useState with Aliases', () => {
    type PostsDict = Record<string, Post>;
    const _dict: PostsDict = structuredClone(dictPosts);
    const keys = Object.keys(_dict);

    const createAlias = (id: string) => {
      const meta = Light.createAlias<PostsDict>(store)(id)('meta');
      return { meta };
    };
    const store = new Light.Store<PostsDict>(_dict);

    let trigger!: () => void;

    const metaAlias = new Light.Aliases(createAlias(keys[0]));

    const testData: Post['meta'][] = [];

    const TestComponent = () => {
      const [meta, setMeta] = Light.useState(metaAlias, 'meta');

      React.useEffect(() => {
        testData.push(meta);
      }, [meta]);

      trigger = () => {
        setMeta(_dict[keys[1]]['meta']);
      };

      return null;
    };

    render(<TestComponent />);

    expect(testData).toEqual([_dict[keys[0]]['meta']]);
    act(() => {
      trigger();
    });

    expect(testData).toEqual([_dict[keys[0]]['meta'], _dict[keys[1]]['meta']]);
  });

  it('useState with Context value Id param', () => {
    type Counter = { count: number };
    const store = Light.createStore<Counter>({ count: 0 });
    let trigger!: () => void;
    let countTest = 0;
    const storeId = Light.createContextId<Light.Store<Counter>>();
    const TestComponent = () => {
      const [count] = Light.useState(storeId, 'count');

      React.useEffect(() => {
        countTest = count;
      }, [count]);

      trigger = () => {
        store.set('count', 2);
      };

      return null;
    };

    render(
      <Light.Provider value={{ [storeId]: store }}>
        <TestComponent />
      </Light.Provider>,
    );
    expect(countTest).toBe(0);

    act(() => {
      trigger();
    });

    expect(countTest).toBe(2);
  });
});
