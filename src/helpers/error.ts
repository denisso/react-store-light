const messages = {
  contextNotExist: (hook: string, key: string | null) =>
    `Hook ${hook}${key ? ' with key ' + key : ''} must be used within a React Provider.`,
  storeNotExist: (hook: string, key: string | null) =>
    `Problem in hook ${hook}${key ? ' with key ' + key : ''}, the storage does not exist in the React Provider.`,
  storeUniqIdAlreadyExist: () => 'A store with this id already exists in the provider.',
  isNotAsync: (key: string) => `Key ${key} is not type IAsync`,
};

type MessageFn = (...args: any[]) => string;
type MessageMap = Record<string, MessageFn>;
type ToErrorMap<T extends MessageMap> = {
  [K in keyof T]: (...args: Parameters<T[K]>) => Error;
};

const patch = <T extends MessageMap>(obj: T): ToErrorMap<T> => {
  const out = {} as ToErrorMap<T>;

  for (const key in obj) {
    const fn = obj[key];

    out[key] = ((...args: Parameters<typeof fn>) =>
      new Error('react-store-light: ' + fn(...args))) as ToErrorMap<T>[typeof key];
  }

  return out;
};

export const formatError = patch(messages);
