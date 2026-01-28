import React from 'react';
import { Database, FolderOpen, MessageSquare, Code, Globe, FileText, Zap } from 'lucide-react';
import Toggle from '../common/Toggle';
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
  onToggle: (id: string) => void;
  onClick?: (id: string) => void;
}

export const McpItem: React.FC<McpItemProps> = ({ mcp, onToggle, onClick }) => {
  const IconComponent = getIcon(mcp.category);

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
        bg-white
        px-5
        py-4
        transition-colors
        ${onClick ? 'cursor-pointer hover:bg-[#FAFAFA]' : ''}
      `}
    >
      {/* Left Section */}
      <div className="flex items-center gap-3.5">
        {/* Icon Container */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FAFAFA]">
          <IconComponent className="h-5 w-5 text-[#52525B]" />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-[#18181B]">{mcp.name}</span>
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
}

export const McpItemCompact: React.FC<McpItemCompactProps> = ({
  mcp,
  selected = false,
  onToggle,
  onClick,
}) => {
  const IconComponent = getIcon(mcp.category);

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
        className={`
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-md
          ${selected ? 'bg-[#F4F4F5]' : 'bg-[#FAFAFA]'}
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
