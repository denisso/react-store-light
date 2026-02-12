import React from 'react';
import type { IContext, IContextValueId } from '../types';
import { formatError } from '../helpers/error';
import { Context } from '../context';

export const useById = <T extends object>(constextValueId: IContextValueId<T>) => {
  const context = React.useContext(Context) as IContext;
  if (!context) {
    throw formatError['hookMustBeInsideProvider']();
  }
  const value = context[constextValueId] as unknown as T;
  if (!value) {
    throw formatError['valueIdNotExist']();
  }
  return value as T;
};
