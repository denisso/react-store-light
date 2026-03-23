import Light from 'react-store-light';
import { countersStore } from '../../_app';
import { Label } from '../../shared/ui/label';

export const Count = () => {
  const [counters] = Light.useState(countersStore, 'ids');

  return <Label className={'p-4'}>Number counters: {counters.length}</Label>;
};
