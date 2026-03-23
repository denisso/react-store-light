import { Store } from '../store';

export type UnwrapGetPath<T> = T extends GetPath<infer U> ? U : never;
export type GetPath<T> = (T extends object
  ? {
      <K extends keyof T>(key: K): GetPath<T[K]>;
      (): string[];
    }
  : () => string[]) & {
  __type?: T;
};

export const getPath = <T extends object>(
  store: Store<T> | null = null,
  currentPath: string[] = [],
): GetPath<T> => {
  const fn = ((key?: PropertyKey) => {
    if (key === undefined) {
      return currentPath;
    }
    return getPath(store, [...currentPath, String(key)]);
  }) as GetPath<T>;
  return fn;
};

export type UnwrapGetPathStore<T> = T extends GetPathWithState<infer U> ? U : never;

export type GetPathWithState<T> = (T extends object
  ? {
      <K extends keyof T>(key: K): GetPathWithState<T[K]>;
      (): { path: string[]; store: Store<any> };
    }
  : () => { path: string[]; store: Store<any> }) & {
  __type?: T;
};

export const getPathWithStore = <T extends object>(
  store: Store<T>,
  currentPath: string[] = [],
): GetPathWithState<T> => {
  const fn = ((key?: PropertyKey) => {
    if (key === undefined) {
      return { path: currentPath, store };
    }
    return getPathWithStore(store, [...currentPath, String(key)]);
  }) as GetPathWithState<T>;
  return fn;
};
