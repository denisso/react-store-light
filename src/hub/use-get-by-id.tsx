import React from 'react';
import type { IContext, IContextValueId } from '../types';
import { formatError } from '../helpers/error';

export const createGetById = <T extends any>(
  Context: React.Context<IContext>,
  constextValueId: IContextValueId,
) => {
  return () => {
    if (!Context) {
      throw formatError['contextIsEmpty']();
    }
    const context = React.useContext(Context) as IContext;
    if (!context) {
      throw formatError['hookMustBeInsideProvider']();
    }
    const value = context.get(constextValueId) as unknown as T;
    if (!value) {
      throw formatError['valueIDNotExist'](constextValueId);
    }
    return value as T;
  };
};
