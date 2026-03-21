import Light from 'react-store-light';
import { countersStore } from '../../_app/index';
import { Counter } from '../counter';
import { Container } from '../../shared/ui/layout';

export const List = () => {
  const counters = Light.useState(countersStore, 'ids');
  return (
    <Container className='grid grid-cols-[repeat(4,max-content)] gap-4'>
      {counters.map((id) => (
        <Counter key={id} id={id} />
      ))}
    </Container>
  );
};
