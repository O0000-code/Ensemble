import React, { useRef } from 'react';
import { Database, FolderOpen, MessageSquare, Code, Globe, FileText, Zap } from 'lucide-react';
import Toggle from '../common/Toggle';
import { ICON_MAP } from '@/components/common';
import { McpServer } from '@/types';

// Icon mapping for MCP servers
const iconMap: Record<string, React.ElementType> = {
  Database: Database,
  Development: Code,
  Communication: MessageSquare,
  Research: Globe,
  Productivity: FileText,
  default: FolderOpen,
};

// Get icon component based on category
const getIcon = (category: string): React.ElementType => {
  return iconMap[category] || iconMap.default;
};

// Get icon for MCP server - prioritizes custom icon over category-based icon
const getMcpIcon = (mcp: McpServer): React.ElementType => {
  // 优先使用自定义图标
  if (mcp.icon && ICON_MAP[mcp.icon]) {
    return ICON_MAP[mcp.icon];
  }
  // 回退到原有逻辑（根据 category 或默认图标）
  return getIcon(mcp.category);
};

// Format usage count for display (e.g., 1847 -> "1.8k")
const formatUsageCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
};

// ============================================================================
// McpItem Component - Main List Version
// ============================================================================
// Used in the MCP Servers list page with full details

interface McpItemProps {
  mcp: McpServer;
  selected?: boolean;
  onToggle: (id: string) => void;
  onClick?: (id: string) => void;
  onIconClick?: (triggerRef: React.RefObject<HTMLDivElement>) => void;
}

export const McpItem: React.FC<McpItemProps> = ({ mcp, selected = false, onToggle, onClick, onIconClick }) => {
  const iconRef = useRef<HTMLDivElement>(null);
  const IconComponent = getMcpIcon(mcp);

  const handleClick = () => {
    onClick?.(mcp.id);
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(mcp.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(mcp.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
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
        transition-colors
        ${selected ? 'bg-[#FAFAFA]' : 'bg-white'}
        ${onClick && !selected ? 'cursor-pointer hover:bg-[#FAFAFA]' : ''}
        ${onClick ? 'cursor-pointer' : ''}
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
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            selected ? 'bg-[#F4F4F5]' : 'bg-[#FAFAFA]'
          } ${
            onIconClick ? 'cursor-pointer hover:ring-2 hover:ring-[#18181B]/10 transition-shadow' : ''
          }`}
        >
          <IconComponent className={`h-5 w-5 ${selected ? 'text-[#18181B]' : 'text-[#52525B]'}`} />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-1">
          <span className={`text-sm text-[#18181B] ${selected ? 'font-semibold' : 'font-medium'}`}>{mcp.name}</span>
          <span className="text-xs font-normal text-[#71717A] line-clamp-1 max-w-[400px]">
            {mcp.description}
          </span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Stats */}
        <div className="flex items-center gap-5">
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
          <div className="flex items-center gap-1 rounded bg-[#DCFCE7] px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
            <span className="text-[10px] font-semibold text-[#16A34A]">Active</span>
          </div>
        )}

        {/* Toggle */}
        <div onClick={handleToggleClick}>
          <Toggle
            checked={mcp.enabled}
            onChange={() => onToggle(mcp.id)}
            size="medium"
          />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// McpItemCompact Component - Side Panel List Version
// ============================================================================
// Used in the detail page side panel with simplified display

interface McpItemCompactProps {
  mcp: McpServer;
  selected?: boolean;
  onToggle: (id: string) => void;
  onClick?: (id: string) => void;
  onIconClick?: (triggerRef: React.RefObject<HTMLDivElement>) => void;
}

export const McpItemCompact: React.FC<McpItemCompactProps> = ({
  mcp,
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(mcp.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      className={`
        flex
        w-full
        items-center
        gap-3
        rounded-md
        px-3.5
        py-3
        transition-colors
        ${selected ? 'bg-[#FAFAFA]' : 'hover:bg-[#FAFAFA]'}
        ${onClick ? 'cursor-pointer' : ''}
      `}
    >
      {/* Icon Container */}
      <div
        ref={iconRef}
        onClick={(e) => {
          e.stopPropagation();
          onIconClick?.(iconRef as React.RefObject<HTMLDivElement>);
        }}
        className={`
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-md
          ${selected ? 'bg-[#F4F4F5]' : 'bg-[#FAFAFA]'}
          ${onIconClick ? 'cursor-pointer hover:ring-2 hover:ring-[#18181B]/10 transition-shadow' : ''}
        `}
      >
        <IconComponent
          className={`h-4 w-4 ${selected ? 'text-[#18181B]' : 'text-[#52525B]'}`}
        />
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={`text-[13px] text-[#18181B] truncate ${
            selected ? 'font-semibold' : 'font-medium'
          }`}
        >
          {mcp.name}
        </span>
        <span className="text-[11px] font-normal text-[#71717A] truncate">
          {mcp.description}
        </span>
      </div>

      {/* Toggle */}
      <div onClick={handleToggleClick} className="shrink-0">
        <Toggle
          checked={mcp.enabled}
          onChange={() => onToggle(mcp.id)}
          size="small"
        />
      </div>
    </div>
  );
};

export default McpItem;
