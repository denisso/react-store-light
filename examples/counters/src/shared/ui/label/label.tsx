import { FormItem } from '../layout';

type Props = { children: React.ReactNode; className?: string };

export const Label = ({ children, className }: Props) => {
  return <FormItem className={className}>{children}</FormItem>;
};
