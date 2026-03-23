import React from 'react';
import Light from 'react-store-light';
import { counterAliasId, createAliases } from './context';
import { countersStore } from '../../../_app';

type Props = { children: React.ReactNode; id: string };

export const CounterProvider = ({ children, id }: Props) => {
  const [aliases] = React.useState(() => {
    return new Light.Aliases(createAliases(id, countersStore));
  });

  return <Light.Provider value={{ [counterAliasId]: aliases }}>{children}</Light.Provider>;
};
