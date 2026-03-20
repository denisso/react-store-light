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
});
