import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import Light from '../src';

describe('Tree stores', () => {
  it('Update top bottom', () => {
    type Counter = { id: number; count: number };
    type Counters = { counters: Counter[] };
    // global
    const GlobalContext = Light.createContext();
    const globalSlice = Light.createSlice<Counters>();
    const globalStore = globalSlice.createStore({ counters: [{ id: 0, count: 0 }] });

    // counter
    const CounterContext = Light.createContext();
    const counterSlice = Light.createSlice<Counter>();
    const CounterProvider = Light.createProvider(CounterContext);
    const useCounterStore = Light.createStoreHook<Counter>(CounterContext, counterSlice.sliceId);
    // for test
    const results: Counter['count'][] = [];

    // tree
    const CounterState = () => {
      const counterStore = useCounterStore();
      const [count] = Light.useState(counterStore, 'count');
      React.useEffect(() => {
        results.push(count);
      }, [count]);
      return null;
    };
    const CounterChild = ({ counter }: { counter: Counter }) => {
      const counterStore = Light.useCreateStore(counter, counterSlice);

      return <CounterProvider value={[counterStore]}>{<CounterState />}</CounterProvider>;
    };

    const RootComponent = () => {
      const [counters] = Light.useState(globalStore, 'counters');
      return (
        <>
          {counters.map((counter) => (
            <CounterChild key={counter.id} counter={counter} />
          ))}
        </>
      );
    };

    const Provider = Light.createProvider(GlobalContext);
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
    const CounterContext = Light.createContext();
    const counterSlice = Light.createSlice<Counter>();
    const CounterProvider = Light.createProvider(CounterContext);
    const useCounterStore = Light.createStoreHook<Counter>(CounterContext, counterSlice.sliceId);

    // for test
    let writeCountSet: (count: number) => void;
    const results: number[] = [];

    // counter Reader
    const Reader = () => {
      const couterStore = useCounterStore();
      const [count] = Light.useState(couterStore, 'count');

      React.useEffect(() => {
        results.push(count);
      }, [count]);
      return null;
    };

    // counter Writer
    const Writer = () => {
      const counterStore = useCounterStore();

      writeCountSet = (count) => {
        const state = counterStore.getRef();
        state.count = count;
        counterSlice.updateState(state);
      };
      return null;
    };
    const CounterReader = () => {
      const counterStore = Light.useCreateStore(counter, counterSlice);

      return <CounterProvider value={[counterStore]}>{<Reader />}</CounterProvider>;
    };
    const CounterWriter = () => {
      const counterStore = Light.useCreateStore(counter, counterSlice);

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

    expect(results).toEqual([0, 2]);
  });
});
