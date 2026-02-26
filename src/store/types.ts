import { Value } from './value';

// Group unites listeners
export type ListenersGroup = symbol;
export type ValueListener = Function;

export type PreValues<S> = {
  [K in keyof S]: {
    path: string[];
    value: S[K];
  };
};

export type SetOptions = Partial<{
  groups: ListenersGroup[];
}>;

export type ListenerOptions = Partial<{
  isAutoCallListener: boolean;
  group: ListenersGroup;
}>;

/**
 * Listener signature for store updates.
 * Receives the key name and the new value.
 * template param 'S' is state of Store
 */
export type Listener<S extends object, K extends keyof S> = (
  name: K,
  value: S[K],
  options?: Omit<ListenerOptions, 'isAutoCallListener'>,
) => void;
