import React, { forwardRef } from 'react';

// ============================================================================
// Input Component
// ============================================================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-[13px] font-medium text-[#18181B]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            h-10
            rounded-md
            border
            border-[#E5E5E5]
            bg-white
            px-3
            text-[13px]
            text-[#18181B]
            placeholder:text-[12px]
            placeholder:text-[#A1A1AA]
            focus:border-[#18181B]
            focus:outline-none
            disabled:cursor-not-allowed
            disabled:bg-[#FAFAFA]
            disabled:text-[#A1A1AA]
            ${error ? 'border-[#DC2626] focus:border-[#DC2626]' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <span className="text-[12px] text-[#DC2626]">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ============================================================================
// Textarea Component
// ============================================================================

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-[13px] font-medium text-[#18181B]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            min-h-20
            rounded-md
            border
            border-[#E5E5E5]
            bg-white
            p-3
            text-[13px]
            text-[#18181B]
            placeholder:text-[12px]
            placeholder:text-[#A1A1AA]
            focus:border-[#18181B]
            focus:outline-none
            resize-y
            disabled:cursor-not-allowed
            disabled:bg-[#FAFAFA]
            disabled:text-[#A1A1AA]
            ${error ? 'border-[#DC2626] focus:border-[#DC2626]' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <span className="text-[12px] text-[#DC2626]">{error}</span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
