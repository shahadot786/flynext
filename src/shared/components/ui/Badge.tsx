import { cn } from '@/shared/utils/cn';
import type { ReactNode } from 'react';

const variantStyles = {
  success: 'bg-green-50 text-green-700',
  warning: 'bg-amber-50 text-amber-700',
  neutral: 'bg-gray-100 text-gray-700',
  info: 'bg-primary-50 text-primary-700',
} as const;

const sizeStyles = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-0.5',
} as const;

type BadgeProps = {
  variant: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
  children: ReactNode;
  className?: string;
};

export function Badge({ variant, size = 'sm', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
