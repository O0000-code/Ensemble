import React from 'react';
import { CategoryEmptyIcon, TagEmptyIcon } from './icons';

interface FilteredEmptyStateProps {
  type: 'category' | 'tag';
}

/**
 * FilteredEmptyState Component
 *
 * 用于显示 Category 或 Tag 筛选结果为空时的空状态。
 *
 * Design specs:
 * - Icon to text group gap: 20px
 * - Title: Inter 14px/500, #A1A1AA, letter-spacing -0.2px
 * - Description: Inter 13px/normal, #D4D4D8, text-center
 * - Title to description gap: 6px
 */
export const FilteredEmptyState: React.FC<FilteredEmptyStateProps> = ({ type }) => {
  const Icon = type === 'category' ? CategoryEmptyIcon : TagEmptyIcon;

  const content = {
    category: {
      title: 'No items in this category',
      description: 'Try selecting a different category or add items to this one',
    },
    tag: {
      title: 'No items with this tag',
      description: 'Try selecting a different tag or add this tag to some items',
    },
  };

  const { title, description } = content[type];

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <Icon />
      <h3 className="mt-5 text-sm font-medium tracking-[-0.2px] text-[#A1A1AA]">
        {title}
      </h3>
      <p className="mt-1.5 text-center text-[13px] font-normal text-[#D4D4D8]">
        {description}
      </p>
    </div>
  );
};

export default FilteredEmptyState;
