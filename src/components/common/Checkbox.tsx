import React, { useCallback } from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Checkbox Component
 *
 * A custom styled checkbox with optional label.
 * Supports keyboard navigation (Space key to toggle).
 *
 * Design specs:
 * - Unchecked: 14x14, border 2px #D4D4D4, radius 3px, bg transparent
 * - Checked: 14x14, bg #18181B, radius 3px, checkmark white (10x10)
 * - Hover (unchecked): border-color #A1A1AA
 * - Disabled: opacity 0.5, cursor not-allowed
 * - With label: gap 8px, label 13px/normal #18181B
 */
export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
}) => {
  const handleClick = useCallback(() => {
    if (!disabled) {
      onChange(!checked);
    }
  }, [checked, disabled, onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!disabled) {
          onChange(!checked);
        }
      }
    },
    [checked, disabled, onChange]
  );

  return (
    <label
      className={`
        inline-flex items-center gap-2
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `.trim()}
    >
      {/* Checkbox Box */}
      <div
        role="checkbox"
        aria-checked={checked}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={`
          relative flex items-center justify-center
          w-[14px] h-[14px]
          rounded-[3px]
          transition-all duration-150
          focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#18181B]/30
          ${
            checked
              ? 'bg-[#18181B] border-transparent'
              : `bg-transparent border-2 border-[#D4D4D4] ${
                  !disabled ? 'hover:border-[#A1A1AA]' : ''
                }`
          }
        `.trim()}
      >
        {/* Checkmark Icon - only shown when checked */}
        {checked && (
          <Check
            className="w-[10px] h-[10px] text-white"
            strokeWidth={3}
          />
        )}
      </div>

      {/* Optional Label */}
      {label && (
        <span className="text-[13px] font-normal text-[#18181B] select-none">
          {label}
        </span>
      )}
    </label>
  );
};

export default Checkbox;
