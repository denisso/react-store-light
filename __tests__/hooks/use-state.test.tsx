import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import Light from '../../src';

describe('useState', () => {
  it('useState with Store param', () => {
    type Counter = { count: number };
    const store = Light.createStore<Counter>({ count: 0 });
    let trigger!: () => void;
    let countTest = 0;
    const TestComponent = () => {
      const [count, setCount] = Light.useState(store, 'count');

      React.useEffect(() => {
        // ! test it
        countTest = count;
      }, [count]);

      trigger = () => {
        setCount(2);
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

  it('useState with Context value Id param', () => {
    type Counter = { count: number };
    const store = Light.createStore<Counter>({ count: 0 });
    let trigger!: () => void;
    let countTest = 0;
    const storeId = Light.createContextValueId<Light.Store<Counter>>();
    const TestComponent = () => {
      const [count, setCount] = Light.useState(storeId, 'count');

      React.useEffect(() => {
        // ! test it
        countTest = count;
      }, [count]);

      trigger = () => {
        setCount(2);
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
