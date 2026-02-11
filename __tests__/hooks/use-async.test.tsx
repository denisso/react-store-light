import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, act, waitFor } from '@testing-library/react';
import Light from '../../src';

describe('hook useAsync', () => {
  it('test asynchronous operations using useAsync', async () => {
    type DataTypeA = {
      one: Light.IAsync<string, { message: string }>;
    };
    const sliceData: DataTypeA = {
      one: Light.createAsync.initial(''),
    };

    const store = Light.createStore<DataTypeA>(sliceData);

    const promiseFn =
      (message: string): Light.IAsyncCallback<DataTypeA, 'one'> =>
      (_, resolve) => {
        resolve(message);
      };

    let dispatchTest: (message: string) => void;

    const TestComponent1 = () => {
      const { dispatch } = Light.useAsync(store, 'one', promiseFn);
      dispatchTest = dispatch;
      return null;
    };

    const results: DataTypeA['one'][] = [];
    const TestComponent2 = () => {
      const [value] = Light.useState(store, 'one');
      React.useEffect(() => {
        results.push(value);
      }, [value]);
      return null;
    };

    render(
      <>
        <TestComponent1 />
        <TestComponent2 />
      </>,
    );

    act(() => {
      dispatchTest('hello');
    });

    await waitFor(() => {
      expect(results).toEqual([
        Light.createAsync.initial(''),
        Light.createAsync.pending(),
        Light.createAsync.fulfilled('hello'),
      ]);
    });
  });

  it('abort operation for one store', async () => {
    type DataTypeA = {
      one: Light.IAsync<string>;
    };

    const promiseFn =
      (arg: string): Light.IAsyncCallback<DataTypeA, 'one'> =>
      (_, resolve) => {
        setTimeout(() => resolve(arg), 1000);
      };

    const store = Light.createStore<DataTypeA>({ one: Light.createAsync.initial('') });

    const results: DataTypeA['one'][] = [];
    store.addListener(
      'one',
      (_, value) => {
        results.push(value);
      },
      {"isAutoCallListener": true},
    );
    let dispatchTest: (arg: string) => void;
    let abortTest: () => void;
    const TestComponent1 = () => {
      const { dispatch, abort } = Light.useAsync(store, 'one', promiseFn);
      dispatchTest = dispatch;
      abortTest = abort;
      return null;
    };

    render(<TestComponent1 />);
    act(() => {
      dispatchTest('hello');
    });

    act(() => {
      abortTest();
    });

    await waitFor(() => {
      expect(results).toEqual([
        Light.createAsync.initial(''),
        Light.createAsync.pending(),
        Light.createAsync.aborted(),
      ]);
    });
  });
});
