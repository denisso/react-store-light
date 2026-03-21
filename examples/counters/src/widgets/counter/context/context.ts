import Light from 'react-store-light';
import type { CountersStoreType } from '../../../entities/counter';

export const getAliases = (id: string) => {
  const p = Light.getPath<CountersStoreType>()('dict')(id);
  const aliases = {
    id: p('id'),
    count: p('count'),
  };
  return aliases;
};

export class CounterAlias extends Light.Aliases<ReturnType<typeof getAliases>>{}
export const counterId = Light.createContextId<CounterAlias>();
