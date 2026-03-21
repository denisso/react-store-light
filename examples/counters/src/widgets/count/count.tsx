import Light from 'react-store-light';
import { countersStore } from '../../_app';
import { Label } from '../../shared/ui/label';

export const Count = () => {
  const counters = Light.useState(countersStore, 'ids');

  return <Label border={true} className={'p-4 mt-2'}>Number counters: {counters.length}</Label>;
};
