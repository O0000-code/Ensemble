// src/components/claude-md/ClaudeMdBadge.tsx

import React from 'react';
import type { ClaudeMdType } from '@/types/claudeMd';

/**
 * ClaudeMdBadge Props
 */
interface ClaudeMdBadgeProps {
  /** Type of CLAUDE.md file */
  type: ClaudeMdType;
  /** Optional className for additional styling */
  className?: string;
}

/**
 * Badge configuration for each type
 * Based on design spec:
 * - GLOBAL: #10B981 (green)
 * - PROJECT: #3B82F6 (blue)
 * - LOCAL: #8B5CF6 (purple)
 * - Text: white, 10px, 600
 * - Padding: 2px 8px
 * - Border radius: 4px
 */
const badgeConfig: Record<ClaudeMdType, { bgColor: string; label: string }> = {
  global: {
    bgColor: '#10B981',
    label: 'GLOBAL',
  },
  project: {
    bgColor: '#3B82F6',
    label: 'PROJECT',
  },
  local: {
    bgColor: '#8B5CF6',
    label: 'LOCAL',
  },
};

/**
 * ClaudeMdBadge Component
 *
 * A type indicator badge for CLAUDE.md files.
 * Shows GLOBAL (green), PROJECT (blue), or LOCAL (purple) based on file type.
 *
 * Design specs:
 * - Border radius: 4px
 * - Padding: 2px 8px
 * - Font size: 10px
 * - Font weight: 600
 * - Text color: white
 */
export const ClaudeMdBadge: React.FC<ClaudeMdBadgeProps> = ({
  type,
  className = '',
}) => {
  const config = badgeConfig[type];

  return (
    <span
      className={`
        inline-flex
        items-center
        justify-center
        rounded-[4px]
        px-2
        py-0.5
        text-[10px]
        font-semibold
        leading-none
        text-white
        ${className}
      `}
      style={{ backgroundColor: config.bgColor }}
    >
      {config.label}
    </span>
  );
};

export default ClaudeMdBadge;
