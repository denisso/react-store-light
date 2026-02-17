import { CounterProvider } from './context/provider';
import { CounterReader } from './reader';
import { CouterWritter } from './writter';
import { CounterButtons } from './buttons';
import type { Counter as TypeCounter } from '../../entities/counter';

import { CounterName } from './name';

type Props = { counter: TypeCounter; indx: number };

export const Counter = ({ counter, indx }: Props) => {
  return (
    <CounterProvider counter={counter} indx={indx}>
      <CounterName />
      <CouterWritter />
      <CounterReader />
      <CounterButtons />
    </CounterProvider>
  );
};
