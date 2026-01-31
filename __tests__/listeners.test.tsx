import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import { createSlice, createContext, createProvider, createHooks } from '../src';

describe('Listeners', () => {
  it('addListener', () => {
    type Slice = { count: number; name: string };
    const Context = createContext();
    const slice = createSlice<Slice>();

    let testSlice: Slice = { count: 0, name: '' };

    const store = slice.createStore({ count: 0, name: 'test name' });
    const hooks = createHooks<Slice>(slice.sliceId, Context);
    store.addListener('count', (_, value) => {
      // ! test it
      testSlice.count = value;
    });
    store.addListener('name', (_, value) => {
      // ! test it
      testSlice.name = value;
    });

    let trigger!: (slice: Slice) => void;

    const TestComponent = () => {
      const store = hooks.useStore();

      trigger = (_slice: Slice) => {
        store.set('count', _slice.count);
        store.set('name', _slice.name);
      };

      return null;
    };

    const Provider = createProvider(Context);
    render(
      <Provider value={[store]}>
        <TestComponent />
      </Provider>,
    );
    expect(testSlice).toEqual({ count: 0, name: '' });

    const testValue: Slice = { name: 'Test', count: 1 };
    act(() => {
      trigger(testValue);
    });

    expect(testSlice).toEqual(testValue);
  });

  it('removeListener', () => {
    type Slice = { count: number };
    const Context = createContext();
    const slice = createSlice<Slice>();
    let countTest = 0;
    const store = slice.createStore({ count: 0 });
    const hooks = createHooks<Slice>(slice.sliceId, Context)
    const listener = (_: string, value: number) => {
      // ! test it
      countTest = value;
    };
    store.addListener('count', listener, false);

    let trigger!: (arg: number) => void;

    const TestComponent = () => {
      const store = hooks.useStore();

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
