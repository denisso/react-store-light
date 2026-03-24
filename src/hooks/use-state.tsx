import React from 'react';
import { Store, Listener } from '../store';
import { Aliases } from '../aliases';
import type { UnwrapAlias } from '../helpers/get-path';
import type { IContextValueId } from '../types';
import { useContextId } from './use-context-id';

export function useState<T extends Record<string, any>, K extends keyof T>(
  aliases: IContextValueId<Aliases<T>>,
  key: K,
): [UnwrapAlias<T[K]>, (arg: UnwrapAlias<T[K]>) => void];

export function useState<T extends Record<string, any>, K extends keyof T>(
  aliases: Aliases<T>,
  key: K,
): [UnwrapAlias<T[K]>, (arg: UnwrapAlias<T[K]>) => void];

export function useState<T extends object, K extends keyof T>(
  contextId: IContextValueId<Store<T>>,
  key: K,
): [T[K], (arg: T[K]) => void];

export function useState<T extends object, K extends keyof T>(
  store: Store<T>,
  key: K,
): [T[K], (arg: T[K]) => void];

/**
 * Subscribes a component to a single store field by key.
 *
 * Returns:
 * - similar to [value, setValue] = React.useState
 *
 * @param store - Store<T> | IContextValueId<Store<T>>
 * @param key - name field in the store
 */
export function useState<T extends Record<string, any>, K extends keyof T>(
  stateHolder: Store<T> | Aliases<T> | IContextValueId<Store<T> | Aliases<T>>,
  key: K,
): [T[K], (arg: T[K]) => void] {
  const _stateHolder = typeof stateHolder === 'symbol' ? useContextId(stateHolder) : stateHolder;

  const [inst] = React.useState(() => {
    return {
      getSnapshot() {
        try {
          return _stateHolder.get(key);
        } catch {}
      },

      subscribe(listener: Listener<T, K>) {
        return _stateHolder.subscribe(key, listener);
      },
      setState(state: T[K]) {
        _stateHolder.set(key, state);
      },
    };
  });

  const state = React.useSyncExternalStore(inst.subscribe, inst.getSnapshot) as T[K];

  // Not recommended because tearing is possible.
  // const [state, setState] = React.useState(stateHolder.get(key));
  // React.useEffect(() => {
  //   stateHolder.subscribe(key, setState);
  // }, [setState]);
  return [state, inst.setState] as [T[K], (arg: T[K]) => void];
}
