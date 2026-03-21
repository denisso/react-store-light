import Light from 'react-store-light';
import { getNextId } from './helpers/get-next-id';
import { CounterAlias } from '../../../widgets/counter/context/context';
const nextId = ((ids: number[]) => {
  return () => getNextId(ids);
})([0]);
export type Counter = { count: number; id: string };
export type CountersStoreType = { dict: Record<string, Counter>; ids: string[] };

export const changeCounter = (counter: CounterAlias, arg: '+' | '-') => {
  if (arg == '+') {
    counter.set('count', counter.get('count') + 1);
  } else {
    counter.set('count', counter.get('count') - 1);
  }
};

export class CountersStore extends Light.Store<CountersStoreType> {
  constructor(state: CountersStoreType) {
    super(state);
    this.addCounter = this.addCounter.bind(this);
    this.deleteCounterById = this.deleteCounterById.bind(this);
    this.reverseCountersArray = this.reverseCountersArray.bind(this);
    this.copyCounterByValue = this.copyCounterByValue.bind(this);
    this.deepRewrite = this.deepRewrite.bind(this);
  }
  addCounter() {
    const id = nextId();
    this.set('ids', [...this.get('ids'), id]);
    const dict = this.get('dict');
    dict[id] = { count: 0, id };
  }
  deleteCounterById(id: string) {
    this.set(
      'ids',
      this.get('ids')
        .filter((e) => e !== id)
        .slice(),
    );
    const dict = this.get('dict');
    delete dict[id];
  }
  reverseCountersArray() {
    this.set('ids', this.get('ids').reverse().slice());
  }
  copyCounterByValue(count: number) {
    const id = nextId();
    this.set('ids', [...this.get('ids'), id]);
    const dict = this.get('dict');
    dict[id] = { count, id };
  }
  deepRewrite() {
    const dict = this.getValues()['dict'];
    for (const key of Object.keys(dict)) {
      dict[key].count++;
    }
    this.setValues(structuredClone(this.getValues()));
  }
}
