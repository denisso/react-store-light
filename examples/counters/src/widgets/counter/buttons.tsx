import Light from 'react-store-light';
import { couterStoreId } from './context';
import { countersStore } from '../../app/index';
import { Button } from '../../shared/ui/ctrls/button';

export const CounterButtons = () => {
  const store = Light.useStore(couterStoreId);

  return (
    <div className='flex gap-4'>
      <Button onClick={() => countersStore.deleteCounterById(store.get('id'))}>Delete</Button>
      <Button onClick={() => countersStore.copyCounterByValue(store.get('count'))}>Copy</Button>
    </div>
  );
};
