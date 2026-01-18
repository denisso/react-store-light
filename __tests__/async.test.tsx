import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, act, waitFor } from '@testing-library/react';
import {
  createSlice,
  createContext,
  type IAsync,
  IAsyncCallback,
  asyncInitial,
  asyncPending,
  asyncFulfilled,
  asyncRejected,
  asyncAborded,
  createProvider,
  runAsyncCallback,
} from '../src';

describe('Async', () => {
  it('asynchronous operations resolve and reject without React', async () => {
    type Slice = {
      one: IAsync<string, { message: string }>;
    };
    const sliceData: Slice = {
      one: asyncInitial(''),
    };
    const slice = createSlice<Slice>(null);

    const store = slice.createStore(sliceData);

    // collect results of the test
    const results: Slice['one'][] = [];

    store.addListener('one', (_, value) => {
      results.push(value);
    });

    const callback =
      (message: string): IAsyncCallback<Slice, 'one'> =>
      (_, resolve, reject) => {
        try {
          if (message === 'error') {
            reject({ message });
            throw message;
          }

          resolve(message);
        } catch (e) {
          throw e;
        }
      };

    for (const message of ['error', 'success']) {
      await new Promise<Slice['one']>((resolve) => {
        runAsyncCallback(store, 'one', callback(message), resolve);
      });
    }

    expect(results).toEqual([
      asyncInitial(''),
      asyncPending(),
      asyncRejected({ message: 'error' }),
      asyncPending(),
      asyncFulfilled('success'),
    ]);
  });

  it('test asynchronous operations using useAsync', async () => {
    type Slice = {
      one: IAsync<string, { message: string }>;
    };
    const sliceData: Slice = {
      one: asyncInitial(''),
    };
    const Context = createContext();
    const slice = createSlice<Slice>(Context);

    const store = slice.createStore(sliceData);

    const promiseFn =
      (message: string): IAsyncCallback<Slice, 'one'> =>
      (_, resolve) => {
        resolve(message);
      };

    let dispatchTest: (message: string) => void;

    const TestComponent1 = () => {
      const { dispatch } = slice.useAsync('one', promiseFn);
      dispatchTest = dispatch;
      return null;
    };

    const results: Slice['one'][] = [];
    const TestComponent2 = () => {
      const [value] = slice.useState('one');
      React.useEffect(() => {
        results.push(value);
      }, [value]);
      return null;
    };

    const Provider = createProvider(Context);
    render(
      <Provider value={[store]}>
        <TestComponent1 />
        <TestComponent2 />
      </Provider>,
    );

    act(() => {
      dispatchTest('hello');
    });

    await waitFor(() => {
      expect(results).toEqual([asyncInitial(''), asyncPending(), asyncFulfilled('hello')]);
    });
  });

  it('abort operation for one store', async () => {
    type Slice = {
      one: IAsync<string>;
    };

    
    const promiseFn =
      (arg: string): IAsyncCallback<Slice, 'one'> =>
      (_, resolve) => {
        setTimeout(() => resolve(arg), 1000);
      };

    const Context = createContext();
    const Provider = createProvider(Context);
    const slice = createSlice<Slice>(Context);
    const store = slice.createStore({ one: asyncInitial('') });
    const results: Slice['one'][] = [];
    store.addListener('one', (_, value) => {
      results.push(value);
    });
    let dispatchTest: (arg: string) => void;
    let abortTest: () => void;
    const TestComponent1 = () => {
      const { dispatch, abort } = slice.useAsync('one', promiseFn);
      dispatchTest = dispatch;
      abortTest = abort;
      return null;
    };
    render(
      <Provider value={[store]}>
        <TestComponent1 />
      </Provider>,
    );
    act(() => {
      dispatchTest('hello');
    });

    act(() => {
      abortTest();
    });
    
    await waitFor(() => {
      console.log(results)
      expect(results).toEqual([
        asyncInitial(''),
        asyncPending(),
        asyncAborded(),
      ]);
    });
  });


});
