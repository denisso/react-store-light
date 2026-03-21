import { CounterProvider } from './context/provider';
import { CounterReader } from './reader';
import { CouterWritter } from './writter';
import { CounterButtons } from './buttons';


import { CounterName } from './name';

type Props = { id: string };

export const Counter = ({ id }: Props) => {
  return (
    <CounterProvider id={id}>
      <CounterName />
      <CouterWritter />
      <CounterReader />
      <CounterButtons />
    </CounterProvider>
  );
};
