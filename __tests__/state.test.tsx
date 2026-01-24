import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import { createSlice, createContext, createProvider } from '../src';

describe('useState', () => {
  it('test rerender by change state', () => {
    type Slice = { count: number };
    const Context = createContext();
    const slice = createSlice<Slice>(Context);

    const store = slice.createStore({ count: 0 });

    let trigger!: () => void;
    let countTest = 0;
    const TestComponent = () => {
      const [count, setCount] = slice.useState('count');

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
