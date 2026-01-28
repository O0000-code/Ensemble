import React from 'react';
import {
  Layers,
  Code,
  Server,
  BarChart,
  Cloud,
  FileText,
  BookOpen,
  Smartphone,
} from 'lucide-react';
import { Scene } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface SceneItemProps {
  scene: Scene;
  selected?: boolean;
  onClick?: () => void;
}

// ============================================================================
// Icon Mapping
// ============================================================================

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  layers: Layers,
  code: Code,
  server: Server,
  'bar-chart': BarChart,
  cloud: Cloud,
  'file-text': FileText,
  'book-open': BookOpen,
  smartphone: Smartphone,
};

const getIcon = (iconName: string) => {
  return iconMap[iconName] || Layers;
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
}) => {
  const IconComponent = getIcon(scene.icon);

  return (
    <div
      onClick={onClick}
      className={`
        flex
        cursor-pointer
        items-center
        gap-3
        rounded-md
        px-3.5
        py-3
        transition-colors
        ${selected ? 'bg-[#FAFAFA]' : 'hover:bg-[#FAFAFA]'}
      `}
    >
      {/* Icon Container */}
      <div
        className={`
          flex
          h-9
          w-9
          flex-shrink-0
          items-center
          justify-center
          rounded-lg
          ${selected ? 'bg-white' : 'bg-[#F4F4F5]'}
        `}
      >
        <IconComponent className="h-4 w-4 text-[#52525B]" />
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-col gap-0.5">
        <span
          className={`
            truncate text-[13px]
            ${selected ? 'font-semibold text-[#18181B]' : 'font-medium text-[#71717A]'}
          `}
        >
          {scene.name}
        </span>
        <span
          className={`
            text-[11px] font-normal
            ${selected ? 'text-[#71717A]' : 'text-[#A1A1AA]'}
          `}
        >
          {scene.skillIds.length} Skills · {scene.mcpIds.length} MCPs
        </span>
      </div>
    </div>
  );
};

export default SceneItem;
