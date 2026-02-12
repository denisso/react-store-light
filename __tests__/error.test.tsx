import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Light from '../src';
import { formatError } from '../src/helpers/error';

describe('Error', () => {
  it('Hook must be used within a React Provider.', () => {
    const Test = () => {
      // throw error need Context
      Light.useStore(Symbol());
      return null;
    };

    expect(() => render(<Test />)).toThrow(formatError['hookMustBeInsideProvider']());
  });

  it('The storage does not exist in the React Provider.', () => {
    const Test = () => {
      Light.useStore(Symbol());
      return null;
    };
    expect(() =>
      render(
        // stroe must be added to the provider
        <Light.Provider value={{ [Symbol()]: {} }}>
          <Test />
        </Light.Provider>,
      ),
    ).toThrow(formatError['valueIdNotExist']());
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
