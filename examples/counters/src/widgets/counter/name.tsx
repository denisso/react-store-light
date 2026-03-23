import Light from 'react-store-light';
import { counterAliasId } from './context';
import { Label } from '../../shared/ui/label';

export const CounterName = () => {
  const [id] = Light.useState(counterAliasId, 'id');
  return <Label className='whitespace-nowrap'>Counter {id}</Label>;
};
