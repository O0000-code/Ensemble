import React, { useMemo, useState } from 'react';
import { safeInvoke } from '@/utils/tauri';
import type { Scene } from '@/types';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Layers,
  Pencil,
  Trash2,
  Folder,
  AlertTriangle,
  Code,
  Server,
  BarChart,
  Cloud,
  FileText,
  BookOpen,
  Smartphone,
  Database,
  Globe,
  Zap,
  FileCode,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { SlidePanel } from '@/components/layout/SlidePanel';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import { IconPicker } from '@/components/common';
import { SceneListItem } from '@/components/scenes/SceneListItem';
import { CreateSceneModal } from '@/components/scenes/CreateSceneModal';
import { useScenesStore } from '@/stores/scenesStore';
import { useSkillsStore } from '@/stores/skillsStore';
import { useMcpsStore } from '@/stores/mcpsStore';
import type { Skill, McpServer } from '@/types';

// ============================================================================
// Types & Constants
// ============================================================================

const sceneIconMap: Record<string, React.FC<{ className?: string }>> = {
  layers: Layers,
  code: Code,
  server: Server,
  'bar-chart': BarChart,
  cloud: Cloud,
  'file-text': FileText,
  'book-open': BookOpen,
  smartphone: Smartphone,
};

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

const getSceneIcon = (iconName: string) => sceneIconMap[iconName] || Layers;
const getSkillIcon = (category: string) => skillIconMap[category] || skillIconMap.default;
const getMcpIcon = (category: string) => mcpIconMap[category] || mcpIconMap.default;

// Mock projects data
const mockProjects = [
  { id: 'proj-1', name: 'Ensemble App', sceneId: 'scene-1' },
  { id: 'proj-2', name: 'Marketing Site', sceneId: 'scene-1' },
  { id: 'proj-3', name: 'API Gateway', sceneId: 'scene-2' },
  { id: 'proj-4', name: 'Analytics Dashboard', sceneId: 'scene-3' },
  { id: 'proj-5', name: 'Mobile App', sceneId: 'scene-7' },
];

// Format date
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// ============================================================================
// Item Components
// ============================================================================

interface IncludedItemProps {
  icon: React.ReactNode;
  name: string;
  description: string;
  isLast: boolean;
}

