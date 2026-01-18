export const ErrorMessages = {
  context: 'useStoreByContext must be used within a Store Provider.',
  storeUniqIdAlreadyExist: 'a store with this id already exists in the provider.',
  isNotAsync: "in the useAsync hook, only IAsync values can be used."
};

export const ErrorWithMessage = (message: string) => {
  return Error('react-store-light: ' + message);
};
