import { describe, it, expect, vi } from 'vitest';
import { createStore, Store } from '../../src';

describe('Store', () => {
  it('updates value on init', () => {
    const { addListener } = createStore({ count: 1 });
    const listener = vi.fn<(name: string, value: number) => void>();

    addListener('count', listener, true);

    expect(listener).toHaveBeenCalledWith('count', 1, 0);
  });

  it('get and set', () => {
    const { addListener, get, set } = createStore({ count: 0 });
    let name = '';
    let value = 0;

    addListener('count', (_name: string, _value: number) => {
      name = _name;
      value = _value;
    });
    set('count', get('count') + 1);
    expect(name).toEqual('count');

    expect(value).toEqual(1);
  });

  it('multiple props in store', () => {
    const { get, set } = createStore({ count: 0, name: '' });
    set('count', get('count') + 1);
    set('name', 'test');
    expect(get('count')).toEqual(1);
    expect(get('name')).toEqual('test');
  });

  it('use class Store ', () => {
    type Counter = { count: number };
    const store = new Store<Counter>({ count: 0 });
    let name = '';
    let value = 0;

    store.addListener('count', (_name: string, _value: number) => {
      name = _name;
      value = _value;
    });
    store.set('count', store.get('count') + 1);
    expect(name).toEqual('count');

    expect(value).toEqual(1);
  });
});
