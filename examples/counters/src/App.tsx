import { CountersList } from './widgets/counters-list';
import { Container } from './shared/ui/layout';
function App() {
  return (
    <Container className='flex gap-4 justify-between'>
      <CountersList />
      <CountersList />
    </Container>
  );
}

export default App;
