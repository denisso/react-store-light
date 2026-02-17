import clsx from 'clsx';
import { FormItem } from '../../layout';

type InputProps = {
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const Input = ({ className, type, ...rest }: InputProps) => {
  return (
    <FormItem border>
      <input type={type} {...rest} className={clsx('px-3 outline-0', className)} />
    </FormItem>
  );
};
