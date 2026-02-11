import { describe, it, expect } from 'vitest';
import Light from '../src';

describe('Async', () => {
  it('asynchronous operations resolve and reject with concurrence without React', async () => {
    type AsyncState = {
      one: Light.IAsync<string, { message: string }>;
    };
    const sliceData: AsyncState = {
      one: Light.createAsync.initial(''),
    };

    const store = Light.createStore<AsyncState>(sliceData);

    // collect results of the test
    const results: AsyncState['one'][] = [];

    store.addListener(
      'one',
      (_, value) => {
        results.push(value);
      },
      { isAutoCallListener: true },
    );

    const callback =
      (message: string): Light.IAsyncCallback<AsyncState, 'one'> =>
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
        Array.from({ length: 10 }, () => Light.runAsyncCallback(store, 'one', callback(message))),
      );
      expect(res).toEqual([
        message == 'error'
          ? Light.createAsync.rejected({ message: 'error' })
          : Light.createAsync.fulfilled(message),
        ...Array.from({ length: 9 }, () => Light.createAsync.pending()),
      ]);
    }

    expect(results).toEqual([
      Light.createAsync.initial(''),
      Light.createAsync.pending(),
      Light.createAsync.rejected({ message: 'error' }),
      Light.createAsync.pending(),
      Light.createAsync.fulfilled('success'),
    ]);
  });
});
