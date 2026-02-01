import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Layers } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { IconPicker } from '@/components/common';
import { SceneCard } from '@/components/scenes/SceneCard';
import { CreateSceneModal } from '@/components/scenes/CreateSceneModal';
import { useScenesStore } from '@/stores/scenesStore';
import { useSkillsStore } from '@/stores/skillsStore';
import { useMcpsStore } from '@/stores/mcpsStore';

// ============================================================================
// ScenesPage Component
// ============================================================================

/**
 * ScenesPage Component
 *
 * Displays the list of scenes with search and create functionality.
 *
 * Layout:
 * - PageHeader: Title "Scenes" + Search + "+ New Scene" button
 * - Content: SceneCard grid (vertical list)
 * - Empty state when no scenes exist
 */
export const ScenesPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: selectedId } = useParams<{ id: string }>();

  // Store state
  const scenes = useScenesStore((state) => state.scenes);
  const filter = useScenesStore((state) => state.filter);
  const setFilter = useScenesStore((state) => state.setFilter);
  const skills = useSkillsStore((state) => state.skills);
  const mcpServers = useMcpsStore((state) => state.mcpServers);

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

  // Handle scene click
  const handleSceneClick = (sceneId: string) => {
    navigate(`/scenes/${sceneId}`);
  };

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

  // Handle icon click
  const handleIconClick = (sceneId: string, ref: React.RefObject<HTMLDivElement>) => {
    setIconPickerState({ isOpen: true, sceneId, triggerRef: ref });
  };

  // Handle icon change
  const handleIconChange = (iconName: string) => {
    if (iconPickerState.sceneId) {
      const scene = scenes.find(s => s.id === iconPickerState.sceneId);
      if (scene) {
        const updatedScenes = scenes.map(s =>
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

  return (
    <>
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 px-7">
        {filteredScenes.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filteredScenes.map((scene) => (
              <SceneCard
                key={scene.id}
                scene={scene}
                selected={scene.id === selectedId}
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
          value={scenes.find(s => s.id === iconPickerState.sceneId)?.icon || 'layers'}
          onChange={handleIconChange}
          triggerRef={iconPickerState.triggerRef}
          isOpen={iconPickerState.isOpen}
          onClose={handleIconPickerClose}
        />
      )}
    </>
  );
};

export default ScenesPage;
