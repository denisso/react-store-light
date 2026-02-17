import type { ReactNode } from 'react';
import clsx from 'clsx';

type Props = {
  children: ReactNode;
  className?: string;
  border?: boolean;
};

const Wrapper = ({ children, className, border }: Props) => {
  return (
    <div
      className={clsx(className, {
        'border-solid border border-black': border,
      })}
    >
      {children}
    </div>
  );
};

export const FormItem = ({ children, className, border, ...rest }: Props) => {
  return (
    <Wrapper className={clsx('flex items-center justify-center rounded-sm h-8 gap-2 overflow-hidden', className)} border={border} {...rest}>
      {children}
    </Wrapper>
  );
};

export const Container = ({ children, className, ...rest }: Props) => {
  return (
    <Wrapper className={clsx(className, 'rounded-lg p-1 gap-4')} {...rest}>
      {children}
    </Wrapper>
  );
};
