import { FormItem } from '../layout';

type Props = { children: React.ReactNode; border?: boolean; className?: string };

export const Label = ({ children, className, border }: Props) => {
  return (
    <FormItem className={className} border={border}>
      {children}
    </FormItem>
  );
};
