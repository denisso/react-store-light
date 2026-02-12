import type { IContextValueId } from '../types';
import { Store } from '../store';
import { useById } from '../hub/use-get-by-id';

export function useStore<S extends Store<any>>(
  contextValueId: IContextValueId<S>,
): S {
  return useById<Store<S>>(contextValueId) as S;
}

