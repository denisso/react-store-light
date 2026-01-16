import React from 'react';
import { ErrorMessages, ErrorWithMessage } from './error';
import { IContext, IStoreApi } from '../types';

export function createGetStoreByContext<T extends object>(uniqId: {}) {
  return (Context?: React.Context<IContext> | null) => {
    if (!Context) {
      throw ErrorWithMessage(ErrorMessages['context']);
    }
    const context = React.useContext(Context) as IContext;
    const store = context.get(uniqId) as IStoreApi<T>;
    if (!store) {
      throw ErrorWithMessage(ErrorMessages['context']);
    }
    return store;
  };
}
