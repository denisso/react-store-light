import Light from 'react-store-light';
import { counterId } from './context';
import { Label } from '../../shared/ui/label';

export const CounterReader = () => {
  const counterAliase = Light.useContextId(counterId)
  const count = Light.useState(counterAliase, 'count');
  return <Label className='justify-start whitespace-nowrap'>Value: {count}</Label>;
};
