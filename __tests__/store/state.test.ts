import { describe, it, expect, vi } from 'vitest';
import { createStore } from '../../src';

describe('State', () => {
  it('getState', () => {
    const store = createStore({ count: 1 });
    expect(store.getState()).toEqual({ count: 1 });
  });

  it('setState', () => {
    const state1 = { count: 1 };
    const store = createStore(state1);
    const results: number[] = [];
    store.addListener(
      'count',
      (_, value) => {
        results.push(value);
      },
      false,
    );
    const state2 = { count: 2 };
    store.setState(state2);
    expect(store.getState()).toEqual({ count: 2 });
    expect(results).toEqual([2]);
  });
});
