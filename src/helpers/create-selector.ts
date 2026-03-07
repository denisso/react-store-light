type DeepGetter<T> = (<K extends keyof T>(key: K) => DeepGetter<T[K]>) & (() => string[]);

export const getPath = <T extends object>(obj: T, currentPath: string[] = []): DeepGetter<T> => {
  const fn = ((key?: PropertyKey) => {
    if (key === undefined) {
      return currentPath;
    }

    return getPath((obj as any)[key], [...currentPath, String(key)]);
  }) as DeepGetter<T>;

  return fn;
};
export const createSelector = <T extends object>(object: T, cb: (fn: DeepGetter<T>) => string[]) => {
  return cb(getPath(object));
};