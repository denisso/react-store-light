import { State } from "../state";
export function compileAccessor(path: string[]): (state: State) => any {
  const code = 'return state.getState()' + path.map((p) => `["${p}"]`).join('');

  return new Function('state', code) as (state: State) => any;
}