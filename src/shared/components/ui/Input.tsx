'use client';

import { forwardRef, useId, type ComponentPropsWithoutRef } from 'react';
import { cn } from '@/shared/utils/cn';

type InputProps = {
  label?: string;
  error?: string;
  helperText?: string;
  className?: string;
} & Omit<ComponentPropsWithoutRef<'input'>, 'className'>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ label, error, helperText, className, id, ...rest }, ref) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    return (
      <div className={cn('flex flex-col', className)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            [errorId, helperId].filter(Boolean).join(' ') || undefined
          }
          className={cn(
            'h-11 w-full rounded-lg border px-3 text-sm text-gray-900 placeholder:text-gray-400',
            'transition-colors outline-none',
            'focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-200',
          )}
          {...rest}
        />

        {error && (
          <p id={errorId} className="text-sm text-red-500 mt-1" role="alert">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p id={helperId} className="text-sm text-gray-500 mt-1">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);
