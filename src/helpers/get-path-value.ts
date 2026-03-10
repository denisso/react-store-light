export type GetPath<T> =
  (T extends object
    ? {
        <K extends keyof T>(key: K): GetPath<T[K]>;
        (): string[];
      }
    : () => string[]) & {
      __type?: T;
    };

export const getPath = <T extends object>(currentPath: string[] = []): GetPath<T> => {
  const fn = ((key?: PropertyKey) => {
    if (key === undefined) {
      return currentPath;
    }
    return getPath([...currentPath, String(key)]);
  }) as GetPath<T>;
  return fn;
};


