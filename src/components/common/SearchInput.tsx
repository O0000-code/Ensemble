import React from 'react';
import { Search } from 'lucide-react';

// ============================================================================
// SearchInput Component
// ============================================================================

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
}) => {
  return (
    <div
      className={`
        flex
        h-8
        w-[220px]
        items-center
        gap-2
        rounded-md
        border
        border-[#E5E5E5]
        bg-white
        px-2.5
        focus-within:border-[#18181B]
        ${className}
      `}
    >
      <Search className="h-3.5 w-3.5 shrink-0 text-[#A1A1AA]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          h-full
          w-full
          bg-transparent
          text-[13px]
          text-[#18181B]
          placeholder:text-[12px]
          placeholder:text-[#A1A1AA]
          focus:outline-none
        "
      />
    </div>
  );
};
