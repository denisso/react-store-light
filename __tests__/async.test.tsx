import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, act, waitFor } from '@testing-library/react';
import {
  createSlice,
  createPovider,
  type IAsync,
  createTypedPromise,
  asyncInit,
  asyncPending,
  asyncFulfilled,
  asyncError,
} from '../src';

describe('React Store tests', () => {
  it('test asynchronous operations without React', async () => {
    type Slice = {
      one: IAsync<string, { message: string }>;
    };
    const sliceData: Slice = {
      one: asyncInit(''),
    };
    const { createStore } = createSlice<Slice>();

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

  it('test asynchronous operations using useSelectorAsync', async () => {
    type Slice = {
      one: IAsync<string, { message: string }>;
    };
    const sliceData: Slice = {
      one: asyncInit(''),
    };
    const { createStore, useSelectorAsync, useSelector } = createSlice<Slice>();

    const slice = createStore(sliceData);

    const promiseFn = async (message: string) => {
      return createTypedPromise<Slice['one']>((resolve) => {
        resolve(message);
      });
    };

    const { Provider, Context } = createPovider();
    let dispatchTest: (message: string) => void;

    const TestComponent1 = () => {
      const { dispatch } = useSelectorAsync(Context, 'one', promiseFn);
      dispatchTest = dispatch;
      return null;
    };

    const results: Slice['one'][] = [];
    const TestComponent2 = () => {
      const [value] = useSelector(Context, 'one');
      React.useEffect(() => {
        results.push(value);
      }, [value]);
      return null;
    };

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
