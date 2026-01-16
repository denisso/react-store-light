import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import { createSlice, createContext, createProvider } from '../src';

describe('Context and Provider', () => {
  it('initialization store and usage Context', () => {
    type Slice = { count: number };
    const Context = createContext();
    const slice = createSlice<Slice>(Context);
    const store = slice.createStore({ count: 1 });
    let trigger!: () => number;
    const TestComponent = () => {
      const store = slice.useStore();
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

  it('multiple stores one provider', () => {
    const Context = createContext();
    type Slice = { count: number };
    const slice1 = createSlice<Slice>(Context);
    const slice2 = createSlice<Slice>(Context);

    const data1 = { count: 1 };
    const data2 = { count: 2 };
    const store1 = slice1.createStore(data1);
    const store2 = slice2.createStore(data2);
    let trigger!: () => void;
    let countTest1 = 0;
    let countTest2 = 0;
    const TestComponent = () => {
      const store1 = slice1.useStore();
      const store2 = slice2.useStore();
      trigger = () => {
        // ! test it
        countTest1 = store1.get('count');
        countTest2 = store2.get('count');
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
    expect(countTest2).toBe(data2.count);
  });

  it('one store multiple providers', () => {
    type Slice = { count: number };
    const Context = createContext();
    const slice = createSlice<Slice>(Context);

    const store = slice.createStore({ count: 1 });
    let countTest = 0;

    const TestComponent1 = () => {
      const [count] = slice.useState('count');
      React.useEffect(() => {
        countTest = count;
      }, [count]);
      return null;
    };
    let trigger!: () => void;

    const TestComponent2 = () => {
      const store = slice.useStore();
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

  it('one slice with one store and multiple contexts', () => {
    type Slice = { count: number };
    const slice = createSlice<Slice>(null);
    const store = slice.createStore({ count: 1 });

    const Context1 = createContext();
    const Context2 = createContext();
    
    let countTest = 0;
    const TestComponent1 = () => {
      const [count] = slice.useState('count', Context1);
      React.useEffect(() => {
        countTest = count;
      }, [count]);
      return null;
    };
    let trigger!: () => void;

    const TestComponent2 = () => {
      const store = slice.useStore(Context2);
      trigger = () => {
        // ! test it
        store.set('count', 2);
      };
      return null;
    };
    const Provider1 = createProvider(Context1)
    const Provider2 = createProvider(Context2)
    render(
      <>
        <Provider1 value={[store]}>
          <TestComponent1 />
        </Provider1>
        <Provider2 value={[store]}>
          <TestComponent2 />
        </Provider2>
      </>,
    );

    act(() => {
      trigger();
    });

    expect(countTest).toBe(2);
  });
});
