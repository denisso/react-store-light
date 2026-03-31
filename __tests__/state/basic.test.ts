import { describe, it, expect } from 'vitest';
import { State } from '../../src/state';

describe('State core behavior', () => {
  it('getValues returns reference by default', () => {
    const state = new State({ user: { name: 'Alice' } });
    const values = state.getValues();

    values.user.name = 'Bob';

    expect(state.get(['user', 'name'])).toBe('Bob');
  });

  it('getValues(true) returns deep copy', () => {
    const state = new State({ user: { name: 'Alice' } });
    const values = state.getValues(true);

    values.user.name = 'Bob';

    expect(state.get(['user', 'name'])).toBe('Alice');
  });

  it('set clones input payload', () => {
    const state = new State({ profile: { age: 20 } });
    const nextProfile = { age: 30 };

    state.set(['profile'], nextProfile);
    nextProfile.age = 99;

    expect(state.get(['profile'])).toEqual({ age: 30 });
  });
});
