import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, act, waitFor } from '@testing-library/react';
import {
  createSlice,
  createContext,
  type IAsync,
  type IAsyncCallback,
  createAsync,
  createProvider,
  runAsyncCallback,
} from '../src';

describe('Async', () => {
  it('asynchronous operations resolve and reject with concurrence without React', async () => {
    type Slice = {
      one: IAsync<string, { message: string }>;
    };
    const sliceData: Slice = {
      one: createAsync.initial(''),
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
          setTimeout(() => {
            if (message === 'error') {
              return reject({ message });
            }
            resolve(message);
          }, 100);
        };

    for (const message of ['error', 'success']) {
      // Only 1 out of 10 should work.
      const res = await Promise.all(
        Array.from({ length: 10 }, () => runAsyncCallback(store, 'one', callback(message))),
      );
      expect(res).toEqual([
        message == 'error' ? createAsync.rejected({ message: 'error' }) : createAsync.fulfilled(message),
        ...Array.from({ length: 9 }, () => createAsync.pending()),
      ]);
    }

    expect(results).toEqual([
      createAsync.initial(''),
      createAsync.pending(),
      createAsync.rejected({ message: 'error' }),
      createAsync.pending(),
      createAsync.fulfilled('success'),
    ]);
  });

  it('test asynchronous operations using useAsync', async () => {
    type Slice = {
      one: IAsync<string, { message: string }>;
    };
    const sliceData: Slice = {
      one: createAsync.initial(''),
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
      expect(results).toEqual([createAsync.initial(''), createAsync.pending(), createAsync.fulfilled('hello')]);
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
    const store = slice.createStore({ one: createAsync.initial('') });
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
      expect(results).toEqual([createAsync.initial(''), createAsync.pending(), createAsync.aborted()]);
    });
  });
});
