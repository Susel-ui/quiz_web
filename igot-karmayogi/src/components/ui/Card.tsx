import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'bordered';
  padding?:  'none' | 'sm' | 'md' | 'lg';
  hover?:    boolean;
}

const variantClasses = {
  default:  'bg-white dark:bg-surface-dark-card shadow-card-sm border border-surface-border dark:border-surface-dark-border',
  glass:    'glass-card',
  bordered: 'bg-white dark:bg-surface-dark-card border-2 border-primary-100 dark:border-primary-900',
};

const paddingClasses = {
  none: '',
  sm:   'p-3',
  md:   'p-5',
  lg:   'p-7',
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', hover, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-xl',
        variantClasses[variant],
        paddingClasses[padding],
        hover && 'transition-shadow duration-200 hover:shadow-card-lg cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);

Card.displayName = 'Card';

// Compositional sub-components
export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center justify-between mb-4', className)} {...props} />;
}
export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-heading-3 text-slate-800 dark:text-slate-100', className)} {...props} />;
}
export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('', className)} {...props} />;
}

export default Card;
