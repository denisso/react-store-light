import { describe, it, expect, vi } from 'vitest';
import { createStore } from '../../src';
import { formatError } from '../../src/helpers/error';

describe('Types', () => {
  it('Object with wrong keys', () => {
    const o = createStore<[]>([]);
    expect(() => {
      o.get('at');
    }).toThrow(formatError['errorKeyMessage']('at'));
  });
});
