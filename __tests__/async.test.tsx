import { describe, it, expect } from 'vitest';
import {
  createSlice,
  type IAsync,
  type IAsyncCallback,
  createAsync,
  runAsyncCallback,
} from '../src';

describe('Async', () => {
  it('asynchronous operations resolve and reject with concurrence without React', async () => {
    type AsyncState = {
      one: IAsync<string, { message: string }>;
    };
    const sliceData: AsyncState = {
      one: createAsync.initial(''),
    };

    const slice = createSlice<AsyncState>();

    const store = slice.createStore(sliceData);

    // collect results of the test
    const results: AsyncState['one'][] = [];

    store.addListener(
      'one',
      (_, value) => {
        results.push(value);
      },
      true,
    );

    const callback =
      (message: string): IAsyncCallback<AsyncState, 'one'> =>
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
        message == 'error'
          ? createAsync.rejected({ message: 'error' })
          : createAsync.fulfilled(message),
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
});
