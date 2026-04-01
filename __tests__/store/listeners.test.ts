import { describe, it, expect, vi } from 'vitest';
import Light from '../../src';

describe('Store Listeners', () => {
  it('Subscribe > set > check > unsubscribe > check', () => {
    const { subscribe, get, set } = Light.createStore({ count: 0 });

    let value = 0;

    const listener = (_value: number) => {
      value = _value;
    };
    const unsub = subscribe('count', listener);
    set('count', get('count') + 1);

    expect(value).toEqual(1);

    unsub();

    set('count', get('count') + 1);
    expect(value).toEqual(1);
    expect(get('count')).toEqual(2);
  });
  it('unsubscribing twice does not throw', () => {
    const store = Light.createStore({ count: 0 });
    const listener = vi.fn();
    const unsub = store.subscribe('count', listener);

    expect(() => unsub()).not.toThrow();
    expect(() => unsub()).not.toThrow();
  });

  it('setValues notifies subscribers of top-level keys', () => {
    const store = Light.createStore({ count: 0 });
    const listener = vi.fn();
    store.subscribe('count', listener);

    store.setValues({ count: 5 });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(5);
  });
});
