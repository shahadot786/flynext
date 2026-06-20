"use client";

import { useState, useEffect } from "react";
import { cn } from "@/shared/utils/cn";
import { SearchForm } from "@/features/search";

type ModifySearchTopSheetProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ModifySearchTopSheet({
  isOpen,
  onClose,
}: ModifySearchTopSheetProps) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen && !isClosing) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, isClosing]);

  if (!isOpen) return null;

  const triggerClose = () => {
    setIsClosing(true);
  };

  const handleAnimationEnd = () => {
    if (isClosing) {
      onClose();
      setIsClosing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-200 flex flex-col justify-start">
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/55 transition-opacity duration-300",
          isClosing ? "animate-fade-out" : "animate-fade-in",
        )}
        onClick={triggerClose}
      />

      {/* Top Sheet Panel */}
      <div
        onAnimationEnd={handleAnimationEnd}
        className={cn(
          "relative w-full bg-slate-50 border-b border-slate-200 shadow-2xl flex flex-col max-h-[88vh] lg:max-h-none z-10 overflow-y-auto lg:overflow-y-visible custom-scrollbar p-5 pt-4 pb-8",
          isClosing ? "animate-slide-up-top" : "animate-slide-down-top",
        )}
      >
        {/* Header */}
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
          <h3 className="text-base font-black text-slate-800">
            Modify Your Search
          </h3>
          <button
            type="button"
            onClick={triggerClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-250/50 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
            aria-label="Close panel"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content Wrapper */}
        <div className="max-w-4xl mx-auto w-full">
          <SearchForm
            className="shadow-none border-0 p-0 bg-transparent"
            onSubmitSuccess={triggerClose}
          />
        </div>
      </div>
    </div>
  );
}
