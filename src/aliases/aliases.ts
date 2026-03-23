import type { Listener } from '../public-api';
import { State } from '../state';
import { compileAccessor, type Accessor } from '../state/compile-accessor';
import type { UnwrapGetPathStore, GetPathWithState } from '../helpers/get-path';

export class Aliases<A extends Record<PropertyKey, GetPathWithState<any>>> {
  __accessors: Record<keyof A, Accessor>;
  __aliases: A;
  __states: Record<keyof A, State>;
  __paths: Record<keyof A, string[]>;
  constructor(aliases: A) {
    this.__aliases = aliases;

    this.__accessors = {} as Record<keyof A, Accessor>;
    this.__paths = {} as Record<keyof A, string[]>;
    this.__states = {} as Record<keyof A, State>;
    for (const key of Object.keys(aliases) as (keyof A)[]) {
      const aliase = aliases[key]();
      this.__paths[key] = aliase.path;
      this.__states[key] = aliase.store.getState();
      this.__accessors[key] = compileAccessor(this.__paths[key]);
    }
    this.get = this.get.bind(this);
    this.set = this.set.bind(this);
    this.getAliases = this.getAliases.bind(this);
    this.subscribe = this.subscribe.bind(this);
  }

  getAliases<K extends keyof A>(key: K): A[K] {
    return this.__aliases[key];
  }
  get<K extends keyof A>(key: K): UnwrapGetPathStore<A[K]> {
    return this.__accessors[key](this.__states[key]) as UnwrapGetPathStore<A[K]>;
  }
  set<K extends keyof A>(key: K, value: UnwrapGetPathStore<A[K]>) {
    this.__states[key].set(this.__paths[key], value, this.__accessors[key]);
  }
  subscribe<K extends keyof A>(key: K, listener: Listener<A, K>) {
    const subscribe = this.__states[key].subsribe(this.__paths[key], listener);
    return subscribe;
  }
}
