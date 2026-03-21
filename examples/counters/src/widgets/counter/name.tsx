import Light from 'react-store-light';
import { counterId } from './context';
import { Label } from '../../shared/ui/label';

export const CounterName = () => {
  const counterAliase = Light.useContextId(counterId)
  const id = Light.useState(counterAliase, 'id');
  return <Label className='whitespace-nowrap'>Counter {id}</Label>;
};
