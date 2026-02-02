import { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { useScenesStore } from '@/stores/scenesStore';
import { useProjectsStore } from '@/stores/projectsStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { FolderOpen, Play, Layers } from 'lucide-react';
import { safeInvoke } from '@/utils/tauri';

interface LauncherModalProps {
  isOpen: boolean;
  folderPath: string;
  onClose: () => void;
}

export function LauncherModal({ isOpen, folderPath, onClose }: LauncherModalProps) {
  const { scenes } = useScenesStore();
  const { projects, syncProject, updateProject } = useProjectsStore();
  const { terminalApp, claudeCommand, warpOpenMode } = useSettingsStore();

  const [selectedSceneId, setSelectedSceneId] = useState<string>('');
  const [isLaunching, setIsLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if folder already has an associated project
  const existingProject = projects.find((p) => p.path === folderPath);

  useEffect(() => {
    if (existingProject?.sceneId) {
      setSelectedSceneId(existingProject.sceneId);
    } else if (scenes.length > 0) {
      setSelectedSceneId(scenes[0].id);
    }
  }, [existingProject, scenes]);

  // Get folder name from path
  const folderName = folderPath.split('/').pop() || folderPath;

  const handleLaunch = async () => {
    if (!selectedSceneId) {
      setError('Please select a Scene');
      return;
    }

    setIsLaunching(true);
    setError(null);

    try {
      let projectId = existingProject?.id;

      // If no existing project, create one
      if (!existingProject) {
        const newProject = await safeInvoke<{ id: string }>('add_project', {
          name: folderName,
          path: folderPath,
          sceneId: selectedSceneId,
        });
        if (newProject) {
          projectId = newProject.id;
          // Reload projects to get the new one
          await useProjectsStore.getState().loadProjects();
        }
      } else if (existingProject.sceneId !== selectedSceneId) {
        // Update existing project's Scene
        await updateProject(existingProject.id, { sceneId: selectedSceneId });
      }

      // Sync configuration to project directory
      if (projectId) {
        await syncProject(projectId);
      }

      // Launch terminal and Claude Code
      await safeInvoke('launch_claude_for_folder', {
        folderPath,
        terminalApp,
        claudeCommand,
        warpOpenMode: warpOpenMode || 'window',
      });

      onClose();
    } catch (err) {
      setError(typeof err === 'string' ? err : String(err));
    } finally {
      setIsLaunching(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Launch Claude Code" maxWidth="480px">
      <div className="p-6">
        {/* Folder Info */}
        <div className="mb-6 flex items-center gap-3 rounded-lg bg-[#F5F5F5] p-4">
          <FolderOpen className="h-8 w-8 text-[#71717A]" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[#18181B]">{folderName}</p>
            <p className="truncate text-xs text-[#71717A]">{folderPath}</p>
          </div>
        </div>

        {/* Scene Selection */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-[#18181B]">
            <Layers className="mr-2 inline h-4 w-4" />
            Select Scene
          </label>
          {scenes.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#E5E5E5] p-4 text-center">
              <p className="text-sm text-[#71717A]">No Scenes available</p>
              <p className="mt-1 text-xs text-[#A1A1AA]">
                Create a Scene first in the Scenes page
              </p>
            </div>
          ) : (
            <div className="max-h-60 divide-y divide-[#E5E5E5] overflow-y-auto rounded-lg border border-[#E5E5E5]">
              {scenes.map((scene) => (
                <label
                  key={scene.id}
                  className={`flex cursor-pointer items-center gap-3 p-3 transition-colors ${
                    selectedSceneId === scene.id ? 'bg-[#F0F9FF]' : 'hover:bg-[#FAFAFA]'
                  }`}
                >
                  <input
                    type="radio"
                    name="scene"
                    value={scene.id}
                    checked={selectedSceneId === scene.id}
                    onChange={() => setSelectedSceneId(scene.id)}
                    className="h-4 w-4 text-[#2563EB]"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#18181B]">{scene.name}</p>
                    <p className="truncate text-xs text-[#71717A]">{scene.description}</p>
                    <p className="mt-1 text-xs text-[#A1A1AA]">
                      {scene.skillIds.length} Skills / {scene.mcpIds.length} MCPs
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 rounded-lg bg-[#FEF2F2] p-3 text-sm text-[#DC2626]">{error}</div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1" disabled={isLaunching}>
            Cancel
          </Button>
          <Button
            onClick={handleLaunch}
            className="flex-1"
            disabled={isLaunching || scenes.length === 0 || !selectedSceneId}
            loading={isLaunching}
          >
            <Play className="mr-2 h-4 w-4" />
            {isLaunching ? 'Launching...' : 'Launch'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
