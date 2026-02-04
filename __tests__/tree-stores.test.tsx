import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import { createSlice, createContext, createProvider, createHooks, useCreateStore } from '../src';

describe('Tree stores', () => {
  it('Update top bottom', () => {
    type Counter = { id: number; count: number };
    type Counters = { counters: Counter[] };
    // global
    const GlobalContext = createContext();
    const globalSlice = createSlice<Counters>();
    const globalStore = globalSlice.createStore({ counters: [{ id: 0, count: 0 }] });
    const globalHooks = createHooks<Counters>(globalSlice.sliceId, GlobalContext);
    // counter
    const CounterContext = createContext();
    const counterSlice = createSlice<Counter>();
    const CounterProvider = createProvider(CounterContext);
    const counterHooks = createHooks<Counter>(counterSlice.sliceId, CounterContext);
    // for test
    const results: Counter['count'][] = [];

    // tree
    const CounterState = () => {
      const [count] = counterHooks.useState('count');
      React.useEffect(() => {
        results.push(count);
      }, [count]);
      return null;
    };
    const CounterChild = ({ counter }: { counter: Counter }) => {
      const counterStore = useCreateStore(counter, counterSlice);

      return <CounterProvider value={[counterStore]}>{<CounterState />}</CounterProvider>;
    };

    const RootComponent = () => {
      const [counters] = globalHooks.useState('counters');
      return (
        <>
          {counters.map((counter) => (
            <CounterChild key={counter.id} counter={counter} />
          ))}
        </>
      );
    };

    const Provider = createProvider(GlobalContext);
    render(
      <Provider value={[globalStore]}>
        <RootComponent />
      </Provider>,
    );

    act(() => {
      // test it
      globalStore.set('counters', [{ id: 0, count: 2 }]);
    });
    expect(results).toEqual([0, 2]);
  });

  it('Usage createStore, children slices update each other', () => {
    type Counter = { id: number; count: number };
    const counter: Counter = { id: 0, count: 0 };

    // counter
    const CounterContext = createContext();
    const counterSlice = createSlice<Counter>();
    const CounterProvider = createProvider(CounterContext);
    const counterHook = createHooks<Counter>(counterSlice.sliceId, CounterContext);

    // for test
    let writeCountSet: (count: number) => void;
    const results: number[] = [];

    // counter Reader
    const Reader = () => {
      const [count] = counterHook.useState('count');

      React.useEffect(() => {
        results.push(count);
      }, [count]);
      return null;
    };

    // counter Writer
    const Writer = () => {
      const store = counterHook.useStore();
      writeCountSet = (count) => {
        const state = store.getRef();
        state.count = count;
        counterSlice.updateState(state);
      };
      return null;
    };
    const CounterReader = () => {
      const counterStore = useCreateStore(counter, counterSlice);

      return <CounterProvider value={[counterStore]}>{<Reader />}</CounterProvider>;
    };
    const CounterWriter = () => {
      const counterStore = useCreateStore(counter, counterSlice);

      return <CounterProvider value={[counterStore]}>{<Writer />}</CounterProvider>;
    };

    render(
      <>
        <CounterReader />
        <CounterWriter />
      </>,
    );

    act(() => {
      writeCountSet(2);
    });

    expect(results).toEqual([0, 2]);67
  });

});
