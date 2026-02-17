import clsx from 'clsx';
import { FormItem } from '../../layout';

type ButtonProps = {
  children: React.ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = ({ children, className, ...rest }: ButtonProps) => {
  return (
    <button {...rest} className='block'>
      <FormItem
        className={clsx(
          'px-3 select-none p-0',
          'hover:bg-gray-400 active:bg-transparent',
          className,
        )}
        border
      >
        {children}
      </FormItem>
    </button>
  );
};
