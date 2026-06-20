'use client';

import { useEffect, useRef, useCallback, type ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
};

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDialogElement>) => {
      // Close when clicking on the dialog backdrop (outside the content panel)
      if (event.target === dialogRef.current) {
        onClose();
      }
    },
    [onClose],
  );

  const handleCancel = useCallback(
    (event: React.SyntheticEvent<HTMLDialogElement>) => {
      // Prevent default dialog close and route through our onClose handler
      event.preventDefault();
      onClose();
    },
    [onClose],
  );

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      onCancel={handleCancel}
      className={cn(
        'fixed inset-0 m-auto max-w-lg w-full p-0',
        'bg-transparent backdrop:bg-black/50',
        'open:animate-fade-in',
      )}
    >
      <div
        className={cn(
          'bg-white rounded-2xl p-6 shadow-xl',
          className,
        )}
      >
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          )}

          <button
            type="button"
            onClick={onClose}
            className={cn(
              'ml-auto inline-flex items-center justify-center rounded-lg p-1.5',
              'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
              'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
            )}
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {children}
      </div>
    </dialog>
  );
}
