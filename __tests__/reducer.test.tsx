import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import { createSlice, createContext, IStore, createProvider } from '../src';

describe('Reducer', () => {
  it('one reducer', () => {
    type Slice = { count: number };
    const count = (count: number) => (store: IStore<Slice>) => {
      store.set('count', store.get('count') + count);
    };
    const reducers = { count };
    const Context = createContext();
    const slice = createSlice<Slice, typeof reducers>(Context, reducers);
    const store = slice.createStore({ count: 0 });

    let countFntest: (arg: number) => void;

    const Counter = () => {
      const reducers = slice.useReducer();
      countFntest = reducers.count;
      return null;
    };

    const Provider = createProvider(Context);
    render(
      <Provider value={[store]}>
        <Counter />
      </Provider>,
    );

    act(() => {
      countFntest(2);
    });

    expect(store.get('count')).toBe(2);
  });
});
