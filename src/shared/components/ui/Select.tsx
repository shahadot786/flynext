'use client';

import { forwardRef, useId, type ComponentPropsWithoutRef } from 'react';
import { cn } from '@/shared/utils/cn';

type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
} & Omit<ComponentPropsWithoutRef<'select'>, 'className'>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    { label, error, options, placeholder, className, id, ...rest },
    ref,
  ) {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const errorId = error ? `${selectId}-error` : undefined;

    return (
      <div className={cn('flex flex-col', className)}>
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}

        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={cn(
            'h-11 w-full rounded-lg border px-3 text-sm text-gray-900',
            'appearance-none bg-white bg-no-repeat',
            'transition-colors outline-none',
            'focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-200',
          )}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
            backgroundPosition: 'right 0.75rem center',
          }}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {error && (
          <p id={errorId} className="text-sm text-red-500 mt-1" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);
