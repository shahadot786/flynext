'use client';

import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';
import { Spinner } from '@/shared/components/ui/Spinner';

const variantStyles = {
  primary:
    'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700',
  secondary:
    'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300',
  ghost:
    'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200',
  danger:
    'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
} as const;

const sizeStyles = {
  sm: 'h-8 px-3 text-sm rounded-lg',
  md: 'h-10 px-4 text-sm rounded-lg',
  lg: 'h-12 px-6 text-base rounded-xl',
} as const;

const spinnerSizeMap = {
  sm: 'sm',
  md: 'sm',
  lg: 'md',
} as const;

type ButtonProps = {
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
  isLoading?: boolean;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<'button'>, 'children' | 'className'>;

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        variantStyles[variant],
        sizeStyles[size],
        isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className,
      )}
      {...rest}
    >
      {isLoading && <Spinner size={spinnerSizeMap[size]} />}
      {children}
    </button>
  );
}
