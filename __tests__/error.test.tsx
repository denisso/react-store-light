import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Light from '../src';
import { formatError } from '../src/helpers/error';

describe('Error', () => {
  it('Hook must be used within a React Provider.', () => {
    type Data = { one: string };
    const Context = Light.createContext();
    const slice = Light.createSlice<Data>();
    const useStore = Light.createStoreHook<Data>(Context, slice.sliceId);
    const Test = () => {
      // throw error need Context
      useStore();
      return null;
    };

    expect(() => render(<Test />)).toThrow(formatError['hookMustBeInsideProvider']());
  });

  it('The storage does not exist in the React Provider.', () => {
    type Data = { one: string };
    const Context = Light.createContext();
    const slice = Light.createSlice<Data>();
    const useStore = Light.createStoreHook<Data>(Context, slice.sliceId);
    const Provider = Light.createProvider(Context);
    const Test = () => {
      useStore();
      return null;
    };
    expect(() =>
      render(
        // stroe must be added to the provider
        <Provider value={[]}>
          <Test />
        </Provider>,
      ),
    ).toThrow(formatError['storeNotExist']());
  });

  it('In the useAsync hook, only IAsync values can be used.', () => {
    type Data = { one: string };
    const store = Light.createStore<Data>({ one: '' });
    const Test = () => {
      // prop "one" must be IAsync type
      Light.useAsync(store, 'one', () => () => {});
      return null;
    };

    expect(() => render(<Test />)).toThrow(formatError['isNotAsync']('one'));
  });
});
