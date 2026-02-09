import { describe, it, expect } from 'vitest';
import { Subject } from '../../src/store/subject';

describe('Subject', () => {
  it('notifies subscribers', () => {
    const subj = new Subject<{value: number}, "value">('value', 1);
    let value = 0;
    let name = '';

    subj.addListener((_name, _value) => {
      name = _name;
      value = _value;
    });

    expect(value).toBe(1);
    expect(name).toBe('value');

    subj.notify(2);

    expect(value).toBe(2);
  });
});
