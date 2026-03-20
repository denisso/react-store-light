export type ValueListener = Function;

export type Listener<S extends object, K extends keyof S> = (
  value: S[K],
) => void;
