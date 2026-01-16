import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, act, waitFor } from '@testing-library/react';
import {
  createSlice,
  createContext,
  type IAsync,
  createTypedPromise,
  asyncInit,
  asyncPending,
  asyncFulfilled,
  asyncError,
  createProvider,
} from '../src';

describe('Async', () => {
  it('test asynchronous operations without React', async () => {
    type Slice = {
      one: IAsync<string, { message: string }>;
    };
    const sliceData: Slice = {
      one: asyncInit(''),
    };
    const { createStore } = createSlice<Slice>(null);

    const slice = createStore(sliceData);
    const results: Slice['one'][] = [];

    slice.addListener('one', (_, value) => {
      results.push(value);
    });

    const promiseFn = async (message: string) => {
      return createTypedPromise<Slice['one']>((resolve, reject) => {
        if (message == 'error') {
          reject({ message });
        } else {
          resolve(message);
        }
      }).then((result) => {
        // test it
        slice.set('one', result);
      });
    };

    for (const message of ['error', 'success']) {
      slice.set('one', asyncPending());
      await promiseFn(message);
    }

    expect(results).toEqual([
      asyncInit(''),
      asyncPending(),
      asyncError({ message: 'error' }),
      asyncPending(),
      asyncFulfilled('success'),
    ]);
  });

  it('test asynchronous operations using useStateAsync', async () => {
    type Slice = {
      one: IAsync<string, { message: string }>;
    };
    const sliceData: Slice = {
      one: asyncInit(''),
    };
    const Context = createContext();
    const { createStore, useAsync, useState } = createSlice<Slice>(Context);

    const slice = createStore(sliceData);

    const promiseFn = async (message: string) => {
      return createTypedPromise<Slice['one']>((resolve) => {
        resolve(message);
      });
    };

    let dispatchTest: (message: string) => void;

    const TestComponent1 = () => {
      const { dispatch } = useAsync('one', promiseFn);
      dispatchTest = dispatch;
      return null;
    };

    const results: Slice['one'][] = [];
    const TestComponent2 = () => {
      const [value] = useState('one');
      React.useEffect(() => {
        results.push(value);
      }, [value]);
      return null;
    };

    const Provider = createProvider(Context);
    render(
      <Provider value={[slice]}>
        <TestComponent1 />
        <TestComponent2 />
      </Provider>,
    );

    act(() => {
      dispatchTest('hello');
    });

    await waitFor(() => {
      expect(results).toEqual([asyncInit(''), asyncPending(), asyncFulfilled('hello')]);
    });
  });
});
