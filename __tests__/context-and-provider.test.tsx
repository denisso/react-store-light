import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import Light from '../src';

describe('Context and Provider', () => {
  it('initialization store and usage Context', () => {
    type Data = { count: number };

    const store = Light.createStore({ count: 1 });
    const storeId = Light.createContextValueId<Light.Store<Data>>();

    let trigger!: () => number;
    const TestComponent = () => {
      const store = Light.useStore(storeId);

      trigger = () => {
        // ! test it
        return store.get('count');
      };
      return null;
    };

    render(
      <Light.Provider value={{ [storeId]: store }}>
        <TestComponent />
      </Light.Provider>,
    );
    expect(trigger()).toBe(1);
  });

  it('Multiple stores one provider', () => {
    type Data1 = { count: number };
    type Data2 = { name: string };

    const data1 = { count: 1 };
    const data2 = { name: 'test' };
    const store1 = Light.createStore(data1);
    const store2 = Light.createStore(data2);
    const storeId1 = Light.createContextValueId<Light.Store<Data1>>();
    const storeId2 = Light.createContextValueId<Light.Store<Data2>>();

    let trigger!: () => void;
    let countTest1 = 0;
    let countTest2 = '';
    const TestComponent = () => {
      const store1 = Light.useStore(storeId1);
      const store2 = Light.useStore(storeId2);
      trigger = () => {
        // ! test it
        countTest1 = store1.get('count');
        countTest2 = store2.get('name');
      };
      return null;
    };

    render(
      <Light.Provider value={{ [storeId1]: store1, [storeId2]: store2 }}>
        <TestComponent />
      </Light.Provider>,
    );

    act(() => {
      trigger();
    });
    expect(countTest1).toBe(data1.count);
    expect(countTest2).toBe(data2.name);
  });

  it('one store multiple providers', () => {
    type Counter = { count: number };

    const store = Light.createStore({ count: 1 });
    const storeId = Light.createContextValueId<Light.Store<Counter>>();

    let countTest = 0;

    const TestComponent1 = () => {
      const [count] = Light.useState(storeId, 'count');
      React.useEffect(() => {
        countTest = count;
      }, [count]);
      return null;
    };
    let trigger!: () => void;

    const TestComponent2 = () => {
      const store = Light.useStore(storeId);
      trigger = () => {
        // ! test it
        store.set('count', 2);
      };
      return null;
    };

    render(
      <>
        <Light.Provider value={{ [storeId]: store }}>
          <TestComponent1 />
        </Light.Provider>
        <Light.Provider value={{ [storeId]: store }}>
          <TestComponent2 />
        </Light.Provider>
      </>,
    );

    act(() => {
      trigger();
    });

    expect(countTest).toBe(2);
  });
});
