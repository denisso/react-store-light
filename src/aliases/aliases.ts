import { GetPath } from '../public-api';
import type { Listener } from '../public-api';
function compileAccessor(path: string[]) {
  const code = 'return state' + path.map((p) => `["${p}"]`).join('');

  return new Function('state', code);
}

type UnwrapGetPath<T> = T extends GetPath<infer U> ? U : never;

export class Aliases<V extends Record<PropertyKey, GetPath<any>>> {
  __accessors: Record<keyof V, Function>;

  __state: Record<string, any>;
  constructor(aliases: V, state: Record<string, any>) {
    this.__state = state;
    this.__accessors = {} as Record<keyof V, Function>;

    for (const key of Object.keys(aliases) as (keyof V)[]) {
      this.__accessors[key] = compileAccessor(aliases[key]());
    }
    this.get = this.get.bind(this);
  }
  get<K extends keyof V>(key: K): UnwrapGetPath<V[K]> {
    return this.__accessors[key](this.__state) as UnwrapGetPath<V[K]>;
  }
  subscribe<K extends keyof V>(key: K, listener: Listener<V, K>) {
    const subscribe = this.__state.subsribe([key as string]);
    return subscribe(listener);
  }
}
