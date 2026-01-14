import React from 'react';
import { ErrorMessages, ErrorWithMessage } from './error';
import { IContext, IStoreApi } from '../types';

export function getStoreByContextFactory<T extends object>(uniqId: {}) {
  return (Context: React.Context<IContext>) => {
    const context = React.useContext(Context) as IContext;
    const store = context.get(uniqId) as IStoreApi<T>;
    if (store === undefined) {
      throw ErrorWithMessage(ErrorMessages['context']);
    }
    return store;
  };
}
