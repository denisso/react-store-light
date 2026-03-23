import { countersStore } from '../../_app/index';
import { Count } from './count';
import { Button } from '../../shared/ui/ctrls/button';
import { Container } from '../../shared/ui/layout';

export const Controls = () => {
  return (
    <Container className='flex flex-col gap-2 mt-2'>
      <Count />
      <Button onClick={countersStore.addCounter}>Add counter</Button>
      <Button onClick={countersStore.reverseCountersArray}>Reverse list</Button>
      <Button onClick={countersStore.setStateCountersPlusOne}>Set State counters +1</Button>
      <Button onClick={countersStore.setStateRewriteCountersRandom}>Create random counters</Button>
    </Container>
  );
};
