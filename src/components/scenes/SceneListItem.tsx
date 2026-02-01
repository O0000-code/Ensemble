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
} from 'lucide-react';
import { Scene } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface SceneListItemProps {
  scene: Scene;
  compact?: boolean;
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
// Animation Constants
// ============================================================================

const TRANSITION_DURATION = '250ms';
const TRANSITION_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';
const TRANSITION_BASE = `${TRANSITION_DURATION} ${TRANSITION_EASING}`;

// ============================================================================
// SceneListItem Component
// ============================================================================

/**
 * SceneListItem Component
 *
 * Unified scene list item with smooth transition between full and compact modes.
 *
 * Full mode (compact=false): Shows description, right-side stats, active badge, more button
 * Compact mode (compact=true): Shows only icon, name, and inline stats below name
 *
 * Animation specs:
 * - Duration: 250ms (consistent with SlidePanel)
 * - Easing: cubic-bezier(0.4, 0, 0.2, 1) (Material Design standard)
 * - Elements: opacity, max-height, width transitions
 */
export const SceneListItem: React.FC<SceneListItemProps> = ({
  scene,
  compact = false,
  selected = false,
  active = false,
  onClick,
  onMoreClick,
  onIconClick,
}) => {
  const iconRef = useRef<HTMLDivElement>(null);
  const IconComponent = getIcon(scene.icon);

  // Stats text for both modes
  const statsText = `${scene.skillIds.length} Skills · ${scene.mcpIds.length} MCPs`;

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
        ${selected
          ? 'border-[#18181B] bg-[#FAFAFA]'
          : 'border-[#E5E5E5] bg-white hover:bg-[#FAFAFA]'
        }
      `}
      style={{
        transition: `background-color ${TRANSITION_BASE}, border-color ${TRANSITION_BASE}`,
      }}
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
            flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg
            ${selected ? 'bg-[#F4F4F5]' : 'bg-[#FAFAFA]'}
            ${onIconClick ? 'cursor-pointer hover:ring-2 hover:ring-[#18181B]/10' : ''}
          `}
          style={{
            transition: `background-color ${TRANSITION_BASE}, box-shadow ${TRANSITION_BASE}`,
          }}
        >
          <IconComponent
            className={`h-5 w-5 transition-colors duration-[250ms] ${selected ? 'text-[#18181B]' : 'text-[#52525B]'}`}
          />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-1">
          {/* Name */}
          <span
            className={`
              text-sm text-[#18181B]
              ${selected ? 'font-semibold' : 'font-medium'}
            `}
            style={{ transition: `font-weight ${TRANSITION_BASE}` }}
          >
            {scene.name}
          </span>

          {/* Description - visible in full mode */}
          <div
            className="overflow-hidden"
            style={{
              opacity: compact ? 0 : 1,
              maxHeight: compact ? 0 : '20px',
              transition: `opacity ${TRANSITION_BASE}, max-height ${TRANSITION_BASE}`,
            }}
          >
            <span className="block max-w-[400px] truncate text-xs font-normal text-[#71717A]">
              {scene.description}
            </span>
          </div>

          {/* Inline Stats - visible in compact mode */}
          <div
            className="overflow-hidden"
            style={{
              opacity: compact ? 1 : 0,
              maxHeight: compact ? '20px' : 0,
              transition: `opacity ${TRANSITION_BASE}, max-height ${TRANSITION_BASE}`,
            }}
          >
            <span className="block text-xs font-normal text-[#71717A]">
              {statsText}
            </span>
          </div>
        </div>
      </div>

      {/* Right Section - visible in full mode */}
      <div
        className="flex items-center overflow-hidden"
        style={{
          opacity: compact ? 0 : 1,
          maxWidth: compact ? 0 : '400px',
          gap: compact ? 0 : '24px',
          transition: `opacity ${TRANSITION_BASE}, max-width ${TRANSITION_BASE}, gap ${TRANSITION_BASE}`,
        }}
      >
        {/* Meta Stats */}
        <div
          className="flex items-center"
          style={{
            gap: compact ? 0 : '20px',
            transition: `gap ${TRANSITION_BASE}`,
          }}
        >
          {/* Skills Count */}
          <div
            className="flex items-center overflow-hidden whitespace-nowrap"
            style={{
              gap: compact ? 0 : '6px',
              maxWidth: compact ? 0 : '100px',
              transition: `gap ${TRANSITION_BASE}, max-width ${TRANSITION_BASE}`,
            }}
          >
            <span className="text-[11px] font-medium text-[#A1A1AA]">Skills</span>
            <span className="text-[11px] font-semibold text-[#52525B]">
              {scene.skillIds.length}
            </span>
          </div>

          {/* MCPs Count */}
          <div
            className="flex items-center overflow-hidden whitespace-nowrap"
            style={{
              gap: compact ? 0 : '6px',
              maxWidth: compact ? 0 : '100px',
              transition: `gap ${TRANSITION_BASE}, max-width ${TRANSITION_BASE}`,
            }}
          >
            <span className="text-[11px] font-medium text-[#A1A1AA]">MCPs</span>
            <span className="text-[11px] font-semibold text-[#52525B]">
              {scene.mcpIds.length}
            </span>
          </div>
        </div>

        {/* Active Badge */}
        {active && (
          <span
            className="overflow-hidden whitespace-nowrap rounded px-2.5 py-1 text-[10px] font-semibold text-[#16A34A] bg-[#DCFCE7]"
            style={{
              opacity: compact ? 0 : 1,
              maxWidth: compact ? 0 : '80px',
              transition: `opacity ${TRANSITION_BASE}, max-width ${TRANSITION_BASE}`,
            }}
          >
            Active
          </span>
        )}

        {/* More Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoreClick?.(e);
          }}
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded transition-colors hover:bg-[#F4F4F5]"
          style={{
            opacity: compact ? 0 : 1,
            width: compact ? 0 : '28px',
            minWidth: compact ? 0 : '28px',
            transition: `opacity ${TRANSITION_BASE}, width ${TRANSITION_BASE}, min-width ${TRANSITION_BASE}`,
          }}
        >
          <MoreHorizontal className="h-4 w-4 text-[#A1A1AA]" />
        </button>
      </div>
    </div>
  );
};

export default SceneListItem;
