// src/components/claude-md/ClaudeMdBadge.tsx

import React from 'react';
import { Globe, Folder, User } from 'lucide-react';
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
 * Based on design spec (P3AWE):
 * - GLOBAL: #7C3AED (紫色) + globe 图标
 * - PROJECT: #0EA5E9 (青色) + folder 图标
 * - LOCAL: #F59E0B (橙色) + user 图标
 * - Size: 16x16
 * - cornerRadius: 8px (圆形)
 * - Border: 2px white
 * - Icon: 8x8, white
 */
const badgeConfig: Record<
  ClaudeMdType,
  { bgColor: string; Icon: React.FC<{ className?: string }> }
> = {
  global: {
    bgColor: '#7C3AED',
    Icon: Globe,
  },
  project: {
    bgColor: '#0EA5E9',
    Icon: Folder,
  },
  local: {
    bgColor: '#F59E0B',
    Icon: User,
  },
};

/**
 * ClaudeMdBadge Component
 *
 * A circular type indicator badge for CLAUDE.md files.
 * Shows a colored circle with icon:
 * - Global: purple (#7C3AED) + globe icon
 * - Project: cyan (#0EA5E9) + folder icon
 * - Local: orange (#F59E0B) + user icon
 *
 * Design specs (from P3AWE):
 * - Size: 16x16
 * - Border radius: 8px (圆形)
 * - Border: 2px white
 * - Icon: 8x8, white
 * - Position: absolute, right -4px (x=28 from parent 40px), top -4px (y=-4)
 */
export const ClaudeMdBadge: React.FC<ClaudeMdBadgeProps> = ({
  type,
  className = '',
}) => {
  const config = badgeConfig[type];
  const { Icon } = config;

  return (
    <div
      className={`
        flex
        h-4
        w-4
        items-center
        justify-center
        rounded-full
        border-2
        border-white
        ${className}
      `}
      style={{ backgroundColor: config.bgColor }}
    >
      <Icon className="h-2 w-2 text-white" />
    </div>
  );
};

export default ClaudeMdBadge;
