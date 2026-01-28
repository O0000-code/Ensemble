import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Sparkles,
  Plug,
  Search,
  CheckSquare,
  Check,
  ChevronDown,
  ChevronRight,
  Code,
  Database,
  Globe,
  FileCode,
  Zap,
} from 'lucide-react';
import { Skill, McpServer } from '@/types';
import { Dropdown } from '@/components/common/Dropdown';

// ============================================================================
// Types
// ============================================================================

interface CreateSceneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateScene: (scene: {
    name: string;
    description: string;
    skillIds: string[];
    mcpIds: string[];
  }) => void;
  skills: Skill[];
  mcpServers: McpServer[];
}

type TabType = 'skills' | 'mcps';

// ============================================================================
// Icon Mapping for Skills/MCPs
// ============================================================================

const skillIconMap: Record<string, React.FC<{ className?: string }>> = {
  Development: Code,
  Design: Zap,
  Research: Globe,
  Productivity: FileCode,
  default: Sparkles,
};

const mcpIconMap: Record<string, React.FC<{ className?: string }>> = {
  Development: Code,
  Research: Globe,
  default: Database,
};

const getSkillIcon = (category: string) => skillIconMap[category] || skillIconMap.default;
const getMcpIcon = (category: string) => mcpIconMap[category] || mcpIconMap.default;

// ============================================================================
// Checkbox Item Component
// ============================================================================

interface CheckableItemProps {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  selected: boolean;
  type: 'skill' | 'mcp';
  onToggle: (id: string) => void;
}

