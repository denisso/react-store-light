import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import { dict, type Post } from '../__stubs__/posts';
import Light from '../../src';

describe('useState', () => {
  it('useState with Store', () => {
    type Counter = { count: number };
    const store = Light.createStore<Counter>({ count: 0 });
    let trigger!: () => void;
    let countTest = 0;
    const TestComponent = () => {
      const count = Light.useState(store, 'count');

      React.useEffect(() => {
        // ! test it
        countTest = count;
      }, [count]);

      trigger = () => {
        // ! test it
        store.set('count', count + 2);
      };

      return null;
    };

    render(<TestComponent />);
    expect(countTest).toBe(0);

    act(() => {
      trigger();
    });

    expect(countTest).toBe(2);
  });

  it('useState wit Aliases', () => {
    type PostsDict = Record<string, Post>
    const _dict = structuredClone(dict) 
    const store = Light.createStore<PostsDict>(_dict);
    const p = Light.getPath<PostsDict>()('')('meta')
    // const aliase = light.Aliases(store, p)
    // let trigger!: () => void;
    // let countTest = 0;
    // const TestComponent = () => {
    //   const count = Light.useState(store, 'count');

    //   React.useEffect(() => {
    //     // ! test it
    //     countTest = count;
    //   }, [count]);

    //   trigger = () => {
    //     // ! test it
    //     store.set('count', count + 2);
    //   };

    //   return null;
    // };

    // render(<TestComponent />);
    // expect(countTest).toBe(0);

    // act(() => {
    //   trigger();
    // });

    // expect(countTest).toBe(2);
  });

  it('useState with Context value Id param', () => {
    type Counter = { count: number };
    const store = Light.createStore<Counter>({ count: 0 });
    let trigger!: () => void;
    let countTest = 0;
    const storeId = Light.createContextId<Light.Store<Counter>>();
    const TestComponent = () => {
      const store = Light.useContextId(storeId);
      const count = Light.useState(store, 'count');

      React.useEffect(() => {
        // ! test it
        countTest = count;
      }, [count]);

      trigger = () => {
        // ! test it
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
