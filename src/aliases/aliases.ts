import { GetPath } from '../public-api';
import { State } from '../state';

function compileAccessor(path: string[]) {
  const code = 'return state' + path.map((p) => `["${p}"]`).join('');

  return new Function('state', code);
}

type UnwrapGetPath<T> = T extends GetPath<infer U> ? U : never;
export class Aliases<V extends Record<PropertyKey, GetPath<any>>> {
  accessors: Record<keyof V, Function>;
  keys: (keyof V)[];
  state: State;
  constructor(aliases: V, state: State) {
    this.state = state;
    const accessors = {} as Record<keyof V, Function>;
    this.keys = Object.keys(aliases) as (keyof V)[];
    for (const key of this.keys) {
      accessors[key] = compileAccessor(aliases[key]());
    }
    this.accessors = accessors;
    this.get = this.get.bind(this);
  }
  get<K extends keyof V>(key: K): UnwrapGetPath<V[K]> {
    return this.accessors[key](this.state) as UnwrapGetPath<V[K]>;
  }
}
