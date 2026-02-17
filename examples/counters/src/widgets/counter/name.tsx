import Light from 'react-store-light';
import { couterStoreId } from './context';
import { Label } from '../../shared/ui/label';

export const CounterName = () => {
  const [id] = Light.useState(couterStoreId, 'id');
  return <Label className='whitespace-nowrap'>Counter {id}</Label>;
};