const CheckableItem: React.FC<CheckableItemProps> = ({
  id,
  name,
  description,
  category,
  tags,
  selected,
  type,
  onToggle,
}) => {
  const IconComponent = type === 'skill' ? getSkillIcon(category) : getMcpIcon(category);

  return (
    <div
      onClick={() => onToggle(id)}
      className={`
        flex
        cursor-pointer
        items-center
        gap-3.5
        rounded-lg
        border
        px-4
        py-3.5
        transition-colors
        ${selected
          ? 'border-[#18181B] bg-[#FAFAFA]'
          : 'border-[#E5E5E5] bg-white hover:bg-[#FAFAFA]'
        }
      `}
    >
      {/* Checkbox */}
      <div
        className={`
          flex
          h-5
          w-5
          flex-shrink-0
          items-center
          justify-center
          rounded
          transition-colors
          ${selected ? 'bg-[#18181B]' : 'border-2 border-[#D4D4D4]'}
        `}
      >
        {selected && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
      </div>

      {/* Icon Container */}
      <div
        className={`
          flex
          h-9
          w-9
          flex-shrink-0
          items-center
          justify-center
          rounded-lg
          ${selected ? 'bg-white' : 'bg-[#FAFAFA]'}
        `}
      >
        <IconComponent
          className={`h-[18px] w-[18px] ${selected ? 'text-[#18181B]' : 'text-[#52525B]'}`}
        />
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span
          className={`
            text-[13px]
            ${selected ? 'font-semibold text-[#18181B]' : 'font-medium text-[#18181B]'}
          `}
        >
          {name}
        </span>
        <span
          className={`
            truncate text-xs font-normal
            ${selected ? 'text-[#52525B]' : 'text-[#71717A]'}
          `}
        >
          {description}
        </span>
      </div>

      {/* Tags */}
      <div className="flex flex-shrink-0 items-center gap-1.5">
        {tags.slice(0, 2).map((tag, index) => (
          <span
            key={tag}
            className={`
              rounded
              px-2
              py-[3px]
              text-[10px]
              font-medium
              ${selected && index === 0
                ? 'bg-white text-[#18181B]'
                : 'bg-[#FAFAFA] text-[#52525B]'
              }
            `}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// Selected Item Component
// ============================================================================

interface SelectedItemProps {
  id: string;
  name: string;
  type: 'skill' | 'mcp';
  onRemove: (id: string) => void;
}

const SelectedItem: React.FC<SelectedItemProps> = ({ id, name, type, onRemove }) => {
  const isSkill = type === 'skill';

  return (
    <div className="flex items-center justify-between rounded-md border border-[#E5E5E5] bg-white px-3 py-2.5">
      <div className="flex items-center gap-2.5">
        {/* Icon */}
        <div
          className={`
            flex
            h-6
            w-6
            items-center
            justify-center
            rounded
            ${isSkill ? 'bg-[#F4F4F5]' : 'bg-[#DCFCE7]'}
          `}
        >
          {isSkill ? (
            <Sparkles className="h-3 w-3 text-[#18181B]" />
          ) : (
            <Plug className="h-3 w-3 text-[#16A34A]" />
          )}
        </div>
        <span className="text-xs font-medium text-[#18181B]">{name}</span>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => onRemove(id)}
        className="flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-[#FEE2E2] group"
      >
        <X className="h-3 w-3 text-[#A1A1AA] group-hover:text-[#DC2626]" />
      </button>
    </div>
  );
};

// ============================================================================
// Collapsible Group Component
// ============================================================================

interface CollapsibleGroupProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  iconColor?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleGroup: React.FC<CollapsibleGroupProps> = ({
  title,
  count,
  icon,
  children,
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-left"
      >
        {isOpen ? (
          <ChevronDown className="h-3.5 w-3.5 text-[#71717A]" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-[#71717A]" />
        )}
        {icon}
        <span className="text-xs font-semibold text-[#18181B]">{title}</span>
        <span className="text-xs font-normal text-[#71717A]">({count})</span>
      </button>

      {/* Content */}
      {isOpen && <div className="flex flex-col gap-1.5 pl-5">{children}</div>}
    </div>
  );
};

// ============================================================================
// CreateSceneModal Component
// ============================================================================

export const CreateSceneModal: React.FC<CreateSceneModalProps> = ({
  isOpen,
  onClose,
  onCreateScene,
  skills,
  mcpServers,
}) => {
  // Local state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('skills');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [selectedMcpIds, setSelectedMcpIds] = useState<string[]>([]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setActiveTab('skills');
      setSearchQuery('');
      setCategoryFilter('');
      setTagFilter([]);
      setSelectedSkillIds([]);
      setSelectedMcpIds([]);
    }
  }, [isOpen]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Get unique categories and tags
  const categories = useMemo(() => {
    const items = activeTab === 'skills' ? skills : mcpServers;
    const uniqueCategories = [...new Set(items.map((item) => item.category))];
    return uniqueCategories.map((cat) => ({
      value: cat,
      label: cat,
      count: items.filter((item) => item.category === cat).length,
    }));
  }, [activeTab, skills, mcpServers]);

  const tags = useMemo(() => {
    const items = activeTab === 'skills' ? skills : mcpServers;
    const allTags = items.flatMap((item) => item.tags);
    const tagCounts = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(tagCounts).map(([tag, count]) => ({
      value: tag,
      label: tag,
      count,
    }));
  }, [activeTab, skills, mcpServers]);

  // Filter items
  const filteredItems = useMemo(() => {
    const items = activeTab === 'skills' ? skills : mcpServers;
    return items.filter((item) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !item.name.toLowerCase().includes(query) &&
          !item.description.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // Category filter
      if (categoryFilter && item.category !== categoryFilter) {
        return false;
      }

      // Tag filter
      if (tagFilter.length > 0) {
        const hasTag = tagFilter.some((tag) => item.tags.includes(tag));
        if (!hasTag) return false;
      }

      return true;
    });
  }, [activeTab, skills, mcpServers, searchQuery, categoryFilter, tagFilter]);

  // Selection handlers
  const handleToggleSkill = useCallback((id: string) => {
    setSelectedSkillIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const handleToggleMcp = useCallback((id: string) => {
    setSelectedMcpIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (activeTab === 'skills') {
      const allIds = filteredItems.map((item) => item.id);
      const allSelected = allIds.every((id) => selectedSkillIds.includes(id));
      if (allSelected) {
        setSelectedSkillIds((prev) => prev.filter((id) => !allIds.includes(id)));
      } else {
        setSelectedSkillIds((prev) => [...new Set([...prev, ...allIds])]);
      }
    } else {
      const allIds = filteredItems.map((item) => item.id);
      const allSelected = allIds.every((id) => selectedMcpIds.includes(id));
      if (allSelected) {
        setSelectedMcpIds((prev) => prev.filter((id) => !allIds.includes(id)));
      } else {
        setSelectedMcpIds((prev) => [...new Set([...prev, ...allIds])]);
      }
    }
  }, [activeTab, filteredItems, selectedSkillIds, selectedMcpIds]);

  const handleClearAll = useCallback(() => {
    setSelectedSkillIds([]);
    setSelectedMcpIds([]);
  }, []);

  const handleCreate = useCallback(() => {
    if (!name.trim()) return;
    onCreateScene({
      name: name.trim(),
      description: description.trim(),
      skillIds: selectedSkillIds,
      mcpIds: selectedMcpIds,
    });
    onClose();
  }, [name, description, selectedSkillIds, selectedMcpIds, onCreateScene, onClose]);

  // Get selected items for display
  const selectedSkills = useMemo(
    () => skills.filter((s) => selectedSkillIds.includes(s.id)),
    [skills, selectedSkillIds]
  );

  const selectedMcps = useMemo(
    () => mcpServers.filter((m) => selectedMcpIds.includes(m.id)),
    [mcpServers, selectedMcpIds]
  );

  // Check if all filtered items are selected
  const allFilteredSelected = useMemo(() => {
    if (activeTab === 'skills') {
      return filteredItems.every((item) => selectedSkillIds.includes(item.id));
    }
    return filteredItems.every((item) => selectedMcpIds.includes(item.id));
  }, [activeTab, filteredItems, selectedSkillIds, selectedMcpIds]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <div
        className="relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_25px_50px_rgba(0,0,0,0.1)]"
        style={{ maxWidth: '1280px', height: '820px' }}
      >
        {/* Modal Header */}
        <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-[#E5E5E5] px-7">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-[#18181B]">Create New Scene</h2>
            <p className="text-[13px] font-normal text-[#71717A]">
              Configure skills and MCP servers for this development context
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-[#F4F4F5]"
          >
            <X className="h-5 w-5 text-[#71717A]" />
          </button>
        </div>

        {/* Modal Body - Three Column Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Basic Info */}
          <div className="flex w-80 flex-shrink-0 flex-col border-r border-[#E5E5E5]">
            <div className="flex flex-1 flex-col gap-6 p-6">
              {/* Basic Information Section */}
              <div className="flex flex-col gap-5">
                <h3 className="text-sm font-semibold text-[#18181B]">Basic Information</h3>

                {/* Name Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[#52525B]">Scene Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter scene name..."
                    className="h-10 rounded-md border border-[#E5E5E5] bg-white px-3 text-[13px] text-[#18181B] placeholder:text-[#A1A1AA] focus:border-[#18181B] focus:outline-none"
                  />
                </div>

                {/* Description Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[#52525B]">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe this scene..."
                    className="h-20 resize-none rounded-md border border-[#E5E5E5] bg-white p-3 text-xs leading-relaxed text-[#18181B] placeholder:text-[#A1A1AA] focus:border-[#18181B] focus:outline-none"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-[#E4E4E7]" />

              {/* Selection Summary */}
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-semibold text-[#18181B]">Selection Summary</h3>

                {/* Summary Items */}
                <div className="flex flex-col gap-3">
                  {/* Skills */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#71717A]" />
                      <span className="text-[13px] font-normal text-[#52525B]">Skills</span>
                    </div>
                    <span className="rounded bg-[#F4F4F5] px-2.5 py-1 text-xs font-medium text-[#18181B]">
                      {selectedSkillIds.length} selected
                    </span>
                  </div>

                  {/* MCPs */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Plug className="h-4 w-4 text-[#71717A]" />
                      <span className="text-[13px] font-normal text-[#52525B]">MCP Servers</span>
                    </div>
                    <span
                      className={`rounded px-2.5 py-1 text-xs font-medium ${
                        selectedMcpIds.length > 0
                          ? 'bg-[#DCFCE7] text-[#16A34A]'
                          : 'bg-[#F4F4F5] text-[#18181B]'
                      }`}
                    >
                      {selectedMcpIds.length} selected
                    </span>
                  </div>
                </div>
              </div>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleCreate}
                  disabled={!name.trim()}
                  className="flex h-11 items-center justify-center rounded-lg bg-[#18181B] text-sm font-medium text-white transition-colors hover:bg-[#27272A] disabled:cursor-not-allowed disabled:bg-[#18181B]/50"
                >
                  Create Scene
                </button>
                <button
                  onClick={onClose}
                  className="flex h-11 items-center justify-center rounded-lg border border-[#E5E5E5] text-sm font-medium text-[#71717A] transition-colors hover:bg-[#F4F4F5]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>

          {/* Center Panel - Selection */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Center Header */}
            <div className="flex flex-col gap-4 border-b border-[#E5E5E5] px-6 py-4">
              {/* Tabs */}
              <div className="flex items-center">
                {/* Skills Tab */}
                <button
                  onClick={() => setActiveTab('skills')}
                  className={`flex items-center gap-2 px-5 py-2.5 ${
                    activeTab === 'skills'
                      ? 'border-b-2 border-[#18181B]'
                      : 'border-b-2 border-transparent'
                  }`}
                >
                  <Sparkles
                    className={`h-4 w-4 ${
                      activeTab === 'skills' ? 'text-[#18181B]' : 'text-[#71717A]'
                    }`}
                  />
                  <span
                    className={`text-[13px] ${
                      activeTab === 'skills'
                        ? 'font-semibold text-[#18181B]'
                        : 'font-normal text-[#71717A]'
                    }`}
                  >
                    Skills
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      activeTab === 'skills'
                        ? 'bg-[#FAFAFA] text-[#52525B]'
                        : 'bg-[#FAFAFA] text-[#71717A]'
                    }`}
                  >
                    {skills.length}
                  </span>
                </button>

                {/* MCP Servers Tab */}
                <button
                  onClick={() => setActiveTab('mcps')}
                  className={`flex items-center gap-2 px-5 py-2.5 ${
                    activeTab === 'mcps'
                      ? 'border-b-2 border-[#18181B]'
                      : 'border-b-2 border-transparent'
                  }`}
                >
                  <Plug
                    className={`h-4 w-4 ${
                      activeTab === 'mcps' ? 'text-[#18181B]' : 'text-[#71717A]'
                    }`}
                  />
                  <span
                    className={`text-[13px] ${
                      activeTab === 'mcps'
                        ? 'font-semibold text-[#18181B]'
                        : 'font-normal text-[#71717A]'
                    }`}
                  >
                    MCP Servers
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      activeTab === 'mcps'
                        ? 'bg-[#FAFAFA] text-[#52525B]'
                        : 'bg-[#FAFAFA] text-[#71717A]'
                    }`}
                  >
                    {mcpServers.length}
                  </span>
                </button>
              </div>

              {/* Filters Row */}
              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="flex flex-1 items-center gap-2.5 rounded-lg border border-[#E5E5E5] bg-white px-3.5 h-10">
                  <Search className="h-4 w-4 flex-shrink-0 text-[#A1A1AA]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${activeTab === 'skills' ? 'skills' : 'MCP servers'}...`}
                    className="flex-1 bg-transparent text-[13px] text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none"
                  />
                </div>

                {/* Category Filter */}
                <Dropdown
                  options={[{ value: '', label: 'All Categories' }, ...categories]}
                  value={categoryFilter}
                  onChange={(val) => setCategoryFilter(val as string)}
                  placeholder="Category"
                  compact
                  triggerClassName="w-[140px]"
                />

                {/* Tag Filter */}
                <Dropdown
                  options={tags}
                  value={tagFilter}
                  onChange={(val) => setTagFilter(val as string[])}
                  placeholder="Tags"
                  multiple
                  searchable
                  compact
                  triggerClassName="w-[120px]"
                />

                {/* Select All Button */}
                <button
                  onClick={handleSelectAll}
                  className="flex h-10 items-center gap-1.5 rounded-lg bg-[#FAFAFA] px-3.5 text-xs font-medium text-[#52525B] transition-colors hover:bg-[#F4F4F5]"
                >
                  <CheckSquare className="h-3.5 w-3.5" />
                  {allFilteredSelected ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            </div>

            {/* Center Content - Checkable List */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="flex flex-col gap-2">
                {filteredItems.map((item) => (
                  <CheckableItem
                    key={item.id}
                    id={item.id}
                    name={item.name}
                    description={item.description}
                    category={item.category}
                    tags={item.tags}
                    selected={
                      activeTab === 'skills'
                        ? selectedSkillIds.includes(item.id)
                        : selectedMcpIds.includes(item.id)
                    }
                    type={activeTab === 'skills' ? 'skill' : 'mcp'}
                    onToggle={activeTab === 'skills' ? handleToggleSkill : handleToggleMcp}
                  />
                ))}

                {filteredItems.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Search className="h-8 w-8 text-[#D4D4D8]" />
                    <p className="mt-3 text-sm font-medium text-[#71717A]">No items found</p>
                    <p className="mt-1 text-xs text-[#A1A1AA]">
                      Try adjusting your search or filters
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Selected Items */}
          <div className="flex w-80 flex-shrink-0 flex-col border-l border-[#E5E5E5]">
            {/* Right Header */}
            <div className="flex h-14 items-center justify-between border-b border-[#E5E5E5] px-5">
              <span className="text-sm font-semibold text-[#18181B]">Selected Items</span>
              {(selectedSkillIds.length > 0 || selectedMcpIds.length > 0) && (
                <button
                  onClick={handleClearAll}
                  className="rounded px-2.5 py-1 text-[11px] font-medium text-[#DC2626] transition-colors hover:bg-[#FEE2E2]"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Right Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-col gap-4">
                {/* Skills Group */}
                <CollapsibleGroup
                  title="Skills"
                  count={selectedSkills.length}
                  icon={<Sparkles className="h-3.5 w-3.5 text-[#18181B]" />}
                >
                  {selectedSkills.length > 0 ? (
                    selectedSkills.map((skill) => (
                      <SelectedItem
                        key={skill.id}
                        id={skill.id}
                        name={skill.name}
                        type="skill"
                        onRemove={handleToggleSkill}
                      />
                    ))
                  ) : (
                    <p className="py-2 text-xs text-[#A1A1AA]">No skills selected</p>
                  )}
                </CollapsibleGroup>

                {/* MCPs Group */}
                <CollapsibleGroup
                  title="MCP Servers"
                  count={selectedMcps.length}
                  icon={<Plug className="h-3.5 w-3.5 text-[#16A34A]" />}
                >
                  {selectedMcps.length > 0 ? (
                    selectedMcps.map((mcp) => (
                      <SelectedItem
                        key={mcp.id}
                        id={mcp.id}
                        name={mcp.name}
                        type="mcp"
                        onRemove={handleToggleMcp}
                      />
                    ))
                  ) : (
                    <p className="py-2 text-xs text-[#A1A1AA]">No MCP servers selected</p>
                  )}
                </CollapsibleGroup>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CreateSceneModal;
