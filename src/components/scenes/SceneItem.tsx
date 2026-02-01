import React, { useRef } from 'react';
import { Layers, BarChart, FileText } from 'lucide-react';
import { Scene } from '@/types';
import { ICON_MAP } from '@/components/common';

// ============================================================================
// Types
// ============================================================================

interface SceneItemProps {
  scene: Scene;
  selected?: boolean;
  onClick?: () => void;
  onIconClick?: (triggerRef: React.RefObject<HTMLDivElement>) => void;
}

// ============================================================================
// Icon Mapping
// ============================================================================

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  ...ICON_MAP,
  'bar-chart': ICON_MAP['bar-chart'] || BarChart,
  'file-text': FileText,
};

const getIcon = (iconName: string) => {
  return iconMap[iconName] || ICON_MAP['layers'] || Layers;
};

// ============================================================================
// SceneItem Component
// ============================================================================

/**
 * SceneItem Component
 *
 * Compact scene item for the list panel in detail view.
 *
 * Design specs:
 * - Layout: align-items: center, gap: 12px
 * - Padding: 12px 14px
 * - Corner Radius: 6px
 * - Icon Container: 36x36, radius 8px, bg #F4F4F5, icon 16x16 #52525B
 * - Selected: bg #FAFAFA, icon bg #FFFFFF, name #18181B weight 600
 */
export const SceneItem: React.FC<SceneItemProps> = ({
  scene,
  selected = false,
  onClick,
  onIconClick,
}) => {
  const iconRef = useRef<HTMLDivElement>(null);
  const IconComponent = getIcon(scene.icon);

  return (
    <div
      onClick={onClick}
      className={`
        flex
        cursor-pointer
        items-center
        gap-3.5
        rounded-lg
        border
        border-[#E5E5E5]
        px-5
        py-4
        transition-colors
        ${selected ? 'bg-[#FAFAFA]' : 'bg-white hover:bg-[#FAFAFA]'}
      `}
    >
      {/* Icon Container - 40x40 per design spec */}
      <div
        ref={iconRef}
        onClick={(e) => {
          e.stopPropagation();
          onIconClick?.(iconRef as React.RefObject<HTMLDivElement>);
        }}
        className={`
          flex
          h-10
          w-10
          flex-shrink-0
          items-center
          justify-center
          rounded-lg
          ${selected ? 'bg-[#F4F4F5]' : 'bg-[#FAFAFA]'}
          ${onIconClick ? 'cursor-pointer hover:ring-2 hover:ring-[#18181B]/10 transition-shadow' : ''}
        `}
      >
        <IconComponent className={`h-5 w-5 ${selected ? 'text-[#18181B]' : 'text-[#52525B]'}`} />
      </div>

      {/* Info - Updated font sizes per design spec */}
      <div className="flex min-w-0 flex-col gap-1">
        <span
          className={`
            truncate text-sm
            ${selected ? 'font-semibold' : 'font-medium'} text-[#18181B]
          `}
        >
          {scene.name}
        </span>
        <span className="text-xs font-normal text-[#71717A]">
          {scene.skillIds.length} Skills · {scene.mcpIds.length} MCPs
        </span>
      </div>
    </div>
  );
};

export default SceneItem;
