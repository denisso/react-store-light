import Light from 'react-store-light';
import { countersStore } from '../../app/index';
import { Counter } from '../counter';
import { Container } from '../../shared/ui/layout';

export const List = () => {
  const [counters] = Light.useState(countersStore, 'counters');
  return (
    <Container className='grid grid-cols-[repeat(4,max-content)] gap-4'>
      {counters.map((counter, indx) => (
        <Counter key={counter.id} counter={counter} indx={indx} />
      ))}
    </Container>
  );
};
