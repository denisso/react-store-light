import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { createSlice, createContext, createProvider, createHooks } from '../src';
import { formatError } from '../src/helpers/error';

describe('Error', () => {
  it('Hook must be used within a React Provider.', () => {
    type Slice = { one: string };
    const Context = createContext();
    const slice = createSlice<Slice>();
    const hooks = createHooks<Slice>(slice.sliceId, Context);
    const Test = () => {
      // throw error need Context
      hooks.useStore();
      return null;
    };

    expect(() => render(<Test />)).toThrow(formatError['hookMustBeInsideProvider']());
  });

  it('The storage does not exist in the React Provider.', () => {
    type Slice = { one: string };
    const Context = createContext();
    const slice = createSlice<Slice>();
    const hooks = createHooks<Slice>(slice.sliceId, Context);
    const Provider = createProvider(Context);
    const Test = () => {
      hooks.useStore();
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
    type Slice = { one: string };
    const Context = createContext();
    const slice = createSlice<Slice>();
    const store = slice.createStore({ one: '' });
    const hooks = createHooks<Slice>(slice.sliceId, Context);
    const Provider = createProvider(Context);

    const Test = () => {
      // prop "one" must be IAsync type
      hooks.useAsync('one', () => () => {});
      return null;
    };

    expect(() =>
      render(
        <Provider value={[store]}>
          <Test />
        </Provider>,
      ),
    ).toThrow(formatError['isNotAsync']('one'));
  });
});
