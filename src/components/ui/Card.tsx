import { type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-white p-5 shadow-sm',
        'dark:border-navy-600 dark:bg-navy-800',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
