import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
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
import { ListDetailLayout } from '@/components/layout/ListDetailLayout';
import { SearchInput, Badge, Toggle, EmptyState } from '@/components/common';
import { McpItemCompact } from '@/components/mcps/McpItem';
import { useMcpsStore } from '@/stores/mcpsStore';
import { Tool } from '@/types';

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

/**
 * McpDetailPage - MCP Server Detail Page
 *
 * Two-column layout with:
 * - List panel (380px): MCP server list with search
 * - Detail panel: Selected server details
 *
 * Detail panel sections:
 * - Info: Tools count, Total Calls, Avg Response
 * - Category & Tags
 * - Provided Tools (MCP-specific)
 * - Source Configuration
 * - Used in Scenes
 */
export const McpDetailPage: React.FC = () => {
  const { id: encodedId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    filter,
    setFilter,
    selectMcp,
    toggleMcp,
    getFilteredMcps,
    getEnabledCount,
    getSelectedMcp,
  } = useMcpsStore();

  // Decode the URL-encoded MCP ID
  const id = encodedId ? decodeURIComponent(encodedId) : null;

  const filteredMcps = getFilteredMcps();
  const enabledCount = getEnabledCount();
  const selectedMcp = getSelectedMcp();

  // Sync URL param with store selection (useEffect is the correct place for side effects)
  useEffect(() => {
    if (id) {
      selectMcp(id);
    }
  }, [id, selectMcp]);

  const handleSearchChange = (value: string) => {
    setFilter({ search: value });
  };

  const handleMcpClick = (mcpId: string) => {
    navigate(`/mcp-servers/${encodeURIComponent(mcpId)}`);
  };

  const handleToggle = (mcpId: string) => {
    toggleMcp(mcpId);
  };

  // List Panel Header
  const listHeader = (
    <>
      <div className="flex items-center gap-3">
        <h2 className="text-base font-semibold text-[#18181B]">MCP Servers</h2>
        <Badge variant="status">{enabledCount} active</Badge>
      </div>
      <SearchInput
        value={filter.search}
        onChange={handleSearchChange}
        placeholder="Search servers..."
        className="w-[140px]"
      />
    </>
  );

  // List Panel Content
  const listContent = (
    <div className="flex flex-col gap-1">
      {filteredMcps.map((mcp) => (
        <McpItemCompact
          key={mcp.id}
          mcp={mcp}
          selected={mcp.id === id}
          onToggle={handleToggle}
          onClick={handleMcpClick}
        />
      ))}
      {filteredMcps.length === 0 && (
        <div className="py-8 text-center text-sm text-[#A1A1AA]">
          No servers found
        </div>
      )}
    </div>
  );

  // Detail Panel Header (when MCP is selected)
  const detailHeader = selectedMcp && (
    <>
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F4F4F5]">
          {React.createElement(getIcon(selectedMcp.category), {
            className: 'h-5 w-5 text-[#52525B]',
          })}
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
      <div className="flex items-center gap-2">
        {/* Edit Button */}
        <button
          type="button"
          className="flex h-8 items-center gap-1.5 rounded-md border border-[#E5E5E5] px-3 text-[13px] font-medium text-[#18181B] transition-colors hover:bg-[#FAFAFA]"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
        {/* Toggle */}
        <Toggle
          checked={selectedMcp.enabled}
          onChange={() => handleToggle(selectedMcp.id)}
          size="large"
        />
      </div>
    </>
  );

  // Detail Panel Content (when MCP is selected)
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

        {/* Category & Tags */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="category" color="#18181B">
            {selectedMcp.category}
          </Badge>
          {selectedMcp?.tags?.map((tag) => (
            <Badge key={tag} variant="tag">
              {tag}
            </Badge>
          ))}
        </div>
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

  // Empty detail state
  const emptyDetail = (
    <EmptyState
      icon={<Database className="h-12 w-12" />}
      title="Select an MCP server"
      description="Choose a server from the list to view details"
    />
  );

  return (
    <ListDetailLayout
      listWidth={380}
      listHeader={listHeader}
      listContent={listContent}
      detailHeader={detailHeader}
      detailContent={detailContent}
      emptyDetail={emptyDetail}
    />
  );
};

// ============================================================================
// ToolItem Component
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

export default McpDetailPage;
