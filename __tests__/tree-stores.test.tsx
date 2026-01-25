import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import { createSlice, createContext, createProvider, type IStore, type IContext } from '../src';

describe('Tree stores', () => {
  it('update top bottom', () => {
    type Counter = { id: number; count: number };
    type Counters = { counters: Counter[] };
    // global
    const GlobalContext = createContext();
    const globalSlice = createSlice<Counters>(GlobalContext);
    const globalStore = globalSlice.createStore({ counters: [{ id: 0, count: 0 }] });

    // counter
    const CounterContext = createContext();
    const counterSlice = createSlice<Counter>(CounterContext);
    const CounterProvider = createProvider(CounterContext);

    // for test
    const results: Counter['count'][] = [];

    // tree
    const CounterState = () => {
      const [count] = counterSlice.useState('count');
      React.useEffect(() => {
        results.push(count);
      }, [count]);
      return null;
    };
    const CounterRoot = ({ counter }: { counter: Counter }) => {
      const [counterStore] = React.useState<IStore<Counter>>(() => {
        return counterSlice.createSubStore(counter);
      });

      React.useEffect(() => {
        // test it
        counterStore.setState(counter);
      }, [counter, counterStore]);

      return <CounterProvider value={[counterStore]}>{<CounterState />}</CounterProvider>;
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

  it('update bottom top', () => {
    type Counter = { id: number; count: number };
    type Counters = { counters: Counter[] };

    // global
    const GlobalContext = createContext();
    const globalSlice = createSlice<Counters>(GlobalContext);
    const counters = [{ id: 0, count: 0 }];
    const globalStore = globalSlice.createStore({ counters });

    // counter
    const CounterContext = createContext();
    const counterSlice = createSlice<Counter>(CounterContext);
    const CounterProvider = createProvider(CounterContext);

    // for test
    let trigger: () => void;

    // tree
    const CounterState = () => {
      const store = counterSlice.useStore();
      // test it
      trigger = () => store.set('count', 2);
      return null;
    };
    const CounterRoot = ({ counter }: { counter: Counter }) => {
      const [counterStore] = React.useState<IStore<Counter>>(() => {
        return counterSlice.createSubStore(counter);
      });

      React.useEffect(() => {
        counterStore.setState(counter);
      }, [counter, counterStore]);

      return <CounterProvider value={[counterStore]}>{<CounterState />}</CounterProvider>;
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

    render(
      <Provider value={[globalStore]}>
        <RootComponent />
      </Provider>,
    );

    act(() => {
      trigger();
    });
    expect(counters).toEqual([{ id: 0, count: 2 }]);
  });
  it('usage createSubStore, children slices update each other', () => {
    type Counter = { id: number; count: number };
    type Counters = { counters: Counter[] };
    // global counters
    const GlobalContext = createContext();
    const globalSlice = createSlice<Counters>(GlobalContext);
    const counters = [{ id: 0, count: 0 }];
    const globalStore = globalSlice.createStore({ counters });

    // counter
    const CounterContext = createContext();
    const counterSlice = createSlice<Counter>(CounterContext);
    const CounterProvider = createProvider(CounterContext);
    const storeCounterReader = counterSlice.createSubStore(counters[0]);
    const storeCounterWriter = counterSlice.createSubStore(counters[0]);
    // for test
    let writeCountSet: (count: number) => void;
    let writeCountSetState: (count: number) => void;
    let writeCountSetCount: (count: number) => void;
    const results: number[] = [];

    // counter Reader
    const Reader = () => {
      const [count] = counterSlice.useState('count');

      React.useEffect(() => {
        results.push(count);
      }, [count]);
      return null;
    };

    // counter Writer
    const Writer = () => {
      const store = counterSlice.useStore();
      const [, setCount] = counterSlice.useState('count');
      writeCountSet = (count) => {
        store.set('count', count);
      };
      writeCountSetState = (count) => {
        const state = store.getState();
        state.count = count;
        store.setState(state);
      };
      writeCountSetCount = setCount;
      return null;
    };
    // global provider
    const Provider = createProvider(GlobalContext);
    render(
      <>
        <Provider value={[globalStore]}>
          <CounterProvider value={[storeCounterReader]}>
            <Reader />
          </CounterProvider>
        </Provider>
        ,
        <Provider value={[globalStore]}>
          <CounterProvider value={[storeCounterWriter]}>
            <Writer />
          </CounterProvider>
        </Provider>
        ,
      </>,
    );

    act(() => {
      writeCountSet(2);
    });

    expect(results).toEqual([0, 2]);

    act(() => {
      writeCountSetState(4);
    });

    expect(results).toEqual([0, 2, 4]);

    act(() => {
      writeCountSetCount(6);
    });
    expect(results).toEqual([0, 2, 4, 6]);
  });
});
