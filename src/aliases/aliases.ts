import type { GetPath, Listener } from '../public-api';
import { State } from '../state';
import { compileAccessor, type Accessor } from '../state/compile-accessor';

export type UnwrapGetPath<T> = T extends GetPath<infer U> ? U : never;

export class Aliases<A extends Record<PropertyKey, GetPath<any>>> {
  __accessors: Record<keyof A, Accessor>;
  __state: State;
  __aliases: A;
  __paths: Record<keyof A, string[]>;
  constructor(aliases: A, state: State) {
    this.__aliases = aliases;
    this.__state = state;
    this.__accessors = {} as Record<keyof A, Accessor>;
    this.__paths = {} as Record<keyof A, string[]>;
    for (const key of Object.keys(aliases) as (keyof A)[]) {
      const path = aliases[key]();
      this.__paths[key] = path;
      this.__accessors[key] = compileAccessor(path);
    }
    this.get = this.get.bind(this);
    this.getAliases = this.getAliases.bind(this);
    this.getState = this.getState.bind(this);
    this.subscribe = this.subscribe.bind(this);
  }
  getState() {
    return this.__state;
  }
  getAliases<K extends keyof A>(key: K): A[K] {
    return this.__aliases[key];
  }
  get<K extends keyof A>(key: K): UnwrapGetPath<A[K]> {
    return this.__accessors[key](this.__state) as UnwrapGetPath<A[K]>;
  }
  set<K extends keyof A>(key: K, value: UnwrapGetPath<A[K]>) {
    this.__state.set(this.__paths[key], value, this.__accessors[key]);
  }
  subscribe<K extends keyof A>(key: K, listener: Listener<A, K>) {
    const subscribe = this.__state.subsribe(this.__paths[key], listener);
    return subscribe;
  }
}
