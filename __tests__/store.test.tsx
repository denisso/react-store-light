import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import { createSlice, createContext } from '../src';

describe('React Store tests', () => {
  it('test initialization store and usage Context', () => {
    type Slice = { count: number };
    const { createStore, useStore } = createSlice<Slice>();
    const { Provider, Context } = createContext();
    const store = createStore({ count: 1 });
    let trigger!: () => number;
    const TestComponent = () => {
      const store = useStore(Context);
      trigger = () => {
        // ! test it
        return store.get('count');
      };
      return null;
    };
    render(
      <Provider value={[store]}>
        <TestComponent />
      </Provider>,
    );
    expect(trigger()).toBe(1);
  });

  it('test multiple stores one provider', () => {
    type Slice = { count: number };
    const { createStore: createStore1, useStore: useStore1 } = createSlice<Slice>();
    const { createStore: createStore2, useStore: useStore2 } = createSlice<Slice>();
    const { Provider, Context } = createContext();
    const data1 = { count: 1 };
    const data2 = { count: 2 };
    const store1 = createStore1(data1);
    const store2 = createStore2(data2);
    let trigger!: () => void;
    let countTest1 = 0;
    let countTest2 = 0;
    const TestComponent = () => {
      const store1 = useStore1(Context);
      const store2 = useStore2(Context);
      trigger = () => {
        // ! test it
        countTest1 = store1.get('count');
        countTest2 = store2.get('count');
      };
      return null;
    };
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

  it('test one store multiple providers', () => {
    type Slice = { count: number };
    const { createStore, useStore, useSelector } = createSlice<Slice>();
    const { Provider, Context } = createContext();
    const store = createStore({ count: 1 });
    let countTest = 0;

    const TestComponent1 = () => {
      const [count] = useSelector(Context, 'count');
      React.useEffect(() => {
        countTest = count;
      }, [count]);
      return null;
    };
    let trigger!: () => void;

    const TestComponent2 = () => {
      const store = useStore(Context);
      trigger = () => {
        // ! test it
        store.set('count', 2);
      };
      return null;
    };
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

  it('test one store multiple different Providers', () => {
    type Slice = { count: number };
    const { createStore, useStore, useSelector } = createSlice<Slice>();
    const { Provider: Provider1, Context: Context1 } = createContext();
    const { Provider: Provider2, Context: Context2 } = createContext();
    const store = createStore({ count: 1 });
    let countTest = 0;
    const TestComponent1 = () => {
      const [count] = useSelector(Context1, 'count');
      React.useEffect(() => {
        countTest = count;
      }, [count]);
      return null;
    };
    let trigger!: () => void;

    const TestComponent2 = () => {
      const store = useStore(Context2);
      trigger = () => {
        // ! test it
        store.set('count', 2);
      };
      return null;
    };
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

  it('test rerender by change state', () => {
    type Slice = { count: number };

    const { createStore, useSelector } = createSlice<Slice>();

    const store = createStore({ count: 0 });

    const { Provider, Context } = createContext();
    let trigger!: () => void;
    let countTest = 0;
    const TestComponent = () => {
      const [count, setCount] = useSelector(Context, 'count');

      React.useEffect(() => {
        // ! test it
        countTest = count;
      }, [count]);

      trigger = () => {
        setCount(2);
      };

      return null;
    };
    render(
      <Provider value={[store]}>
        <TestComponent />
      </Provider>,
    );
    expect(countTest).toBe(0);

    act(() => {
      trigger();
    });

    expect(countTest).toBe(2);
  });

  it('test store.addListener', () => {
    type Slice = { count: number; name: string };

    const { createStore, useStore } = createSlice<Slice>();

    let countTest = 0;
    let nameTest = '';

    const initSlice = (count: number, name: string) => {
      const store = createStore({ count, name });
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
    };

    const { Provider, Context } = createContext();
    let trigger!: () => void;

    const TestComponent = () => {
      const store = useStore(Context);

      trigger = () => {
        store.set('count', 2);
        store.set('name', 'Tester');
      };

      return null;
    };
    render(
      <Provider value={[initSlice(1, 'test name')]}>
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
