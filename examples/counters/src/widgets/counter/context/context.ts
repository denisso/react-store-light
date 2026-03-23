import Light from 'react-store-light';
import { CountersStore } from '../../../entities/counter';

export const createAliases = (id: string, store: CountersStore) => {
  const p = Light.createAlias(store)('dict')(id);
  const aliases = {
    id: p('id'),
    count: p('count'),
  };
  return aliases;
};

export class CounterAlias extends Light.Aliases<ReturnType<typeof createAliases>> {}
export const counterAliasId = Light.createContextId<CounterAlias>();
