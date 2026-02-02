import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sparkles, Plug, Loader2 } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useSkillsStore } from '@/stores/skillsStore';
import { useMcpsStore } from '@/stores/mcpsStore';
import PageHeader from '@/components/layout/PageHeader';
import SkillItem from '@/components/skills/SkillItem';
import { McpItem } from '@/components/mcps/McpItem';
import { FilteredEmptyState } from '@/components/common/FilteredEmptyState';
import Button from '@/components/common/Button';

// ============================================================================
// TagPage Component
// ============================================================================
// Displays all Skills and MCPs that have a specific tag.
// Route: /tag/:tagId

export function TagPage() {
  const { tagId } = useParams<{ tagId: string }>();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  // Get data from stores
  const { tags } = useAppStore();
  const { skills, toggleSkill, autoClassify, isClassifying } = useSkillsStore();
  const { mcpServers, toggleMcp } = useMcpsStore();

  // Find the current tag
  const tag = tags.find((t) => t.id === tagId);
  // Get tag name for filtering (skill.tags stores tag names, not ids)
  const tagName = tag?.name;

  // Filter skills and MCPs that have this tag (using tag name, not id)
  const filteredSkills = skills.filter((s) =>
    tagName && s.tags.includes(tagName)
  );
  const filteredMcps = mcpServers.filter((m) =>
    tagName && m.tags.includes(tagName)
  );

  // Apply search filter
  const searchLower = search.toLowerCase();
  const displayedSkills = search
    ? filteredSkills.filter(
        (skill) =>
          skill.name.toLowerCase().includes(searchLower) ||
          skill.description.toLowerCase().includes(searchLower)
      )
    : filteredSkills;

  const displayedMcps = search
    ? filteredMcps.filter(
        (mcp) =>
          mcp.name.toLowerCase().includes(searchLower) ||
          mcp.description.toLowerCase().includes(searchLower)
      )
    : filteredMcps;

  // Handlers
  const handleSkillClick = (skillId: string) => {
    navigate(`/skills/${encodeURIComponent(skillId)}`);
  };

  const handleSkillToggle = (skillId: string) => {
    toggleSkill(skillId);
  };

  const handleMcpClick = (mcpId: string) => {
    navigate(`/mcp-servers/${encodeURIComponent(mcpId)}`);
  };

  const handleMcpToggle = (mcpId: string) => {
    toggleMcp(mcpId);
  };

  const handleAutoClassify = async () => {
    await autoClassify();
  };

  // Empty state - no items with this tag at all
  if (filteredSkills.length === 0 && filteredMcps.length === 0) {
    return (
      <div className="flex h-full flex-col">
        <PageHeader
          title={tag?.name || 'Unknown Tag'}
          searchValue=""
          onSearchChange={() => {}}
          searchPlaceholder="Search..."
        />
        <div className="flex-1">
          <FilteredEmptyState type="tag" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <PageHeader
        title={tag?.name || 'Unknown Tag'}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search..."
        actions={
          <Button
            variant="secondary"
            size="small"
            icon={isClassifying ? <Loader2 className="animate-spin" /> : <Sparkles />}
            onClick={handleAutoClassify}
            disabled={isClassifying}
          >
            {isClassifying ? 'Classifying...' : 'Auto Classify'}
          </Button>
        }
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-7 py-6">
        <div className="flex flex-col gap-8">
          {/* Skills Section */}
          {displayedSkills.length > 0 && (
            <section className="flex flex-col gap-3">
              {/* Section Header */}
              <div className="flex items-center gap-2 pb-2">
                <Sparkles size={14} className="text-[#71717A]" />
                <span className="text-xs font-semibold text-[#71717A]">
                  Skills ({displayedSkills.length})
                </span>
              </div>
              {/* Skills List */}
              <div className="flex flex-col gap-3">
                {displayedSkills.map((skill) => (
                  <SkillItem
                    key={skill.id}
                    skill={skill}
                    variant="full"
                    onClick={() => handleSkillClick(skill.id)}
                    onToggle={() => handleSkillToggle(skill.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* MCP Servers Section */}
          {displayedMcps.length > 0 && (
            <section className="flex flex-col gap-3">
              {/* Section Header */}
              <div className="flex items-center gap-2 pb-2">
                <Plug size={14} className="text-[#71717A]" />
                <span className="text-xs font-semibold text-[#71717A]">
                  MCP Servers ({displayedMcps.length})
                </span>
              </div>
              {/* MCP List */}
              <div className="flex flex-col gap-3">
                {displayedMcps.map((mcp) => (
                  <McpItem
                    key={mcp.id}
                    mcp={mcp}
                    onClick={() => handleMcpClick(mcp.id)}
                    onToggle={() => handleMcpToggle(mcp.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Empty search results */}
          {displayedSkills.length === 0 && displayedMcps.length === 0 && search && (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-sm text-[#71717A]">
                No results found for "{search}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TagPage;
