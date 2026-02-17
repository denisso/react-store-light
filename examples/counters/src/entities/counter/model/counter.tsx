import Light from 'react-store-light';
import { getNextId } from './helpers/get-next-id';

const id = [0];

export type Counter = { count: number; id: string };
export type Counters = { counters: Counter[] };

export const changeCounter = (store: Light.Store<Counter>, arg: '+' | '-') => {
  if (arg == '+') {
    store.set('count', store.get('count') + 1);
  } else {
    store.set('count', store.get('count') - 1);
  }
};

export class CountersStore extends Light.Store<Counters> {
  constructor(state: Counters) {
    super(state);
    this.addCounter = this.addCounter.bind(this);
    this.deleteCounterById = this.deleteCounterById.bind(this);
    this.reverseCountersArray = this.reverseCountersArray.bind(this);
    this.copyCounterByValue = this.copyCounterByValue.bind(this);
    this.deepRewrite = this.deepRewrite.bind(this);
  }
  addCounter() {
    const counters = this.get('counters');
    counters.push({ count: 0, id: getNextId(id) });
    this.set('counters', counters.slice());
  }
  deleteCounterById(id: string) {
    this.set(
      'counters',
      this.get('counters').filter((item) => item.id != id),
    );
  }
  reverseCountersArray() {
    this.set('counters', this.get('counters').reverse().slice());
  }
  copyCounterByValue(count: number) {
    const counters = this.get('counters');
    this.set('counters', [...counters, { id: getNextId(id), count }]);
  }
  deepRewrite() {
    this.set(
      'counters',
      this.get('counters').map((counter) => {
        return { id: counter.id, count: counter.count + 1 };
      }),
    );
  }
}
