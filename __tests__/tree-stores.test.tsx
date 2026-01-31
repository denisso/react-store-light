import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import { createSlice, createContext, createProvider, createHooks } from '../src';

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
    const CounterRoot = ({ counter }: { counter: Counter }) => {
      const [counterStore] = React.useState(() => {
        return counterSlice.createStore(counter);
      });

      React.useEffect(() => {
        // test it
        counterStore.setState(counter);
      }, [counter, counterStore]);

      return <CounterProvider value={[counterStore]}>{<CounterState />}</CounterProvider>;
    };

    const RootComponent = () => {
      const [counters] = globalHooks.useState('counters');
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

  it('Usage createStore, children slices update each other', () => {
    type Counter = { id: number; count: number };
    type Counters = { counters: Counter[] };
    // global counters
    const GlobalContext = createContext();
    const globalSlice = createSlice<Counters>();
    const counter = { id: 0, count: 0 };
    const counters = [counter];
    const globalStore = globalSlice.createStore({ counters });

    // counter
    const CounterContext = createContext();
    const counterSlice = createSlice<Counter>();
    const CounterProvider = createProvider(CounterContext);
    const storeCounterReader = counterSlice.createStore(counters[0]);
    const storeCounterWriter = counterSlice.createStore(counters[0]);
    const counterHook = createHooks<Counter>(counterSlice.sliceId, CounterContext);
    expect(storeCounterReader).toBe(storeCounterWriter);

    counterSlice.mountStore(storeCounterReader.getState());
    counterSlice.mountStore(storeCounterWriter.getState());
    // for test
    let writeCountSet: (count: number) => void;
    let writeCountSetState: (count: number) => void;
    let writeCountSetCount: (count: number) => void;
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
      // const [, setCount] = counterHook.useState('count');
      writeCountSet = (count) => {
        const state = store.getState();
        state.count = count;
        counterSlice.updateState(state);
      };
      // writeCountSetState = (count) => {
      //   const state = store.getState();
      //   state.count = count;
      //   store.setState(state);
      // };
      // writeCountSetCount = setCount;
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

    // act(() => {
    //   writeCountSetState(4);
    // });

    // expect(results).toEqual([0, 2, 4]);

    // act(() => {
    //   writeCountSetCount(6);
    // });

    // expect(results).toEqual([0, 2, 4, 6]);

    // act(() => {
    //   counterSlice.removeStore(counters[0], storeCounterWriter);
    //   writeCountSet(8);
    // });

    // expect(results).toEqual([0, 2, 4, 6]);

    // act(() => {
    //   counterSlice.addStore(counters[0], storeCounterWriter);
    // });

    // expect(results).toEqual([0, 2, 4, 6]);

    // act(() => {
    //   writeCountSet(8);
    // });

    // expect(results).toEqual([0, 2, 4, 6, 8]);
  });

  it('Usage useEffect, children slices update each other', () => {
    type Counter = { id: number; count: number };
    type Counters = { counters: Counter[] };
    // global counters
    const GlobalContext = createContext();
    const globalSlice = createSlice<Counters>();
    const counter = { id: 0, count: 0 };
    const counters = [counter];
    const globalStore = globalSlice.createStore({ counters });

    // counter
    const CounterContext = createContext();
    const counterSlice = createSlice<Counter>();
    const CounterProvider = createProvider(CounterContext);
    const storeCounterReader = counterSlice.createStore(counters[0]);
    const storeCounterWriter = counterSlice.createStore(counters[0]);
    counterSlice.mountStore(storeCounterReader.getState());
    counterSlice.mountStore(storeCounterWriter.getState());
    const hooks = createHooks<Counter>(counterSlice.sliceId, CounterContext);
    // for test
    let writeCountSet: (count: number) => void;
    let writeCountSetState: (count: number) => void;
    let writeCountSetCount: (count: number) => void;
    const results: number[] = [];

    // counter Reader
    const Reader = () => {
      const [count] = hooks.useState('count');

      React.useEffect(() => {
        results.push(count);
      }, [count]);
      return null;
    };

    // counter Writer
    const Writer = () => {
      const store = hooks.useStore();
      const [, setCount] = hooks.useState('count');
      writeCountSet = (count) => {
        const state = store.getState();
        state.count = count;
        counterSlice.updateState(state);
      };
      // writeCountSetState = (count) => {
      //   const state = store.getState();
      //   state.count = count;
      //   store.setState(state);
      // };
      // writeCountSetCount = setCount;
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

    // act(() => {
    //   writeCountSetState(4);
    // });

    // expect(results).toEqual([0, 2, 4]);

    // act(() => {
    //   writeCountSetCount(6);
    // });

    // expect(results).toEqual([0, 2, 4, 6]);

    // act(() => {
    //   counterSlice.removeStore(counters[0], storeCounterWriter);
    //   writeCountSet(8);
    // });

    // expect(results).toEqual([0, 2, 4, 6]);

    // act(() => {
    //   counterSlice.addStore(counters[0], storeCounterWriter);
    // });

    // expect(results).toEqual([0, 2, 4, 6]);

    // act(() => {
    //   writeCountSet(8);
    // });

    // expect(results).toEqual([0, 2, 4, 6, 8]);
  });
});
