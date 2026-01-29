import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Server } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge, EmptyState } from '@/components/common';
import { FilteredEmptyState } from '@/components/common/FilteredEmptyState';
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

  // Empty state and badge visibility logic
  const showEmptyState = filteredMcps.length === 0;
  const isFilteredByCategory = !!filter.category;
  const isFilteredByTag = filter.tags.length > 0;
  const shouldHideBadge = showEmptyState && (isFilteredByCategory || isFilteredByTag);

  const handleSearchChange = (value: string) => {
    setFilter({ search: value });
  };

  const handleMcpClick = (id: string) => {
    navigate(`/mcp-servers/${encodeURIComponent(id)}`);
  };

  const handleToggle = (id: string) => {
    toggleMcp(id);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Page Header */}
      <PageHeader
        title="MCP Servers"
        badge={
          !shouldHideBadge && enabledCount > 0 && (
            <Badge variant="status">
              {enabledCount} active
            </Badge>
          )
        }
        searchValue={filter.search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search servers..."
      />

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 px-7">
        {showEmptyState ? (
          isFilteredByCategory ? (
            <FilteredEmptyState type="category" />
          ) : isFilteredByTag ? (
            <FilteredEmptyState type="tag" />
          ) : filter.search ? (
            <div className="flex h-full items-center justify-center">
              <EmptyState
                icon={<Server className="h-12 w-12" />}
                title="No servers found"
                description={`No servers match "${filter.search}"`}
              />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <EmptyState
                icon={<Server className="h-12 w-12" />}
                title="No MCP servers"
                description="Add servers to extend capabilities"
              />
            </div>
          )
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
