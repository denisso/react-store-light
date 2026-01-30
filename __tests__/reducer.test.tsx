import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import {
  createSlice,
  createContext,
  Store,
  createProvider,
  createHooks,
} from '../src';

describe('Reducer', () => {
  it('one reducer', () => {
    type Counter = { count: number };
    const count = (count: number) => (store: Store<Counter>) => {
      store.set('count', store.get('count') + count);
    };
    const reducers = { count };
    const Context = createContext();
    const slice = createSlice<Counter>();
    const hooks = createHooks<Counter, typeof reducers>(slice.sliceId, Context, reducers);

    let countFntest: (arg: number) => void;

    const Counter = () => {
      const reducers = hooks.useReducer();
      countFntest = reducers.count;
      return null;
    };

    const Provider = createProvider(Context);
    const store = slice.createStore({ count: 0 });
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
