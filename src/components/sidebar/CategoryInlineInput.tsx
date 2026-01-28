import React, { useEffect, useRef, useState } from 'react';
import type { Category } from '@/types';

interface CategoryInlineInputProps {
  mode: 'add' | 'edit';
  category?: Category;  // 编辑模式必需
  onSave: (name: string) => void;
  onCancel: () => void;
}

export const CategoryInlineInput: React.FC<CategoryInlineInputProps> = ({
  mode,
  category,
  onSave,
  onCancel,
}) => {
  const [value, setValue] = useState(mode === 'edit' ? category?.name || '' : '');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 自动聚焦和全选
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      if (mode === 'edit') {
        inputRef.current.select();
      }
    }
  }, [mode]);

  // 点击外部取消
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onCancel();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onCancel]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (value.trim()) {
        onSave(value.trim());
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const dotColor = mode === 'edit' ? category?.color : '#A1A1AA';

  return (
    <div
      ref={containerRef}
      className="flex items-center h-8 px-2.5 gap-2.5 rounded-[6px] bg-[#F4F4F5]"
    >
      {/* 圆点 */}
      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: dotColor }}
      />

      {/* 输入框 */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Category name..."
        className="flex-1 bg-transparent text-[13px] outline-none border-none
                   text-[#18181B] placeholder:text-[#A1A1AA]
                   selection:bg-[#0063E1] selection:text-white"
      />
    </div>
  );
};

export default CategoryInlineInput;