const IncludedItem: React.FC<IncludedItemProps> = ({ icon, name, description, isLast }) => (
  <div
    className={`flex items-center gap-3 px-3.5 py-3 ${!isLast ? 'border-b border-[#E5E5E5]' : ''}`}
  >
    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-[#F4F4F5]">
      {icon}
    </div>
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="text-[13px] font-medium text-[#18181B]">{name}</span>
      <span className="truncate text-[11px] font-normal text-[#71717A]">{description}</span>
    </div>
  </div>
);

interface ProjectChipProps {
  name: string;
  onClick?: () => void;
}

const ProjectChip: React.FC<ProjectChipProps> = ({ name, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 rounded-md border border-[#E5E5E5] px-3.5 py-2 transition-colors hover:bg-[#FAFAFA]"
  >
    <Folder className="h-3.5 w-3.5 text-[#52525B]" />
    <span className="text-xs font-medium text-[#18181B]">{name}</span>
  </button>
);

// ============================================================================
// ScenesPage Component
// ============================================================================

/**
 * ScenesPage Component
 *
 * Displays the list of scenes with search and create functionality.
 * Now includes a sliding detail panel instead of navigating to a separate page.
 *
 * Layout:
 * - PageHeader: Title "Scenes" + Search + "+ New Scene" button
 * - Content: SceneCard grid (vertical list) with optional sliding detail panel
 * - Empty state when no scenes exist
 */
export const ScenesPage: React.FC = () => {
  const navigate = useNavigate();

  // Store state
  const scenes = useScenesStore((state) => state.scenes);
  const deleteScene = useScenesStore((state) => state.deleteScene);
  const filter = useScenesStore((state) => state.filter);
  const setFilter = useScenesStore((state) => state.setFilter);
  const skills = useSkillsStore((state) => state.skills);
  const mcpServers = useMcpsStore((state) => state.mcpServers);

  // Local state - selected scene for detail panel
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Icon Picker state
  const [iconPickerState, setIconPickerState] = useState<{
    isOpen: boolean;
    sceneId: string | null;
    triggerRef: React.RefObject<HTMLDivElement> | null;
  }>({ isOpen: false, sceneId: null, triggerRef: null });

  // Filter scenes based on search
  const filteredScenes = useMemo(() => {
    if (!filter.search) return scenes;

    const query = filter.search.toLowerCase();
    return scenes.filter(
      (scene) =>
        scene.name.toLowerCase().includes(query) ||
        scene.description.toLowerCase().includes(query)
    );
  }, [scenes, filter.search]);

  // Get selected scene
  const selectedScene = useMemo(
    () => scenes.find((s) => s.id === selectedSceneId) || null,
    [scenes, selectedSceneId]
  );

  // Get skills and MCPs for selected scene
  const includedSkills = useMemo((): Skill[] => {
    if (!selectedScene) return [];
    return skills.filter((s) => selectedScene.skillIds.includes(s.id));
  }, [selectedScene, skills]);

  const includedMcps = useMemo((): McpServer[] => {
    if (!selectedScene) return [];
    return mcpServers.filter((m) => selectedScene.mcpIds.includes(m.id));
  }, [selectedScene, mcpServers]);

  // Get projects using this scene
  const usingProjects = useMemo(() => {
    if (!selectedScene) return [];
    return mockProjects.filter((p) => p.sceneId === selectedScene.id);
  }, [selectedScene]);

  // Handle scene click - now sets selected state instead of navigating
  const handleSceneClick = (sceneId: string) => {
    setSelectedSceneId(sceneId);
  };

  // Handle close detail panel
  const handleCloseDetail = () => {
    setSelectedSceneId(null);
  };

  // Handle create scene - calls backend to persist
  const handleCreateScene = async (sceneData: {
    name: string;
    description: string;
    skillIds: string[];
    mcpIds: string[];
  }) => {
    console.log('handleCreateScene called with:', sceneData);

    try {
      // Directly call Tauri backend with snake_case parameters
      console.log('Calling safeInvoke add_scene...');
      const newScene = await safeInvoke<Scene>('add_scene', {
        name: sceneData.name.trim(),
        description: sceneData.description.trim(),
        icon: 'layers',
        skillIds: sceneData.skillIds,
        mcpIds: sceneData.mcpIds,
      });
      console.log('safeInvoke result:', newScene);

      if (newScene) {
        // Update local state with the new scene from backend
        useScenesStore.getState().setScenes([...scenes, newScene]);
        setSelectedSceneId(newScene.id);
      } else {
        console.warn('newScene is null or undefined');
      }
    } catch (error) {
      console.error('Failed to create scene:', error);
    }

    setIsCreateModalOpen(false);
  };

  // Handle delete
  const handleDelete = () => {
    if (!selectedScene) return;
    if (usingProjects.length > 0) {
      alert('Cannot delete a scene that is being used by projects.');
      return;
    }
    if (confirm(`Are you sure you want to delete "${selectedScene.name}"?`)) {
      deleteScene(selectedScene.id);
      setSelectedSceneId(null); // Clear selection after delete
    }
  };

  // Handle icon click
  const handleIconClick = (sceneId: string, ref: React.RefObject<HTMLDivElement>) => {
    setIconPickerState({ isOpen: true, sceneId, triggerRef: ref });
  };

  // Handle icon change
  const handleIconChange = (iconName: string) => {
    if (iconPickerState.sceneId) {
      const scene = scenes.find((s) => s.id === iconPickerState.sceneId);
      if (scene) {
        const updatedScenes = scenes.map((s) =>
          s.id === iconPickerState.sceneId ? { ...s, icon: iconName } : s
        );
        useScenesStore.getState().setScenes(updatedScenes);
      }
    }
    setIconPickerState({ isOpen: false, sceneId: null, triggerRef: null });
  };

  // Handle icon picker close
  const handleIconPickerClose = () => {
    setIconPickerState({ isOpen: false, sceneId: null, triggerRef: null });
  };

  // Get scene icon component for detail header
  const SceneIconComponent = selectedScene ? getSceneIcon(selectedScene.icon) : Layers;

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      {/* Page Header */}
      <PageHeader
        title="Scenes"
        searchValue={filter.search}
        onSearchChange={(value) => setFilter({ search: value })}
        searchPlaceholder="Search scenes..."
        actions={
          <Button
            variant="primary"
            size="small"
            icon={<Plus />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            New Scene
          </Button>
        }
      />

      {/* Content - with shrink animation when panel is open */}
      <div
        className={`
          flex-1 overflow-y-auto p-6 px-7
          transition-[margin-right] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]
          ${selectedSceneId ? 'mr-[800px]' : ''}
        `}
      >
        {filteredScenes.length > 0 ? (
          /* Scene List - Unified SceneListItem with animated compact mode */
          <div
            className="flex flex-col"
            style={{
              gap: selectedSceneId ? '4px' : '12px',
              transition: 'gap 250ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {filteredScenes.map((scene) => (
              <SceneListItem
                key={scene.id}
                scene={scene}
                compact={!!selectedSceneId}
                selected={scene.id === selectedSceneId}
                onClick={() => handleSceneClick(scene.id)}
                onIconClick={(ref) => handleIconClick(scene.id, ref)}
              />
            ))}
          </div>
        ) : scenes.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <EmptyState
              icon={<Layers className="h-12 w-12" />}
              title="No scenes"
              description="Create a scene to bundle configurations"
              action={
                <Button
                  variant="primary"
                  size="small"
                  icon={<Plus />}
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  Create Scene
                </Button>
              }
            />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <EmptyState
              icon={<Layers className="h-12 w-12" />}
              title="No matching scenes"
              description="Try adjusting your search query"
            />
          </div>
        )}
      </div>

      {/* Slide Panel for Detail View */}
      <SlidePanel
        isOpen={!!selectedSceneId}
        onClose={handleCloseDetail}
        width={800}
        header={
          selectedScene && (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F4F4F5]">
                <SceneIconComponent className="h-[18px] w-[18px] text-[#18181B]" />
              </div>
              <div className="flex flex-col gap-0.5">
                <h2 className="text-base font-semibold text-[#18181B]">
                  {selectedScene.name}
                </h2>
                <p className="text-xs font-normal text-[#71717A]">
                  {selectedScene.description}
                </p>
              </div>
            </div>
          )
        }
        headerRight={
          selectedScene && (
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="small" icon={<Pencil />}>
                Edit
              </Button>
              <Button
                variant="danger"
                size="small"
                icon={<Trash2 />}
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          )
        }
      >
        {selectedScene && (
          <div className="flex flex-col gap-7">
            {/* Info Section */}
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-4 gap-8">
                {/* Created */}
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-medium text-[#71717A]">Created</span>
                  <span className="text-[13px] font-medium text-[#18181B]">
                    {formatDate(selectedScene.createdAt)}
                  </span>
                </div>

                {/* Skills Count */}
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-medium text-[#71717A]">Skills Count</span>
                  <span className="text-[13px] font-medium text-[#18181B]">
                    {selectedScene.skillIds.length} skills
                  </span>
                </div>

                {/* MCPs Count */}
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-medium text-[#71717A]">MCPs Count</span>
                  <span className="text-[13px] font-medium text-[#18181B]">
                    {selectedScene.mcpIds.length} servers
                  </span>
                </div>

                {/* Used By */}
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-medium text-[#71717A]">Used By</span>
                  <span className="text-[13px] font-medium text-[#18181B]">
                    {usingProjects.length} projects
                  </span>
                </div>
              </div>
            </div>

            {/* Included Skills Section */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#18181B]">Included Skills</h3>
                <Badge variant="count">{includedSkills.length}</Badge>
              </div>
              {includedSkills.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-[#E5E5E5]">
                  {includedSkills.map((skill, index) => {
                    const SkillIcon = getSkillIcon(skill.category);
                    return (
                      <IncludedItem
                        key={skill.id}
                        icon={<SkillIcon className="h-3.5 w-3.5 text-[#52525B]" />}
                        name={skill.name}
                        description={skill.description}
                        isLast={index === includedSkills.length - 1}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-lg border border-[#E5E5E5] py-6 text-center">
                  <p className="text-sm text-[#A1A1AA]">No skills included</p>
                </div>
              )}
            </div>

            {/* Included MCP Servers Section */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#18181B]">Included MCP Servers</h3>
                <Badge variant="count">{includedMcps.length}</Badge>
              </div>
              {includedMcps.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-[#E5E5E5]">
                  {includedMcps.map((mcp, index) => {
                    const McpIcon = getMcpIcon(mcp.category);
                    return (
                      <IncludedItem
                        key={mcp.id}
                        icon={<McpIcon className="h-3.5 w-3.5 text-[#52525B]" />}
                        name={mcp.name}
                        description={mcp.description}
                        isLast={index === includedMcps.length - 1}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-lg border border-[#E5E5E5] py-6 text-center">
                  <p className="text-sm text-[#A1A1AA]">No MCP servers included</p>
                </div>
              )}
            </div>

            {/* Used by Projects Section */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-[#18181B]">Used by Projects</h3>
                  {usingProjects.length > 0 && (
                    <span className="rounded bg-[#FEF3C7] px-2 py-0.5 text-[11px] font-semibold text-[#D97706]">
                      {usingProjects.length}
                    </span>
                  )}
                </div>
                {usingProjects.length > 0 && (
                  <span className="flex items-center gap-1.5 text-[11px] font-normal text-[#D97706]">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Changes will affect these projects
                  </span>
                )}
              </div>
              {usingProjects.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {usingProjects.map((project) => (
                    <ProjectChip
                      key={project.id}
                      name={project.name}
                      onClick={() => navigate(`/projects/${project.id}`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-[#E5E5E5] py-6 text-center">
                  <p className="text-sm text-[#A1A1AA]">No projects using this scene</p>
                </div>
              )}
            </div>
          </div>
        )}
      </SlidePanel>

      {/* Create Scene Modal */}
      <CreateSceneModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateScene={handleCreateScene}
        skills={skills}
        mcpServers={mcpServers}
      />

      {/* Icon Picker */}
      {iconPickerState.triggerRef && (
        <IconPicker
          value={scenes.find((s) => s.id === iconPickerState.sceneId)?.icon || 'layers'}
          onChange={handleIconChange}
          triggerRef={iconPickerState.triggerRef}
          isOpen={iconPickerState.isOpen}
          onClose={handleIconPickerClose}
        />
      )}
    </div>
  );
};

export default ScenesPage;
