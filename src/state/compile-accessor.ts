import { State } from '.';

export interface Accessor {
  (state: State & { getValues: () => void }, parent?: boolean): any;
}

export function compileAccessor(path: string[]): Accessor {
  const fullPath = path.map((p) => `["${p}"]`).join('');
  const parentPath = path.slice(0, -1).map((p) => `["${p}"]`).join('');

  const code = `
    const base = state.getValues();
    return parent ? base${parentPath} : base${fullPath};
  `;

  return new Function('state', 'parent', code) as Accessor;
}
