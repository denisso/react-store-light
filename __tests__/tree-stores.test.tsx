import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import { createSlice, createContext, createProvider, type IStore, type IContext } from '../src';

describe('Tree stores', () => {
  it('update top bottom', () => {
    type Counter = { id: number; count: number };
    type Slice = { counters: Counter[] };
    const GlobalContext = createContext();
    const globalSlice = createSlice<Slice>(GlobalContext);
    const globalStore = globalSlice.createStore({ counters: [{ id: 0, count: 0 }] });

    const CounterContext = createContext();
    const counterSlice = createSlice<Counter>(CounterContext);
    const CounterProvider = createProvider(CounterContext);
    const results: Counter['count'][] = [];
    const CounterState = () => {
      const [count] = counterSlice.useState('count');
      React.useEffect(() => {
        results.push(count);
      }, [count]);
      return null;
    };
    const CounterRoot = ({ counter }: { counter: Counter }) => {
      const [counterStore] = React.useState<IStore<Counter>>(() => {
        return counterSlice.createStore(counter);
      });
      const [value] = React.useState<IContext>(() => {
        const map = new Map();
        map.set(counterStore.uniqId, counterStore);
        return map;
      });
      React.useEffect(() => {
        // test it
        counterStore.setState(counter);
      }, [counter, counterStore]);

      return <CounterProvider value={value}>{<CounterState />}</CounterProvider>;
    };

    const RootComponent = () => {
      const [counters] = globalSlice.useState('counters');
      return (
        <>
          {counters.map((counter) => (
            <CounterRoot key={counter.id} counter={counter} />
          ))}
        </>
      );
    };
    const Provider = createProvider(GlobalContext);
    const value = new Map();
    value.set(globalStore.uniqId, globalStore);
    render(
      <Provider value={value}>
        <RootComponent />
      </Provider>,
    );

    act(() => {
      // test it
      globalStore.set('counters', [{ id: 0, count: 2 }]);
    });
    expect(results).toEqual([0, 2]);
  });
  it('update bottom top', () => {
    type Counter = { id: number; count: number };
    type Slice = { counters: Counter[] };
    const GlobalContext = createContext();
    const globalSlice = createSlice<Slice>(GlobalContext);
    const counters = [{ id: 0, count: 0 }];
    const globalStore = globalSlice.createStore({ counters });

    const CounterContext = createContext();
    const counterSlice = createSlice<Counter>(CounterContext);
    const CounterProvider = createProvider(CounterContext);

    let trigger: () => void;
    const CounterState = () => {
      const store = counterSlice.useStore();
      // test it
      trigger = () => store.set('count', 2);
      return null;
    };
    const CounterRoot = ({ counter }: { counter: Counter }) => {
      const [counterStore] = React.useState<IStore<Counter>>(() => {
        return counterSlice.createStore(counter, true);
      });
      const [value] = React.useState<IContext>(() => {
        const map = new Map();
        map.set(counterStore.uniqId, counterStore);
        return map;
      });
      React.useEffect(() => {
        counterStore.setState(counter);
      }, [counter, counterStore]);

      return <CounterProvider value={value}>{<CounterState />}</CounterProvider>;
    };

    const RootComponent = () => {
      const [counters] = globalSlice.useState('counters');
      return (
        <>
          {counters.map((counter) => (
            <CounterRoot key={counter.id} counter={counter} />
          ))}
        </>
      );
    };
    const Provider = createProvider(GlobalContext);
    const value = new Map();
    value.set(globalStore.uniqId, globalStore);
    render(
      <Provider value={value}>
        <RootComponent />
      </Provider>,
    );

    act(() => {
      trigger();
    });
    expect(counters).toEqual([{ id: 0, count: 2 }]);
  });
});
