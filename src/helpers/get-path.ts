import { Store } from '../store';

export type UnwrapPath<T> = T extends CreatePath<infer U> ? U : never;
export type CreatePath<T> = (T extends object
  ? {
      <K extends keyof T>(key: K): CreatePath<T[K]>;
      (): string[];
    }
  : () => string[]) & {
  __type?: T;
};

export const createPath = <T extends object>(
  store: Store<T> | null = null,
  currentPath: string[] = [],
): CreatePath<T> => {
  const fn = ((key?: PropertyKey) => {
    if (key === undefined) {
      return currentPath;
    }
    return createPath(store, [...currentPath, String(key)]);
  }) as CreatePath<T>;
  return fn;
};

export type UnwrapAlias<T> = T extends CreateAlias<infer U> ? U : never;

export type CreateAlias<T> = (T extends object
  ? {
      <K extends keyof T>(key: K): CreateAlias<T[K]>;
      (): { path: string[]; store: Store<any> };
    }
  : () => { path: string[]; store: Store<any> }) & {
  __type?: T;
};

export const createAlias = <T extends object>(
  store: Store<T>,
  currentPath: string[] = [],
): CreateAlias<T> => {
  const fn = ((key?: PropertyKey) => {
    if (key === undefined) {
      return { path: currentPath, store };
    }
    return createAlias(store, [...currentPath, String(key)]);
  }) as CreateAlias<T>;
  return fn;
};
