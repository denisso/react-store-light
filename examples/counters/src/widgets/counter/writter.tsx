import React from 'react';
import Light from 'react-store-light';
import { couterStoreId } from './context';
import { changeCounter } from '../../entities/counter';
import { Input } from '../../shared/ui/ctrls/input/';
import { Button } from '../../shared/ui/ctrls/button';

export const CouterWritter = () => {
  const store = Light.useStore(couterStoreId);
  const [count, setCount] = Light.useState(store, 'count');

  return (
    <div className='gap-4 flex'>
      <Button onClick={() => changeCounter(store, '+')}>+</Button>
      <Input
        type='number'
        value={count}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCount(+e.target.value)}
      />
      <Button onClick={() => changeCounter(store, '-')}>-</Button>
    </div>
  );
};
