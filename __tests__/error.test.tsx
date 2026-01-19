import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
  createSlice,
  createContext,
  createProvider,
} from '../src';
import { formatError } from '../src/helpers/error';

describe('Error', () => {
  it('Hook must be used within a React Provider.', () => {
    type Slice = { one: string };
    const Context = createContext();
    const slice = createSlice<Slice>(null);
    const store = slice.createStore({ one: '' });
    const Provider = createProvider(Context);
    const Test = () => {
      // throw error need Context
      slice.useStore();
      return null;
    };
    expect(() =>
      render(
        <Provider value={[store]}>
          <Test />
        </Provider>,
      ),
    ).toThrow(formatError['contextNotExist']('useStore', null));
  });

  it('The storage does not exist in the React Provider.', () => {
    type Slice = { one: string };
    const Context = createContext();
    const slice = createSlice<Slice>(Context);
    const Provider = createProvider(Context);
    const Test = () => {
      // throw error need Context
      slice.useStore();
      return null;
    };

    expect(() =>
      render(
        <Provider value={[]}>
          <Test />
        </Provider>,
      ),
    ).toThrow(formatError['storeNotExist']('useStore', null));
  });

  it('A store with this id already exists in the provider.', () => {
    type Slice = { one: string };
    const Context = createContext();
    const slice = createSlice<Slice>(Context);
    const store = slice.createStore({ one: '' });
    const Provider = createProvider(Context);
    const Test = () => {
      // throw error need Context
      slice.useStore();
      return null;
    };

    expect(() =>
      render(
        <Provider value={[store, store]}>
          <Test />
        </Provider>,
      ),
    ).toThrow(formatError['storeUniqIdAlreadyExist']());
  });

  it('In the useAsync hook, only IAsync values can be used.', () => {
    type Slice = { one: string };
    const Context = createContext();
    const slice = createSlice<Slice>(Context);
    const store = slice.createStore({ one: '' });
    const Provider = createProvider(Context);

    const Test = () => {
      // throw error need Context
      slice.useAsync('one', () => () => {});
      return null;
    };

    expect(() =>
      render(
        <Provider value={[store]}>
          <Test />
        </Provider>,
      ),
    ).toThrow(formatError['isNotAsync']("one"));
  });
});
