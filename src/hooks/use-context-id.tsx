import React from 'react';
import type { IContext, IContextValueId } from '../types';
import { Context } from '../context';

export const useContextId = <T extends object>(
  constextValueId: IContextValueId<T>
) => {
  const context = React.useContext(Context) as IContext;
  if (!context) {
    throw new Error('hook Must Be Inside Provider');
  }
  const value = context[constextValueId] as unknown as T;
  if (!value) {
    throw new Error('value Id Not Exist');
  }
  return value as T;
};

