import { countersStore } from '../../app/index';
import { Button } from '../../shared/ui/ctrls/button';
import { Container } from '../../shared/ui/layout';

export const Buttons = () => {

  return (
    <Container className='flex gap-2'>
      <Button onClick={countersStore.addCounter}>Add counter</Button>
      <Button onClick={countersStore.reverseCountersArray}>Reverse list</Button>
      <Button onClick={countersStore.deepRewrite}>Deep rewrite list and +1</Button>
    </Container>
  );
};
