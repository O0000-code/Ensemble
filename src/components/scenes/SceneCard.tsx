import React, { useRef } from 'react';
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
  Sparkles,
  Plug,
} from 'lucide-react';
import { Scene } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface SceneCardProps {
  scene: Scene;
  selected?: boolean;
  active?: boolean;
  onClick?: () => void;
  onMoreClick?: (e: React.MouseEvent) => void;
  onIconClick?: (triggerRef: React.RefObject<HTMLDivElement>) => void;
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
  selected = false,
  active = false,
  onClick,
  onMoreClick,
  onIconClick,
}) => {
  const iconRef = useRef<HTMLDivElement>(null);
  const IconComponent = getIcon(scene.icon);

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
        px-5
        py-4
        transition-colors
        ${selected
          ? 'border-[#18181B] bg-[#FAFAFA]'
          : 'border-[#E5E5E5] bg-white hover:bg-[#FAFAFA]'
        }
      `}
    >
      {/* Left Section */}
      <div className="flex items-center gap-3.5">
        {/* Icon Container */}
        <div
          ref={iconRef}
          onClick={(e) => {
            e.stopPropagation();
            onIconClick?.(iconRef as React.RefObject<HTMLDivElement>);
          }}
          className={`
            flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#FAFAFA]
            ${onIconClick ? 'cursor-pointer hover:ring-2 hover:ring-[#18181B]/10 transition-shadow' : ''}
          `}
        >
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
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-[#A1A1AA]" />
            <span className="text-[11px] font-normal text-[#71717A]">
              {scene.skillIds.length} Skills
            </span>
          </div>

          {/* MCPs Count */}
          <div className="flex items-center gap-1.5">
            <Plug className="h-3 w-3 text-[#A1A1AA]" />
            <span className="text-[11px] font-normal text-[#71717A]">
              {scene.mcpIds.length} MCPs
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
