export const ErrorMessages = {
  context: 'useStoreState must be used within a StoreProvider.',
  storeUniqIdAlreadyExist: 'a store with this id already exists in the provider.',
  isNotAsync: "in the useSelectorAsync hook, only IAsync values can be used."
};

export const ErrorWithMessage = (message: string) => {
  return Error('react-store-light: ' + message);
};
