import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Plus,
  Pencil,
  Trash2,
  Layers,
  Sparkles,
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
} from 'lucide-react';
import { ListDetailLayout } from '@/components/layout/ListDetailLayout';
import { SearchInput } from '@/components/common/SearchInput';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import { IconPicker } from '@/components/common';
import { SceneItem } from '@/components/scenes/SceneItem';
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
// SceneDetailPage Component
// ============================================================================

export const SceneDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: sceneId } = useParams<{ id: string }>();

  // Store state
  const scenes = useScenesStore((state) => state.scenes);
  const deleteScene = useScenesStore((state) => state.deleteScene);
  const updateScene = useScenesStore((state) => state.updateScene);
  const allSkills = useSkillsStore((state) => state.skills);
  const allMcpServers = useMcpsStore((state) => state.mcpServers);

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Icon Picker state
  const [iconPickerState, setIconPickerState] = useState<{
    isOpen: boolean;
    sceneId: string | null;
    triggerRef: React.RefObject<HTMLDivElement> | null;
  }>({ isOpen: false, sceneId: null, triggerRef: null });

  // Get selected scene
  const selectedScene = useMemo(
    () => scenes.find((s) => s.id === sceneId),
    [scenes, sceneId]
  );

  // Filter scenes for list
  const filteredScenes = useMemo(() => {
    if (!searchQuery) return scenes;
    const query = searchQuery.toLowerCase();
    return scenes.filter(
      (scene) =>
        scene.name.toLowerCase().includes(query) ||
        scene.description.toLowerCase().includes(query)
    );
  }, [scenes, searchQuery]);

  // Get skills and MCPs for selected scene
  const includedSkills = useMemo((): Skill[] => {
    if (!selectedScene) return [];
    return allSkills.filter((s) => selectedScene.skillIds.includes(s.id));
  }, [selectedScene, allSkills]);

  const includedMcps = useMemo((): McpServer[] => {
    if (!selectedScene) return [];
    return allMcpServers.filter((m) => selectedScene.mcpIds.includes(m.id));
  }, [selectedScene, allMcpServers]);

  // Get projects using this scene
  const usingProjects = useMemo(() => {
    if (!selectedScene) return [];
    return mockProjects.filter((p) => p.sceneId === selectedScene.id);
  }, [selectedScene]);

  // Handle create scene
  const handleCreateScene = (sceneData: {
    name: string;
    description: string;
    skillIds: string[];
    mcpIds: string[];
  }) => {
    const newScene = {
      id: `scene-${Date.now()}`,
      name: sceneData.name,
      description: sceneData.description,
      icon: 'layers' as const,
      skillIds: sceneData.skillIds,
      mcpIds: sceneData.mcpIds,
      createdAt: new Date().toISOString(),
    };

    useScenesStore.getState().setScenes([...scenes, newScene]);
    setIsCreateModalOpen(false);
    navigate(`/scenes/${newScene.id}`);
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
      navigate('/scenes');
    }
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Handle icon click
  const handleIconClick = (sceneId: string, ref: React.RefObject<HTMLDivElement>) => {
    setIconPickerState({ isOpen: true, sceneId, triggerRef: ref });
  };

  // Handle icon change
  const handleIconChange = (iconName: string) => {
    if (iconPickerState.sceneId) {
      updateScene(iconPickerState.sceneId, { icon: iconName });
    }
    setIconPickerState({ isOpen: false, sceneId: null, triggerRef: null });
  };

  // Handle icon picker close
  const handleIconPickerClose = () => {
    setIconPickerState({ isOpen: false, sceneId: null, triggerRef: null });
  };

  // Get scene icon component
  const SceneIconComponent = selectedScene ? getSceneIcon(selectedScene.icon) : Layers;

  return (
    <>
      <ListDetailLayout
        listWidth={380}
        listHeader={
          <>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-[#18181B]">Scenes</span>
              <Badge variant="count">{scenes.length}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search..."
                className="w-[140px]"
              />
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-[#18181B] text-white transition-colors hover:bg-[#27272A]"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </>
        }
        listContent={
          <div className="flex flex-col gap-1">
            {filteredScenes.map((scene) => (
              <SceneItem
                key={scene.id}
                scene={scene}
                selected={scene.id === sceneId}
                onClick={() => navigate(`/scenes/${scene.id}`)}
                onIconClick={(ref) => handleIconClick(scene.id, ref)}
              />
            ))}
            {filteredScenes.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-sm text-[#A1A1AA]">No scenes found</p>
              </div>
            )}
          </div>
        }
        detailHeader={
          selectedScene && (
            <>
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
            </>
          )
        }
        detailContent={
          selectedScene && (
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
          )
        }
        emptyDetail={
          <EmptyState
            icon={<Layers className="h-12 w-12" />}
            title="Select a scene"
            description="Choose a scene from the list to view its details"
          />
        }
      />

      {/* Create Scene Modal */}
      <CreateSceneModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateScene={handleCreateScene}
        skills={allSkills}
        mcpServers={allMcpServers}
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
    </>
  );
};

export default SceneDetailPage;
