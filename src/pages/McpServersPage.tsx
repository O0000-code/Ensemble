import React, { useState, useMemo, useRef } from 'react';
import {
  Server,
  Database,
  FolderOpen,
  Code,
  MessageSquare,
  Globe,
  FileText,
  Pencil,
  Layers,
  Wrench,
} from 'lucide-react';
import { PageHeader, SlidePanel } from '@/components/layout';
import { Badge, EmptyState, IconPicker, ICON_MAP } from '@/components/common';
import { McpListItem } from '@/components/mcps/McpListItem';
import { useMcpsStore } from '@/stores/mcpsStore';
import type { Tool } from '@/types';

// ============================================================================
// Icon Mapping and Helper Functions (from McpDetailPage.tsx)
// ============================================================================

// Icon mapping for MCP servers
const iconMap: Record<string, React.ElementType> = {
  Database: Database,
  Development: Code,
  Communication: MessageSquare,
  Research: Globe,
  Productivity: FileText,
  default: FolderOpen,
};

const getIcon = (category: string): React.ElementType => {
  return iconMap[category] || iconMap.default;
};

// Get icon for MCP server - prioritizes custom icon over category-based icon
const getMcpIcon = (mcp: { icon?: string; category: string }): React.ElementType => {
  // 优先使用自定义图标
  if (mcp.icon && ICON_MAP[mcp.icon]) {
    return ICON_MAP[mcp.icon];
  }
  // 回退到原有逻辑（根据 category 或默认图标）
  return getIcon(mcp.category);
};

// Tool icon mapping based on tool name patterns
const getToolIcon = (toolName: string): React.ElementType => {
  if (toolName.includes('read') || toolName.includes('get') || toolName.includes('list')) {
    return FileText;
  }
  if (toolName.includes('write') || toolName.includes('create') || toolName.includes('update')) {
    return Pencil;
  }
  if (toolName.includes('search') || toolName.includes('query')) {
    return Globe;
  }
  return Wrench;
};

// Mock scenes data for "Used in Scenes" section
const mockScenes = [
  { id: '1', name: 'Development', icon: Code },
  { id: '2', name: 'Research', icon: Globe },
];

// ============================================================================
// ToolItem Component (from McpDetailPage.tsx)
// ============================================================================
// Displays a single tool in the Provided Tools section

interface ToolItemProps {
  tool: Tool;
  isLast: boolean;
}

