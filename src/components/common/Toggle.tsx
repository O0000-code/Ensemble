import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: 'large' | 'medium' | 'small';
  disabled?: boolean;
}

// Size configurations based on design spec
const sizeConfig = {
  large: {
    track: 'w-[44px] h-[24px] rounded-[12px]',
    knob: 'w-[20px] h-[20px] rounded-[10px]',
    translate: 'translate-x-[20px]',
  },
  medium: {
    track: 'w-[40px] h-[22px] rounded-[11px]',
    knob: 'w-[18px] h-[18px] rounded-[9px]',
    translate: 'translate-x-[18px]',
  },
  small: {
    track: 'w-[36px] h-[20px] rounded-[10px]',
    knob: 'w-[16px] h-[16px] rounded-[8px]',
    translate: 'translate-x-[16px]',
  },
};

export default function Toggle({
  checked,
  onChange,
  size = 'medium',
  disabled = false,
}: ToggleProps) {
  const config = sizeConfig[size];

  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled) {
        onChange(!checked);
      }
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        ${config.track}
        p-[2px]
        transition-colors
        duration-150
        ease-out
        flex
        items-center
        ${checked ? 'bg-[#18181B]' : 'bg-[#E4E4E7]'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-offset-2
        focus-visible:ring-[#18181B]
      `}
    >
      <span
        className={`
          ${config.knob}
          bg-white
          shadow-sm
          transition-transform
          duration-150
          ease-out
          ${checked ? config.translate : 'translate-x-0'}
        `}
      />
    </button>
  );
}
