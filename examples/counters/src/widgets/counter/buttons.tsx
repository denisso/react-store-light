import Light from 'react-store-light';
import { counterId } from './context';
import { countersStore } from '../../_app/index';
import { Button } from '../../shared/ui/ctrls/button';

export const CounterButtons = () => {
  const store = Light.useContextId(counterId);

  return (
    <div className='flex gap-4'>
      <Button onClick={() => countersStore.deleteCounterById(store.get('id'))}>Delete</Button>
      <Button onClick={() => countersStore.copyCounterByValue(store.get('count'))}>Copy</Button>
    </div>
  );
};
