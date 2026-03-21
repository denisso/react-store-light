import { CountersList } from './widgets/counters-list';
import { Container } from './shared/ui/layout';
import { Count } from './widgets/count';
function App() {
  return (
    <Container className='flex gap-4 justify-between'>
      <CountersList />
      <Count/>
      <CountersList />
    </Container>
  );
}

export default App;
