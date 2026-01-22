import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import { createSlice, createContext, createProvider } from '../src';

describe('Listeners', () => {
  it('test store.addListener', () => {
    type Slice = { count: number; name: string };
    const Context = createContext();
    const slice = createSlice<Slice>(Context);

    let countTest = 0;
    let nameTest = '';

    const store = slice.createStore({ count: 1, name: 'test name' });
    store.addListener('count', (_, value) => {
      // ! test it
      countTest = value;
    });
    store.addListener(
      'name',
      (_, value) => {
        // ! test it
        nameTest = value;
      },
      false, // ! test it
    );
    return store;

    let trigger!: () => void;

    const TestComponent = () => {
      const store = slice.useStore();

      trigger = () => {
        store.set('count', 2);
        store.set('name', 'Tester');
      };

      return null;
    };

    const Provider = createProvider(Context);
    const value = new Map();
    value.set(store.uniqId, store);
    render(
      <Provider value={value}>
        <TestComponent />
      </Provider>,
    );
    expect(countTest).toBe(1);
    // "" bacause third arg in addListener is false
    expect(nameTest).toBe('');

    act(() => {
      trigger();
    });

    expect(countTest).toBe(2);
    expect(nameTest).toBe('Tester');
  });
});
