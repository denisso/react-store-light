import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import { createSlice, createContext, IStoreApi } from '../src';

describe('Reducers tests', () => {
  it('base case', () => {
    type Slice = { count: number };
    const count = (store: IStoreApi<Slice>, count: number) => {
      store.set('count', store.get('count') + count);
    };
    const reducers = { count };
    const slice = createSlice<Slice, typeof reducers>(reducers);
    const store = slice.createStore({ count: 0 });
    const { Provider, Context } = createContext();

    let countFntest: (arg: number) => void;

    const Counter = () => {
      const reducers = slice.useReducer(Context);
      countFntest = reducers.count;
      return null;
    };

    render(
      <Provider value={[store]}>
        <Counter />
      </Provider>,
    );

    act(() => {
      countFntest(2);
    });

    expect(store.get('count')).toBe(2)
  });
});