const ToolItem: React.FC<ToolItemProps> = ({ tool, isLast }) => {
  const IconComponent = getToolIcon(tool.name);

  return (
    <div
      className={`flex items-center gap-3 px-3.5 py-3 ${
        !isLast ? 'border-b border-[#E5E5E5]' : ''
      }`}
    >
      {/* Icon */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#F4F4F5]">
        <IconComponent className="h-3.5 w-3.5 text-[#52525B]" />
      </div>
      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[13px] font-medium text-[#18181B]">
          {tool.name}
        </span>
        <span className="text-[11px] font-normal text-[#71717A] truncate">
          {tool.description}
        </span>
      </div>
    </div>
  );
};

// ============================================================================
// McpServersPage Component
// ============================================================================

/**
 * McpServersPage - MCP Servers List Page with Slide Panel
 *
 * Features:
 * - Page header with title, active count badge, and search
 * - List of MCP server items with stats and toggle
 * - Detail panel slides in from right when item is clicked
 * - No route navigation - uses local state for selection
 */
export const McpServersPage: React.FC = () => {
  const {
    mcpServers,
    filter,
    setFilter,
    toggleMcp,
    updateMcpIcon,
    getFilteredMcps,
    getEnabledCount,
  } = useMcpsStore();

  // Selected MCP ID state (replaces route navigation)
  const [selectedMcpId, setSelectedMcpId] = useState<string | null>(null);

  const filteredMcps = getFilteredMcps();
  const enabledCount = getEnabledCount();

  // Get selected MCP data using useMemo
  const selectedMcp = useMemo(
    () => mcpServers.find((mcp) => mcp.id === selectedMcpId) || null,
    [mcpServers, selectedMcpId]
  );

  // Icon Picker state
  const [iconPickerState, setIconPickerState] = useState<{
    isOpen: boolean;
    mcpId: string | null;
    triggerRef: React.RefObject<HTMLDivElement> | null;
  }>({ isOpen: false, mcpId: null, triggerRef: null });

  // Ref for detail header icon
  const detailIconRef = useRef<HTMLDivElement>(null);

  const handleSearchChange = (value: string) => {
    setFilter({ search: value });
  };

  // Changed: Set state instead of navigating
  const handleMcpClick = (id: string) => {
    setSelectedMcpId(id);
  };

  // Close detail panel
  const handleCloseDetail = () => {
    setSelectedMcpId(null);
  };

  const handleToggle = (id: string) => {
    toggleMcp(id);
  };

  // Handle icon click
  const handleIconClick = (mcpId: string, ref: React.RefObject<HTMLDivElement>) => {
    setIconPickerState({ isOpen: true, mcpId, triggerRef: ref });
  };

  // Handle icon change
  const handleIconChange = (iconName: string) => {
    if (iconPickerState.mcpId) {
      updateMcpIcon(iconPickerState.mcpId, iconName);
    }
    setIconPickerState({ isOpen: false, mcpId: null, triggerRef: null });
  };

  // Handle icon picker close
  const handleIconPickerClose = () => {
    setIconPickerState({ isOpen: false, mcpId: null, triggerRef: null });
  };

  // Get the appropriate icon for the selected MCP
  const SelectedMcpIcon = selectedMcp ? getMcpIcon(selectedMcp) : Database;

  // ============================================================================
  // Detail Panel Header (from McpDetailPage.tsx)
  // ============================================================================
  const detailHeader = selectedMcp && (
    <div className="flex items-center gap-3">
      {/* Icon */}
      <div
        ref={detailIconRef}
        onClick={() => handleIconClick(selectedMcp.id, detailIconRef as React.RefObject<HTMLDivElement>)}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F4F4F5] cursor-pointer hover:ring-2 hover:ring-[#18181B]/10 transition-shadow"
      >
        <SelectedMcpIcon className="h-5 w-5 text-[#52525B]" />
      </div>
      {/* Title Info */}
      <div className="flex flex-col gap-0.5">
        <h2 className="text-sm font-semibold text-[#18181B]">
          {selectedMcp.name}
        </h2>
        <p className="text-xs font-normal text-[#71717A]">
          {selectedMcp.description}
        </p>
      </div>
    </div>
  );

  // ============================================================================
  // Detail Panel Header Right (from McpDetailPage.tsx)
  // ============================================================================
  // 关闭按钮由 SlidePanel 组件提供，不需要额外的 header right 内容
  const detailHeaderRight = null;

  // ============================================================================
  // Detail Panel Content (from McpDetailPage.tsx)
  // ============================================================================
  const detailContent = selectedMcp && (
    <div className="flex flex-col gap-7">
      {/* Info Section */}
      <section className="flex flex-col gap-4">
        {/* Info Row - MCP specific: Tools, Total Calls, Avg Response */}
        <div className="flex gap-8">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-[#71717A]">Tools</span>
            <span className="text-[13px] font-medium text-[#18181B]">
              {selectedMcp?.providedTools?.length ?? 0} available
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-[#71717A]">
              Total Calls
            </span>
            <span className="text-[13px] font-medium text-[#18181B]">
              {selectedMcp?.usageCount?.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-[#71717A]">
              Avg Response
            </span>
            <span className="text-[13px] font-medium text-[#18181B]">12ms</span>
          </div>
        </div>

        {/* Category & Tags - 垂直布局 */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-medium text-[#71717A]">Category</span>
          <Badge variant="category" color="#18181B">
            {selectedMcp.category}
          </Badge>
        </div>
        {selectedMcp?.tags && selectedMcp.tags.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-medium text-[#71717A]">Tags</span>
            <div className="flex flex-wrap items-center gap-2">
              {selectedMcp.tags.map((tag) => (
                <Badge key={tag} variant="tag">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Provided Tools Section (MCP-specific) */}
      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-[#18181B]">Provided Tools</h3>
        <div className="overflow-hidden rounded-lg border border-[#E5E5E5]">
          {selectedMcp?.providedTools?.map((tool, index) => (
            <ToolItem
              key={tool.name}
              tool={tool}
              isLast={index === (selectedMcp?.providedTools?.length ?? 0) - 1}
            />
          ))}
        </div>
      </section>

      {/* Source Configuration Section */}
      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-[#18181B]">
          Source Configuration
        </h3>
        <div className="flex flex-col gap-3 rounded-lg border border-[#E5E5E5] p-4">
          {/* Config Path */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-medium text-[#71717A]">Config Path</span>
            <span className="text-xs font-normal text-[#18181B]">
              {selectedMcp.sourcePath}
            </span>
          </div>
          {/* Install Scope */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-medium text-[#71717A]">
              Install Scope
            </span>
            <span className="rounded bg-[#EEF2FF] px-2 py-1 text-[10px] font-semibold text-[#4F46E5]">
              User
            </span>
          </div>
        </div>
      </section>

      {/* Used in Scenes Section */}
      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-[#18181B]">Used in Scenes</h3>
        <div className="flex flex-wrap gap-2">
          {mockScenes.map((scene) => (
            <button
              key={scene.id}
              type="button"
              className="flex items-center gap-2 rounded-md border border-[#E5E5E5] px-3.5 py-2 text-xs font-medium text-[#18181B] transition-colors hover:bg-[#FAFAFA]"
            >
              <Layers className="h-3.5 w-3.5 text-[#52525B]" />
              {scene.name}
            </button>
          ))}
        </div>
      </section>
    </div>
  );

  // Empty state when no MCPs exist
  if (filteredMcps.length === 0 && !filter.search) {
    return (
      <div className="flex h-full flex-col">
        <PageHeader
          title="MCP Servers"
          badge={
            <Badge variant="status">
              {enabledCount} active
            </Badge>
          }
          searchValue={filter.search}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search servers..."
        />
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            icon={<Server className="h-12 w-12" />}
            title="No MCP servers"
            description="Add servers to extend capabilities"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      {/* Page Header */}
      <PageHeader
        title="MCP Servers"
        badge={
          <Badge variant="status">
            {enabledCount} active
          </Badge>
        }
        searchValue={filter.search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search servers..."
      />

      {/* Main Content Area - with shrink animation */}
      <div
        className={`
          flex-1 overflow-y-auto p-6 px-7
          transition-[margin-right] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]
          ${selectedMcpId ? 'mr-[800px]' : ''}
        `}
      >
        {/* No results for search */}
        {filteredMcps.length === 0 && filter.search ? (
          <div className="flex h-full items-center justify-center">
            <EmptyState
              icon={<Server className="h-12 w-12" />}
              title="No servers found"
              description={`No servers match "${filter.search}"`}
            />
          </div>
        ) : (
          /* MCP Server List - Unified component with smooth transitions */
          <div className="flex flex-col gap-3">
            {filteredMcps.map((mcp) => (
              <McpListItem
                key={mcp.id}
                mcp={mcp}
                compact={!!selectedMcpId}
                selected={mcp.id === selectedMcpId}
                onToggle={handleToggle}
                onClick={handleMcpClick}
                onIconClick={(ref) => handleIconClick(mcp.id, ref)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Slide Panel for Detail View */}
      <SlidePanel
        isOpen={!!selectedMcpId}
        onClose={handleCloseDetail}
        width={800}
        header={detailHeader}
        headerRight={detailHeaderRight}
      >
        {detailContent}
      </SlidePanel>

      {/* Icon Picker */}
      {iconPickerState.triggerRef && (
        <IconPicker
          value={mcpServers.find((m) => m.id === iconPickerState.mcpId)?.icon || 'database'}
          onChange={handleIconChange}
          triggerRef={iconPickerState.triggerRef}
          isOpen={iconPickerState.isOpen}
          onClose={handleIconPickerClose}
        />
      )}
    </div>
  );
};

export default McpServersPage;
