import type { IContextValueId } from '../types';
import { AbstractStore } from '../store';
import { useById } from '../hub/use-get-by-id';

export function useStore<S extends AbstractStore>(
  contextValueId: IContextValueId<S>,
): S {
  return useById<AbstractStore>(contextValueId) as S;
}

