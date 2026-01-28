import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  iconOnly?: boolean;
  loading?: boolean;
}

// Size configurations based on design spec
const sizeConfig = {
  small: {
    height: 'h-[32px]',
    padding: 'px-3', // 12px
    paddingIconOnly: 'p-0 w-[32px]',
    radius: 'rounded-[6px]',
    iconSize: 'w-[14px] h-[14px]',
    gap: 'gap-1.5', // 6px
  },
  medium: {
    height: 'h-[40px]',
    padding: 'px-3.5', // 14px
    paddingIconOnly: 'p-0 w-[36px]',
    radius: 'rounded-[6px]',
    iconSize: 'w-[14px] h-[14px]',
    gap: 'gap-1.5', // 6px
  },
  large: {
    height: 'h-[44px]',
    padding: 'px-3.5', // 14px
    paddingIconOnly: 'p-0 w-[44px]',
    radius: 'rounded-[8px]',
    iconSize: 'w-[16px] h-[16px]',
    gap: 'gap-2', // 8px
  },
};

// Variant styles based on design spec
const variantStyles = {
  primary: {
    base: 'bg-[#18181B] text-white border-transparent',
    hover: 'hover:bg-[#27272A]',
    disabled: 'disabled:bg-[#18181B]/50',
  },
  secondary: {
    base: 'bg-transparent text-[#71717A] border border-[#E5E5E5]',
    hover: 'hover:bg-[#FAFAFA]',
    disabled: 'disabled:opacity-50',
  },
  danger: {
    base: 'bg-transparent text-[#DC2626] border border-[#FEE2E2]',
    hover: 'hover:bg-[#FEF2F2]',
    disabled: 'disabled:opacity-50',
  },
  ghost: {
    base: 'bg-transparent text-[#71717A] border-transparent',
    hover: 'hover:bg-[#FAFAFA]',
    disabled: 'disabled:opacity-50',
  },
};

export default function Button({
  variant = 'primary',
  size = 'medium',
  icon,
  iconOnly = false,
  loading = false,
  disabled = false,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const sizeStyles = sizeConfig[size];
  const variantStyle = variantStyles[variant];

  const isDisabled = disabled || loading;

  // Determine padding based on iconOnly
  const paddingClass = iconOnly ? sizeStyles.paddingIconOnly : sizeStyles.padding;

  // Build icon element
  const iconElement = loading ? (
    <Loader2 className={`${sizeStyles.iconSize} animate-spin`} />
  ) : icon ? (
    <span className={`${sizeStyles.iconSize} flex items-center justify-center [&>svg]:w-full [&>svg]:h-full`}>
      {icon}
    </span>
  ) : null;

  return (
    <button
      type="button"
      disabled={isDisabled}
      className={`
        inline-flex
        items-center
        justify-center
        ${sizeStyles.height}
        ${paddingClass}
        ${sizeStyles.radius}
        ${sizeStyles.gap}
        ${variantStyle.base}
        ${!isDisabled ? variantStyle.hover : ''}
        ${variantStyle.disabled}
        text-[12px]
        font-medium
        font-['Inter']
        leading-none
        transition-colors
        duration-150
        ease-out
        cursor-pointer
        disabled:cursor-not-allowed
        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-offset-2
        focus-visible:ring-[#18181B]
        ${className}
      `}
      {...props}
    >
      {iconElement}
      {!iconOnly && children}
    </button>
  );
}

// Named export for flexibility
export { Button };
export type { ButtonProps };
