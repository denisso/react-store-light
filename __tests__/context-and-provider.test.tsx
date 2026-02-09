import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import Light from '../src';

describe('Context and Provider', () => {
  it('initialization store and usage Context', () => {
    type Slice = { count: number };
    const Context = Light.createContext();
    const slice = Light.createSlice<Slice>();
    const store = slice.createStore({ count: 1 });
    const useStore = Light.createStoreHook<Slice>(Context, slice.sliceId);
    let trigger!: () => number;
    const TestComponent = () => {
      const store = useStore();

      trigger = () => {
        // ! test it
        return store.get('count');
      };
      return null;
    };
    const Provider = Light.createProvider(Context);
    render(
      <Provider value={[store]}>
        <TestComponent />
      </Provider>,
    );
    expect(trigger()).toBe(1);
  });

  it('Multiple stores one provider', () => {
    const Context = Light.createContext();
    type Slice1 = { count: number };
    type Slice2 = { name: string };
    const slice1 = Light.createSlice<Slice1>();
    const slice2 = Light.createSlice<Slice2>();

    const data1 = { count: 1 };
    const data2 = { name: 'test' };
    const store1 = slice1.createStore(data1);
    const store2 = slice2.createStore(data2);
    const useStore1 = Light.createStoreHook<Slice1>(Context, slice1.sliceId);
    const useStore2 = Light.createStoreHook<Slice2>(Context, slice2.sliceId);
    let trigger!: () => void;
    let countTest1 = 0;
    let countTest2 = '';
    const TestComponent = () => {
      const store1 = useStore1();
      const store2 = useStore2();
      trigger = () => {
        // ! test it
        countTest1 = store1.get('count');
        countTest2 = store2.get('name');
      };
      return null;
    };
    const Provider = Light.createProvider(Context);
    render(
      <Provider value={[store1, store2]}>
        <TestComponent />
      </Provider>,
    );

    act(() => {
      trigger();
    });
    expect(countTest1).toBe(data1.count);
    expect(countTest2).toBe(data2.name);
  });

  it('one store multiple providers', () => {
    type Counter = { count: number };
    const Context = Light.createContext();
    const slice = Light.createSlice<Counter>();

    const store = slice.createStore({ count: 1 });
    const useStore = Light.createStoreHook<Counter>(Context, slice.sliceId);
    let countTest = 0;

    const TestComponent1 = () => {
      const store = useStore()
      const [count] = Light.useState(store, 'count');
      React.useEffect(() => {
        countTest = count;
      }, [count]);
      return null;
    };
    let trigger!: () => void;

    const TestComponent2 = () => {
      const store = useStore();
      trigger = () => {
        // ! test it
        store.set('count', 2);
      };
      return null;
    };

    const Provider = Light.createProvider(Context);
    render(
      <>
        <Provider value={[store]}>
          <TestComponent1 />
        </Provider>
        <Provider value={[store]}>
          <TestComponent2 />
        </Provider>
      </>,
    );

    act(() => {
      trigger();
    });

    expect(countTest).toBe(2);
  });
});
