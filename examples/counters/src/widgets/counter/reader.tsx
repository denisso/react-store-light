import Light from 'react-store-light';
import { counterAliasId } from './context';
import { Label } from '../../shared/ui/label';

export const CounterReader = () => {
  const [count] = Light.useState(counterAliasId, 'count');
  return <Label className='justify-start whitespace-nowrap'>Value: {count}</Label>;
};
