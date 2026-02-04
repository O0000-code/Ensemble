import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Sparkles, Plug, FileText } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import { SkillListItem } from '../components/skills/SkillListItem';
import { SkillDetailPanel } from '../components/skills/SkillDetailPanel';
import { McpListItem } from '../components/mcps/McpListItem';
import { McpDetailPanel } from '../components/mcps/McpDetailPanel';
import { ClaudeMdCard } from '../components/claude-md/ClaudeMdCard';
import { ClaudeMdDetailPanel } from '../components/claude-md/ClaudeMdDetailPanel';
import { FilteredEmptyState } from '../components/common/FilteredEmptyState';
import Button from '../components/common/Button';
import { useAppStore } from '../stores/appStore';
import { useSkillsStore } from '../stores/skillsStore';
import { useMcpsStore } from '../stores/mcpsStore';
import { useClaudeMdStore } from '../stores/claudeMdStore';
import type { Skill } from '../types';

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
  const [selectedClaudeMdId, setSelectedClaudeMdId] = useState<string | null>(null);

  // Get data from stores
  const { categories } = useAppStore();
  const { skills, deleteSkill, autoClassify, isClassifying } = useSkillsStore();
  const { mcpServers, deleteMcp } = useMcpsStore();
  const { files: claudeMdFiles, deleteFile: deleteClaudeMd } = useClaudeMdStore();

  // Find current category
  const category = categories.find((c) => c.id === categoryId);
  // Get category name for filtering (skill.category stores name, not id)
  const categoryName = category?.name;

  // Get selected skill/mcp/claudeMd objects
  const selectedSkill = useMemo(
    () => skills.find((s) => s.id === selectedSkillId) || null,
    [skills, selectedSkillId]
  );
  const selectedMcp = useMemo(
    () => mcpServers.find((m) => m.id === selectedMcpId) || null,
    [mcpServers, selectedMcpId]
  );
  const selectedClaudeMd = useMemo(
    () => claudeMdFiles.find((f) => f.id === selectedClaudeMdId) || null,
    [claudeMdFiles, selectedClaudeMdId]
  );

  // Filter skills, mcps, and claudeMd by category, then by search
  const filteredData = useMemo(() => {
    // First filter by category name (skill.category stores the category name, not id)
    // For claudeMd, filter by categoryId (claudeMd uses ID, not name)
    const categorySkills = skills.filter((s) => s.category === categoryName);
    const categoryMcps = mcpServers.filter((m) => m.category === categoryName);
    const categoryClaudeMd = claudeMdFiles.filter((f) => f.categoryId === categoryId);

    // Then filter by search if search is active
    if (!search) {
      return {
        skills: categorySkills,
        mcps: categoryMcps,
        claudeMd: categoryClaudeMd,
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
      claudeMd: categoryClaudeMd.filter(
        (file) =>
          file.name.toLowerCase().includes(searchLower) ||
          file.description.toLowerCase().includes(searchLower)
      ),
    };
  }, [skills, mcpServers, claudeMdFiles, categoryName, categoryId, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleSkillClick = (skill: Skill) => {
    setSelectedSkillId(skill.id);
    setSelectedMcpId(null);
    setSelectedClaudeMdId(null);
  };

  const handleMcpClick = (mcpId: string) => {
    setSelectedMcpId(mcpId);
    setSelectedSkillId(null);
    setSelectedClaudeMdId(null);
  };

  const handleClaudeMdClick = (fileId: string) => {
    setSelectedClaudeMdId(fileId);
    setSelectedSkillId(null);
    setSelectedMcpId(null);
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

  const handleClaudeMdDelete = (fileId: string) => {
    deleteClaudeMd(fileId);
    if (selectedClaudeMdId === fileId) {
      setSelectedClaudeMdId(null);
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

  const handleCloseClaudeMdPanel = () => {
    setSelectedClaudeMdId(null);
  };

  const isEmpty = filteredData.skills.length === 0 && filteredData.mcps.length === 0 && filteredData.claudeMd.length === 0;
  const displayCategoryName = categoryName || 'Unknown Category';

  // Check if any panel is open for layout adjustment
  const isPanelOpen = !!selectedSkillId || !!selectedMcpId || !!selectedClaudeMdId;

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
              icon={isClassifying ? <span className="ai-spinner" /> : <Sparkles />}
              onClick={handleAutoClassify}
              disabled={isClassifying}
              className={`w-[132px] ${isClassifying ? 'ai-classifying' : ''}`}
            >
              {isClassifying ? (
                <span className="ai-classifying-text">Classifying...</span>
              ) : 'Auto Classify'}
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
            icon={isClassifying ? <span className="ai-spinner" /> : <Sparkles />}
            onClick={handleAutoClassify}
            disabled={isClassifying}
            className={`w-[132px] ${isClassifying ? 'ai-classifying' : ''}`}
          >
            {isClassifying ? (
              <span className="ai-classifying-text">Classifying...</span>
            ) : 'Auto Classify'}
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

            {/* CLAUDE.md Section */}
            {filteredData.claudeMd.length > 0 && (
              <section className="flex flex-col gap-3">
                {/* Section Header */}
                <div className="flex items-center gap-2 pb-2">
                  <FileText size={14} className="text-[#71717A]" />
                  <span className="text-xs font-semibold text-[#71717A]">
                    CLAUDE.md Files ({filteredData.claudeMd.length})
                  </span>
                </div>
                {/* CLAUDE.md Items */}
                <div className="flex flex-col gap-3">
                  {filteredData.claudeMd.map((file) => (
                    <ClaudeMdCard
                      key={file.id}
                      file={file}
                      compact={isPanelOpen}
                      onClick={() => handleClaudeMdClick(file.id)}
                      onDelete={() => handleClaudeMdDelete(file.id)}
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

      {/* CLAUDE.md Detail Panel - Always render, control visibility with isOpen */}
      <ClaudeMdDetailPanel
        file={selectedClaudeMd}
        isOpen={!!selectedClaudeMdId}
        onClose={handleCloseClaudeMdPanel}
      />
    </div>
  );
}

export default CategoryPage;
