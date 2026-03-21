import React from 'react';
import Light from 'react-store-light';
import { counterId } from './context';
import { changeCounter } from '../../entities/counter';
import { Input } from '../../shared/ui/ctrls/input/';
import { Button } from '../../shared/ui/ctrls/button';

export const CouterWritter = () => {
  const counter = Light.useContextId(counterId)

  const count = Light.useState(counter, 'count');

  return (
    <div className='gap-4 flex'>
      <Button onClick={() => changeCounter(counter, '+')}>+</Button>
      <Input
        type='number'
        value={count}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => counter.set("count", +e.target.value)}
      />
      <Button onClick={() => changeCounter(counter, '-')}>-</Button>
    </div>
  );
};
