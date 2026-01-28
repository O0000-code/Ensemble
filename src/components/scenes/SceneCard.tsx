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
  MoreHorizontal,
} from 'lucide-react';
import { Scene } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface SceneCardProps {
  scene: Scene;
  index: number;
  selected?: boolean;
  active?: boolean;
  onClick?: () => void;
  onMoreClick?: (e: React.MouseEvent) => void;
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
// SceneCard Component
// ============================================================================

/**
 * SceneCard Component
 *
 * Displays a scene in the scenes list with horizontal layout.
 *
 * Design specs:
 * - Layout: justify-content: space-between, align-items: center
 * - Size: width fill_container
 * - Padding: 20px 24px
 * - Border: 1px solid #E5E5E5
 * - Corner Radius: 8px
 * - Hover: bg #FAFAFA
 * - Selected: bg #FAFAFA, border-color #18181B
 */
export const SceneCard: React.FC<SceneCardProps> = ({
  scene,
  index,
  selected = false,
  active = false,
  onClick,
  onMoreClick,
}) => {
  const IconComponent = getIcon(scene.icon);
  const indexStr = String(index + 1).padStart(2, '0');

  return (
    <div
      onClick={onClick}
      className={`
        flex
        w-full
        cursor-pointer
        items-center
        justify-between
        rounded-lg
        border
        px-6
        py-5
        transition-colors
        ${selected
          ? 'border-[#18181B] bg-[#FAFAFA]'
          : 'border-[#E5E5E5] bg-white hover:bg-[#FAFAFA]'
        }
      `}
    >
      {/* Left Section */}
      <div className="flex items-center gap-5">
        {/* Scene Index */}
        <span className="text-[11px] font-semibold tracking-[0.5px] text-[#A1A1AA]">
          {indexStr}
        </span>

        {/* Icon Container */}
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#F4F4F5]">
          <IconComponent className="h-5 w-5 text-[#52525B]" />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-[#18181B]">
            {scene.name}
          </span>
          <span className="max-w-[400px] truncate text-xs font-normal text-[#71717A]">
            {scene.description}
          </span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        {/* Meta */}
        <div className="flex items-center gap-5">
          {/* Skills Count */}
          <div className="flex flex-col items-end gap-1.5">
            <span className="text-[11px] font-medium text-[#A1A1AA]">Skills</span>
            <span className="text-[11px] font-semibold text-[#52525B]">
              {scene.skillIds.length}
            </span>
          </div>

          {/* MCPs Count */}
          <div className="flex flex-col items-end gap-1.5">
            <span className="text-[11px] font-medium text-[#A1A1AA]">MCPs</span>
            <span className="text-[11px] font-semibold text-[#52525B]">
              {scene.mcpIds.length}
            </span>
          </div>
        </div>

        {/* Active Badge */}
        {active && (
          <span className="rounded px-2.5 py-1 text-[10px] font-semibold text-[#16A34A] bg-[#DCFCE7]">
            Active
          </span>
        )}

        {/* More Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoreClick?.(e);
          }}
          className="flex h-7 w-7 items-center justify-center rounded transition-colors hover:bg-[#F4F4F5]"
        >
          <MoreHorizontal className="h-4 w-4 text-[#A1A1AA]" />
        </button>
      </div>
    </div>
  );
};

export default SceneCard;
