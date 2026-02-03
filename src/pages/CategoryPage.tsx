import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Sparkles, Plug, Loader2 } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import { SkillListItem } from '../components/skills/SkillListItem';
import { SkillDetailPanel } from '../components/skills/SkillDetailPanel';
import { McpListItem } from '../components/mcps/McpListItem';
import { McpDetailPanel } from '../components/mcps/McpDetailPanel';
import { FilteredEmptyState } from '../components/common/FilteredEmptyState';
import Button from '../components/common/Button';
import { useAppStore } from '../stores/appStore';
import { useSkillsStore } from '../stores/skillsStore';
import { useMcpsStore } from '../stores/mcpsStore';
import type { Skill, McpServer } from '../types';

// ============================================================================
// CategoryPage Component
// ============================================================================
// Independent aggregation page showing all Skills and MCPs under a Category

export function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [search, setSearch] = useState('');

  // Selected item state for detail panels - track ID only
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [selectedMcpId, setSelectedMcpId] = useState<string | null>(null);

  // Get data from stores
  const { categories } = useAppStore();
  const { skills, deleteSkill, autoClassify, isClassifying } = useSkillsStore();
  const { mcpServers, deleteMcp } = useMcpsStore();

  // Find current category
  const category = categories.find((c) => c.id === categoryId);
  // Get category name for filtering (skill.category stores name, not id)
  const categoryName = category?.name;

  // Get selected skill/mcp objects
  const selectedSkill = useMemo(
    () => skills.find((s) => s.id === selectedSkillId) || null,
    [skills, selectedSkillId]
  );
  const selectedMcp = useMemo(
    () => mcpServers.find((m) => m.id === selectedMcpId) || null,
    [mcpServers, selectedMcpId]
  );

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

  const handleSkillClick = (skill: Skill) => {
    setSelectedSkillId(skill.id);
    setSelectedMcpId(null); // Close MCP panel if open
  };

  const handleMcpClick = (mcpId: string) => {
    setSelectedMcpId(mcpId);
    setSelectedSkillId(null); // Close Skill panel if open
  };

  const handleSkillDelete = (skillId: string) => {
    deleteSkill(skillId);
    if (selectedSkillId === skillId) {
      setSelectedSkillId(null);
    }
  };

  const handleMcpDelete = (mcpId: string) => {
    deleteMcp(mcpId);
    if (selectedMcpId === mcpId) {
      setSelectedMcpId(null);
    }
  };

  const handleAutoClassify = async () => {
    await autoClassify();
  };

  const handleCloseSkillPanel = () => {
    setSelectedSkillId(null);
  };

  const handleCloseMcpPanel = () => {
    setSelectedMcpId(null);
  };

  const isEmpty = filteredData.skills.length === 0 && filteredData.mcps.length === 0;
  const displayCategoryName = categoryName || 'Unknown Category';

  // Check if any panel is open for layout adjustment
  const isPanelOpen = !!selectedSkillId || !!selectedMcpId;

  // Empty state
  if (isEmpty && !search) {
    return (
      <div className="relative flex h-full flex-col overflow-hidden">
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
    <div className="relative flex h-full flex-col overflow-hidden">
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

      {/* Content - with shrink animation matching SkillsPage */}
      <div
        className={`
          flex-1 overflow-y-auto px-7 py-6
          transition-[margin-right] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isPanelOpen ? 'mr-[800px]' : ''}
        `}
      >
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
                    <SkillListItem
                      key={skill.id}
                      skill={skill}
                      compact={isPanelOpen}
                      selected={selectedSkillId === skill.id}
                      onClick={() => handleSkillClick(skill)}
                      onDelete={() => handleSkillDelete(skill.id)}
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
                    <McpListItem
                      key={mcp.id}
                      mcp={mcp}
                      compact={isPanelOpen}
                      selected={selectedMcpId === mcp.id}
                      onClick={handleMcpClick}
                      onDelete={() => handleMcpDelete(mcp.id)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* Skill Detail Panel - Always render, control visibility with isOpen */}
      <SkillDetailPanel
        skill={selectedSkill}
        isOpen={!!selectedSkillId}
        onClose={handleCloseSkillPanel}
      />

      {/* MCP Detail Panel - Always render, control visibility with isOpen */}
      <McpDetailPanel
        mcp={selectedMcp}
        isOpen={!!selectedMcpId}
        onClose={handleCloseMcpPanel}
      />
    </div>
  );
}

export default CategoryPage;
