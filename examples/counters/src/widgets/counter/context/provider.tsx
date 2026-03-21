import React from 'react';
import Light from 'react-store-light';
import { counterId, getAliases } from './context';
import { countersStore } from '../../../_app';

type Props = { children: React.ReactNode; id: string };

export const CounterProvider = ({ children, id }: Props) => {
  const [aliases] = React.useState(() => {
    return new Light.Aliases(getAliases(id), countersStore.getState());
  });

  return <Light.Provider value={{ [counterId]: aliases }}>{children}</Light.Provider>;
};
