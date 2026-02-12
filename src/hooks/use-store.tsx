import type { IContextValueId } from '../types';
import { Store } from '../store';
import { useById } from '../hub/use-get-by-id';

export function useStore<T extends object, S extends Store<T> = Store<T>>(
  contextValueId: IContextValueId<Store<T>>,
): S {
  return useById<Store<T>>(contextValueId) as S;
}

