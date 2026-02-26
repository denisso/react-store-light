type DeepGetter<T> = (<K extends keyof T>(key: K) => DeepGetter<T[K]>) &
  (() => { value: T; path: string[] });
  
export const createStateValue = <T>(obj: T, currentPath: string[] = []): DeepGetter<T> => {
  const fn = ((key?: PropertyKey) => {
    if (key === undefined) {
      return {
        value: obj,
        path: currentPath,
      };
    }

    return createStateValue((obj as any)[key], [...currentPath, String(key)]);
  }) as DeepGetter<T>;

  return fn;
};

