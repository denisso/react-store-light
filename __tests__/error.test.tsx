import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Light from '../src';
import { formatError } from '../src/helpers/error';

describe('Error', () => {
  it('Hook must be used within a React Provider.', () => {
    type Data = { one: string };
    const Context = Light.createContext();
    const useStore = Light.createStoreHook<Data>(Context, Symbol());
    const Test = () => {
      // throw error need Context
      useStore();
      return null;
    };

    expect(() => render(<Test />)).toThrow(formatError['hookMustBeInsideProvider']());
  });

  it('The storage does not exist in the React Provider.', () => {
    const Context = Light.createContext();
    const useFoo = Light.createGetById(Context, Symbol());
    const Provider = Light.createProvider(Context);
    const Test = () => {
      useFoo();
      return null;
    };
    expect(() =>
      render(
        // stroe must be added to the provider
        <Provider value={{[Symbol()]: {}}}>
          <Test />
        </Provider>,
      ),
    ).toThrow(formatError['valueIDNotExist'](Symbol()));
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
