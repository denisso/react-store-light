import type { GetPath, Listener } from '../public-api';
import { State } from '../state';
import { compileAccessor } from '../helpers';

type UnwrapGetPath<T> = T extends GetPath<infer U> ? U : never;

export class Aliases<A extends Record<PropertyKey, GetPath<any>>> {
  __accessors: Record<keyof A, Function>;
  __state: State;
  __aliases: A;
  constructor( aliases: A, state: State) {
    this.__aliases = aliases;
    this.__state = state;
    this.__accessors = {} as Record<keyof A, Function>;

    for (const key of Object.keys(aliases) as (keyof A)[]) {
      this.__accessors[key] = compileAccessor(aliases[key]());
    }
    this.get = this.get.bind(this);
    this.getAliases = this.getAliases.bind(this);
    this.getState = this.getState.bind(this);
    this.subscribe = this.subscribe.bind(this);
  }
  getState(){
    return this.__state
  }
  getAliases<K extends keyof A>(key: K): A[K] {
    return this.__aliases[key];
  }
  get<K extends keyof A>(key: K): UnwrapGetPath<A[K]> {
    return this.__accessors[key](this.__state) as UnwrapGetPath<A[K]>;
  }
  subscribe<K extends keyof A>(key: K, listener: Listener<A, K>) {
    const subscribe = this.__state.subsribe([key as string]);
    return subscribe(listener);
  }
}
