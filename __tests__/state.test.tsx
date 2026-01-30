import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import { createSlice, createContext, createProvider, createHooks } from '../src';

describe('useState', () => {
  it('test rerender by change state', () => {
    type Counter = { count: number };
    const Context = createContext();
    const slice = createSlice<Counter>();
    const store = slice.createStore({ count: 0 });
    const hooks = createHooks<Counter>(slice.sliceId, Context);
    let trigger!: () => void;
    let countTest = 0;
    const TestComponent = () => {
      const [count, setCount] = hooks.useState('count');

      React.useEffect(() => {
        // ! test it
        countTest = count;
      }, [count]);

      trigger = () => {
        setCount(2);
      };

      return null;
    };
    const Provider = createProvider(Context);
    
    render(
      <Provider value={[store]}>
        <TestComponent />
      </Provider>,
    );
    expect(countTest).toBe(0);

    act(() => {
      trigger();
    });

    expect(countTest).toBe(2);
  });
});
