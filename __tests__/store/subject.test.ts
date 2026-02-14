import { describe, it, expect } from 'vitest';
import { Value } from '../../src/store/value';

describe('Value', () => {
  it('notifies subscribers', () => {
    const subj = new Value<{ value: number }, 'value'>('value', 1);
    let value = 0;
    let name = '';

    subj.addListener(
      (_name, _value) => {
        name = _name;
        value = _value;
      },
      { isAutoCallListener: true },
    );

    expect(value).toBe(1);
    expect(name).toBe('value');

    subj.notify(2);

    expect(value).toBe(2);
  });
});
