import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import { createSlice, createContext, createProvider, createHooks } from '../src';

describe('Context and Provider', () => {
  it('initialization store and usage Context', () => {
    type Slice = { count: number };
    const Context = createContext();
    const slice = createSlice<Slice>();
    const store = slice.createStore({ count: 1 });
    const hooks = createHooks<Slice>(slice.sliceId, Context)
    let trigger!: () => number;
    const TestComponent = () => {
      const store = hooks.useStore();
      trigger = () => {
        // ! test it
        return store.get('count');
      };
      return null;
    };
    const Provider = createProvider(Context);
    render(
      <Provider value={[store]}>
        <TestComponent />
      </Provider>,
    );
    expect(trigger()).toBe(1);
  });

  it('Multiple stores one provider', () => {
    const Context = createContext();
    type Slice1 = { count: number };
    type Slice2 = { name: string };
    const slice1 = createSlice<Slice1>();
    const slice2 = createSlice<Slice2>();

    const data1 = { count: 1 };
    const data2 = { name: "test" };
    const store1 = slice1.createStore(data1);
    const store2 = slice2.createStore(data2);
    const hooks1 = createHooks<Slice1>(slice1.sliceId, Context)
    const hooks2 = createHooks<Slice2>(slice2.sliceId, Context)
    let trigger!: () => void;
    let countTest1 = 0;
    let countTest2 = "";
    const TestComponent = () => {
      const store1 = hooks1.useStore();
      const store2 = hooks2.useStore();
      trigger = () => {
        // ! test it
        countTest1 = store1.get('count');
        countTest2 = store2.get('name');
      };
      return null;
    };
    const Provider = createProvider(Context);
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
    type Slice = { count: number };
    const Context = createContext();
    const slice = createSlice<Slice>();

    const store = slice.createStore({ count: 1 });
    const hooks = createHooks<Slice>(slice.sliceId, Context)
    let countTest = 0;

    const TestComponent1 = () => {
      const [count] = hooks.useState('count');
      React.useEffect(() => {
        countTest = count;
      }, [count]);
      return null;
    };
    let trigger!: () => void;

    const TestComponent2 = () => {
      const store = hooks.useStore();
      trigger = () => {
        // ! test it
        store.set('count', 2);
      };
      return null;
    };

    const Provider = createProvider(Context);
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
