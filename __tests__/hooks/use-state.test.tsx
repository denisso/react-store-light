import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import Light from '../../src';

describe('useState', () => {
  it('test hook use State', () => {
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
});
