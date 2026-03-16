import { State } from '../state';

export interface Accessor {
  (state: State & { getValues: () => void }): any;
}

export function compileAccessor(
  path: string[],
): Accessor {
  const code = 'return state.getValues()' + path.map((p) => `["${p}"]`).join('');

  return new Function('state', code) as Accessor;
}
