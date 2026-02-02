import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sparkles, Plug, Loader2 } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import SkillItem from '../components/skills/SkillItem';
import { McpItem } from '../components/mcps/McpItem';
import { FilteredEmptyState } from '../components/common/FilteredEmptyState';
import Button from '../components/common/Button';
import { useAppStore } from '../stores/appStore';
import { useSkillsStore } from '../stores/skillsStore';
import { useMcpsStore } from '../stores/mcpsStore';

// ============================================================================
// CategoryPage Component
// ============================================================================
// Independent aggregation page showing all Skills and MCPs under a Category

export function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  // Get data from stores
  const { categories } = useAppStore();
  const { skills, toggleSkill, autoClassify, isClassifying } = useSkillsStore();
  const { mcpServers, toggleMcp } = useMcpsStore();

  // Find current category
  const category = categories.find((c) => c.id === categoryId);
  // Get category name for filtering (skill.category stores name, not id)
  const categoryName = category?.name;

  // Filter skills and mcps by category name, then by search
  const filteredData = useMemo(() => {
    // First filter by category name (skill.category stores the category name, not id)
    const categorySkills = skills.filter((s) => s.category === categoryName);
    const categoryMcps = mcpServers.filter((m) => m.category === categoryName);

    // Then filter by search if search is active
    if (!search) {
      return {
        skills: categorySkills,
        mcps: categoryMcps,
      };
    }

    const searchLower = search.toLowerCase();
    return {
      skills: categorySkills.filter(
        (skill) =>
          skill.name.toLowerCase().includes(searchLower) ||
          skill.description.toLowerCase().includes(searchLower)
      ),
      mcps: categoryMcps.filter(
        (mcp) =>
          mcp.name.toLowerCase().includes(searchLower) ||
          mcp.description.toLowerCase().includes(searchLower)
      ),
    };
  }, [skills, mcpServers, categoryName, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleSkillClick = (skillId: string) => {
    navigate(`/skills/${encodeURIComponent(skillId)}`);
  };

  const handleMcpClick = (mcpId: string) => {
    navigate(`/mcp-servers/${encodeURIComponent(mcpId)}`);
  };

  const handleSkillToggle = (skillId: string, _enabled: boolean) => {
    toggleSkill(skillId);
  };

  const handleMcpToggle = (mcpId: string) => {
    toggleMcp(mcpId);
  };

  const handleAutoClassify = async () => {
    await autoClassify();
  };

  const isEmpty = filteredData.skills.length === 0 && filteredData.mcps.length === 0;
  const displayCategoryName = categoryName || 'Unknown Category';

  // Empty state
  if (isEmpty && !search) {
    return (
      <div className="flex h-full flex-col">
        <PageHeader
          title={displayCategoryName}
          searchValue={search}
          onSearchChange={handleSearchChange}
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
        <div className="flex-1">
          <FilteredEmptyState type="category" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <PageHeader
        title={displayCategoryName}
        searchValue={search}
        onSearchChange={handleSearchChange}
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
        {isEmpty ? (
          // Search returned no results
          <FilteredEmptyState type="category" />
        ) : (
          <div className="flex flex-col gap-8">
            {/* Skills Section */}
            {filteredData.skills.length > 0 && (
              <section className="flex flex-col gap-3">
                {/* Section Header */}
                <div className="flex items-center gap-2 pb-2">
                  <Sparkles size={14} className="text-[#71717A]" />
                  <span className="text-xs font-semibold text-[#71717A]">
                    Skills ({filteredData.skills.length})
                  </span>
                </div>
                {/* Skill Items */}
                <div className="flex flex-col gap-3">
                  {filteredData.skills.map((skill) => (
                    <SkillItem
                      key={skill.id}
                      skill={skill}
                      variant="full"
                      onClick={() => handleSkillClick(skill.id)}
                      onToggle={(enabled) => handleSkillToggle(skill.id, enabled)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* MCP Section */}
            {filteredData.mcps.length > 0 && (
              <section className="flex flex-col gap-3">
                {/* Section Header */}
                <div className="flex items-center gap-2 pb-2">
                  <Plug size={14} className="text-[#71717A]" />
                  <span className="text-xs font-semibold text-[#71717A]">
                    MCP Servers ({filteredData.mcps.length})
                  </span>
                </div>
                {/* MCP Items */}
                <div className="flex flex-col gap-3">
                  {filteredData.mcps.map((mcp) => (
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
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryPage;
