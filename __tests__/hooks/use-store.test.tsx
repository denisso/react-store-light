import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import Light from '../../src';

describe('useStore', () => {
  it('Custom store', () => {
    type Data = { count: number };

    class CustomStore extends Light.Store<Data> {
      test() {}
    }
    const store = new CustomStore({ count: 1 });
    const spy = vi.spyOn(store, 'test');
    const storeId = Light.createContextValueId<CustomStore>();

    const Store = () => {
      const store = Light.useStore(storeId);
      React.useEffect(() => {
        store.test();
      }, [store]);
      expect(store).toBeInstanceOf(CustomStore);
      return null;
    };
    render(
      <Light.Provider value={{ [storeId]: store }}>
        <Store />
      </Light.Provider>,
    );
    expect(spy).toHaveBeenCalled();
  });
});
