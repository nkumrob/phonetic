'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles = cn(
      // Base button styles
      'inline-flex items-center justify-center',
      'font-semibold transition-all duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none',
      'rounded-xl' // 16px radius
    );

    const variantStyles = {
      primary: cn(
        'bg-primary text-primary-foreground',
        'border-2 border-primary',
        'hover:transform hover:-translate-y-px hover:shadow-lg',
        'active:translate-y-0 active:shadow-md'
      ),
      secondary: cn(
        'bg-transparent text-primary',
        'border-2 border-primary',
        'hover:bg-primary hover:text-primary-foreground',
        'hover:transform hover:-translate-y-px hover:shadow-md',
        'active:translate-y-0 active:shadow'
      ),
      ghost: cn(
        'text-foreground',
        'hover:bg-muted'
      ),
      link: cn(
        'text-primary underline-offset-4',
        'hover:underline'
      ),
    };

    const sizeStyles = {
      sm: cn('h-8 px-4 text-sm', 'tracking-wide'),
      md: cn('h-10 px-6 text-base', 'tracking-bodyText'),
      lg: cn('h-12 px-8 text-lg', 'tracking-bodyText'),
      xl: cn('h-14 px-10 text-xl font-bold', 'tracking-largeText'),
    };

    return (
      <button
        className={cn(
          baseStyles,
          variantStyles[variant],
          variant !== 'link' && sizeStyles[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };