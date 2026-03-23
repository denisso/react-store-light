import Light from 'react-store-light';
import { counterAliasId } from './context';
import { countersStore } from '../../_app/index';
import { Button } from '../../shared/ui/ctrls/button';

export const CounterButtons = () => {
  const counterAlias = Light.useContextId(counterAliasId);

  return (
    <div className='flex gap-4'>
      <Button onClick={() => countersStore.deleteCounterById(counterAlias.get('id'))}>
        Delete
      </Button>
      <Button onClick={() => countersStore.copyCounterByValue(counterAlias.get('count'))}>
        Copy
      </Button>
    </div>
  );
};
