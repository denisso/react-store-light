import React from 'react';
import Light from 'react-store-light';
import type { Counter } from '../../../entities/counter';
import { counterHub, couterStoreId } from './context';

type Props = { children: React.ReactNode; counter: Counter; indx: number };

export const CounterProvider = ({ children, counter }: Props) => {
  const counterStore = Light.useCreateHubStore(counter, counterHub);

  return <Light.Provider value={{ [couterStoreId]: counterStore }}>{children}</Light.Provider>;
};
