import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import Light from '../../src';

describe('hook useReducer', () => {
  it('one reducer', () => {
    type Counter = { count: number };
    const count = (count: number) => (store: Light.Store<Counter>) => {
      store.set('count', store.get('count') + count);
    };
    const rs = { count };
    const store = Light.createStore<Counter>({ count: 0 });

    let countFntest: (arg: number) => void;

    const Counter = () => {
      const reducers = Light.useReducer(store, rs);
      countFntest = reducers.count;
      return null;
    };

    render(<Counter />);

    act(() => {
      countFntest(2);
    });

    expect(store.get('count')).toBe(2);
  });
});
