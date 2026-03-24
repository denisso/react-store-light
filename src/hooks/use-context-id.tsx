import React from 'react';
import type { IContext, IContextValueId } from '../types';
import { Context } from '../context';

export const useContextId = <T extends object>(
  contextValueId: IContextValueId<T>
) => {
  const context = React.useContext(Context) as IContext;
  if (!context) {
    throw new Error('Hook must be used inside Provider');
  }
  const value = context[contextValueId] as unknown as T;
  if (!value) {
    throw new Error('Value ID does not exist');
  }
  return value as T;
};

