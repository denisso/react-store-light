import { CountersList } from './widgets/counters-list';
import { Container } from './shared/ui/layout';
import { Controls } from './widgets/controls';
function App() {
  return (
    <Container className='flex gap-4 justify-between'>
      <CountersList />
      <Controls/>
      <CountersList />
    </Container>
  );
}

export default App;
