import React, { useRef } from 'react';
import { Code, Zap } from 'lucide-react';
import Toggle from '../common/Toggle';
import { ICON_MAP } from '@/components/common';
import { McpServer } from '@/types';

// ============================================================================
// Animation Constants
// ============================================================================

const TRANSITION_DURATION = '250ms';
const TRANSITION_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';
const TRANSITION_BASE = `${TRANSITION_DURATION} ${TRANSITION_EASING}`;
// Delay for right section to appear when expanding (closing detail panel)
const RIGHT_SECTION_DELAY = '150ms';

// ============================================================================
// Icon Helpers
// ============================================================================

const categoryIconMap: Record<string, React.ElementType> = {
  Database: ICON_MAP['database'] || ICON_MAP['folder'],
  Development: ICON_MAP['code'] || ICON_MAP['folder'],
  Communication: ICON_MAP['message-square'] || ICON_MAP['folder'],
  Research: ICON_MAP['globe'] || ICON_MAP['folder'],
  Productivity: ICON_MAP['file-text'] || ICON_MAP['folder'],
};

const getMcpIcon = (mcp: McpServer): React.ElementType => {
  if (mcp.icon && ICON_MAP[mcp.icon]) {
    return ICON_MAP[mcp.icon];
  }
  return categoryIconMap[mcp.category] || ICON_MAP['folder-open'] || ICON_MAP['folder'];
};

const formatUsageCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
};

// ============================================================================
// McpListItem Component
// ============================================================================

interface McpListItemProps {
  mcp: McpServer;
  compact?: boolean;
  selected?: boolean;
  onToggle: (id: string) => void;
  onClick?: (id: string) => void;
  onIconClick?: (triggerRef: React.RefObject<HTMLDivElement>) => void;
}

/**
 * Unified MCP list item with smooth transition between full and compact modes.
 *
 * Full mode (compact=false): Shows tools count, calls count, Active badge
 * Compact mode (compact=true): Shows only icon, name, description, toggle
 *
 * Key animation behavior:
 * - When collapsing (full → compact): right section fades out immediately
 * - When expanding (compact → full): right section fades in with delay
 *   to prevent layout shift while list width is still animating
 */
export const McpListItem: React.FC<McpListItemProps> = ({
  mcp,
  compact = false,
  selected = false,
  onToggle,
  onClick,
  onIconClick,
}) => {
  const iconRef = useRef<HTMLDivElement>(null);
  const IconComponent = getMcpIcon(mcp);

  const handleClick = () => {
    onClick?.(mcp.id);
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(mcp.id);
  };

  // Right section transition: immediate hide, delayed show
  const rightSectionStyle = {
    opacity: compact ? 0 : 1,
    maxWidth: compact ? 0 : '300px',
    overflow: 'hidden' as const,
    transition: compact
      ? `opacity ${TRANSITION_BASE}, max-width ${TRANSITION_BASE}`
      : `opacity ${TRANSITION_BASE} ${RIGHT_SECTION_DELAY}, max-width ${TRANSITION_BASE} ${RIGHT_SECTION_DELAY}`,
  };

  return (
    <div
      onClick={handleClick}
      className={`
        flex
        w-full
        items-center
        justify-between
        rounded-lg
        border
        border-[#E5E5E5]
        px-5
        py-4
        ${selected ? 'bg-[#FAFAFA]' : 'bg-white hover:bg-[#FAFAFA]'}
        ${onClick ? 'cursor-pointer' : ''}
      `}
      style={{
        transition: `background-color ${TRANSITION_BASE}`,
      }}
    >
      {/* Left Section */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* Icon Container */}
        <div
          ref={iconRef}
          onClick={(e) => {
            e.stopPropagation();
            onIconClick?.(iconRef as React.RefObject<HTMLDivElement>);
          }}
          className={`
            flex h-10 w-10 shrink-0 items-center justify-center rounded-lg
            ${selected ? 'bg-[#F4F4F5]' : 'bg-[#FAFAFA]'}
            ${onIconClick ? 'cursor-pointer hover:ring-2 hover:ring-[#18181B]/10' : ''}
          `}
          style={{
            transition: `background-color ${TRANSITION_BASE}, box-shadow ${TRANSITION_BASE}`,
          }}
        >
          <IconComponent
            className={`h-5 w-5 ${selected ? 'text-[#18181B]' : 'text-[#52525B]'}`}
            style={{ transition: `color ${TRANSITION_BASE}` }}
          />
        </div>

        {/* Info */}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span
            className={`text-sm text-[#18181B] truncate ${selected ? 'font-semibold' : 'font-medium'}`}
            style={{ transition: `font-weight ${TRANSITION_BASE}` }}
          >
            {mcp.name}
          </span>
          <span className="text-xs font-normal text-[#71717A] truncate">
            {mcp.description}
          </span>
        </div>
      </div>

      {/* Right Section - Stats & Badge (hidden in compact mode with delay on show) */}
      <div
        className="flex items-center gap-4 shrink-0"
        style={rightSectionStyle}
      >
        {/* Stats */}
        <div className="flex items-center gap-5 whitespace-nowrap">
          {/* Tools Count */}
          <div className="flex items-center gap-1.5">
            <Code className="h-3 w-3 text-[#A1A1AA]" />
            <span className="text-[11px] text-[#71717A]">
              {mcp.providedTools.length} tools
            </span>
          </div>

          {/* Usage Count */}
          <div className="flex items-center gap-1.5">
            <Zap className="h-3 w-3 text-[#A1A1AA]" />
            <span className="text-[11px] text-[#71717A]">
              {formatUsageCount(mcp.usageCount)} calls
            </span>
          </div>
        </div>

        {/* Status Badge */}
        {mcp.enabled && (
          <div className="flex items-center gap-1 rounded bg-[#DCFCE7] px-2.5 py-1 whitespace-nowrap">
            <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
            <span className="text-[10px] font-semibold text-[#16A34A]">Active</span>
          </div>
        )}
      </div>

      {/* Toggle - Always visible */}
      <div
        onClick={handleToggleClick}
        className="shrink-0 ml-4"
      >
        <Toggle
          checked={mcp.enabled}
          onChange={() => onToggle(mcp.id)}
          size="medium"
        />
      </div>
    </div>
  );
};

export default McpListItem;
