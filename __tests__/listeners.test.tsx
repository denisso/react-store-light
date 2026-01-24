import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import { createSlice, createContext, createProvider } from '../src';

describe('Listeners', () => {
  it('addListener', () => {
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
    render(
      <Provider value={[store]}>
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

  it('removeListener', () => {
    type Slice = { count: number };
    const Context = createContext();
    const slice = createSlice<Slice>(Context);
    let countTest = 0;
    const store = slice.createStore({ count: 0 });
    const listener = (_: string, value: number) => {
      // ! test it
      countTest = value;
    };
    store.addListener('count', listener, false);

    let trigger!: (arg: number) => void;

    const TestComponent = () => {
      const store = slice.useStore();

      trigger = (arg: number) => {
        store.set('count', arg);
      };

      return null;
    };

    const Provider = createProvider(Context);
    render(
      <Provider value={[store]}>
        <TestComponent />
      </Provider>,
    );

    act(() => {
      trigger(2);
    });

    expect(countTest).toBe(2);
    act(() => {
      store.removeListener('count', listener);
    });
    act(() => {
      trigger(4);
    });
    expect(countTest).toBe(2);
  });
});
