import React from 'react';

interface CategoryEmptyIconProps {
  className?: string;
}

export const CategoryEmptyIcon: React.FC<CategoryEmptyIconProps> = ({ className }) => {
  return (
    <svg
      className={className}
      width="44"
      height="32"
      viewBox="0 0 44 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Card Back (最后层) - 位置偏移 x:8, y:10 */}
      <rect
        x="8.75"
        y="10.75"
        width="34.5"
        height="20.5"
        rx="3.25"
        stroke="#E4E4E7"
        strokeWidth="1.5"
      />
      {/* Card Mid (中间层) - 位置偏移 x:4, y:5 */}
      <rect
        x="4.75"
        y="5.75"
        width="34.5"
        height="20.5"
        rx="3.25"
        fill="white"
        stroke="#D4D4D8"
        strokeWidth="1.5"
      />
      {/* Card Front (最前层) - 位置 x:0, y:0 */}
      <rect
        x="0.75"
        y="0.75"
        width="34.5"
        height="20.5"
        rx="3.25"
        fill="white"
        stroke="#A1A1AA"
        strokeWidth="1.5"
      />
      {/* Content Line 1 - 16px */}
      <line
        x1="6"
        y1="7"
        x2="22"
        y2="7"
        stroke="#D4D4D8"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Content Line 2 - 10px */}
      <line
        x1="6"
        y1="12"
        x2="16"
        y2="12"
        stroke="#E4E4E7"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default CategoryEmptyIcon;
