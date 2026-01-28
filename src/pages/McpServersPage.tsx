import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Server } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge, EmptyState } from '@/components/common';
import { McpItem } from '@/components/mcps/McpItem';
import { useMcpsStore } from '@/stores/mcpsStore';

/**
 * McpServersPage - MCP Servers List Page
 *
 * Displays a list of all MCP servers with:
 * - Page header with title, active count badge, and search
 * - No "Auto Classify" button (unlike Skills page)
 * - List of MCP server items with stats and toggle
 * - Empty state when no servers exist
 */
export const McpServersPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    filter,
    setFilter,
    toggleMcp,
    getFilteredMcps,
    getEnabledCount,
  } = useMcpsStore();

  const filteredMcps = getFilteredMcps();
  const enabledCount = getEnabledCount();

  const handleSearchChange = (value: string) => {
    setFilter({ search: value });
  };

  const handleMcpClick = (id: string) => {
    navigate(`/mcp-servers/${encodeURIComponent(id)}`);
  };

  const handleToggle = (id: string) => {
    toggleMcp(id);
  };

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
    <div className="flex h-full flex-col">
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

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 px-7">
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
          /* MCP Server List */
          <div className="flex flex-col gap-3">
            {filteredMcps.map((mcp) => (
              <McpItem
                key={mcp.id}
                mcp={mcp}
                onToggle={handleToggle}
                onClick={handleMcpClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default McpServersPage;
