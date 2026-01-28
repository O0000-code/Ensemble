import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import type { Project, Scene } from '../types';
import { useScenesStore } from './scenesStore';
import { useSettingsStore } from './settingsStore';

// ============================================================================
// Types
// ============================================================================

interface ProjectsFilter {
  search: string;
}

interface NewProjectForm {
  name: string;
  path: string;
  sceneId: string;
}

interface ProjectsState {
  // Data
  projects: Project[];
  selectedProjectId: string | null;
  isCreating: boolean;
  isLoading: boolean;
  filter: ProjectsFilter;

  // Error and sync state
  error: string | null;
  syncingProjectId: string | null;

  // New project form
  newProject: NewProjectForm;

  // Actions
  setProjects: (projects: Project[]) => void;
  selectProject: (id: string | null) => void;
  setFilter: (filter: Partial<ProjectsFilter>) => void;
  startCreating: () => void;
  cancelCreating: () => void;
  updateNewProject: (data: Partial<NewProjectForm>) => void;

  // Tauri Actions
  loadProjects: () => Promise<void>;
  createProject: () => Promise<Project | undefined>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  syncProject: (id: string) => Promise<void>;
  clearProjectConfig: (id: string) => Promise<void>;
  selectProjectFolder: () => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  // Getters
  getAvailableScenes: () => Scene[];
}

// ============================================================================
// Store
// ============================================================================

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  // Initial state
  projects: [],
  selectedProjectId: null,
  isCreating: false,
  isLoading: false,
  filter: {
    search: '',
  },
  error: null,
  syncingProjectId: null,
  newProject: {
    name: '',
    path: '',
    sceneId: '',
  },

  // Actions
  setProjects: (projects) => set({ projects }),

  selectProject: (id) =>
    set({
      selectedProjectId: id,
      isCreating: false,
    }),

  setFilter: (filter) =>
    set((state) => ({
      filter: { ...state.filter, ...filter },
    })),

  startCreating: () =>
    set({
      isCreating: true,
      selectedProjectId: null,
      newProject: {
        name: '',
        path: '',
        sceneId: '',
      },
    }),

  cancelCreating: () =>
    set({
      isCreating: false,
      newProject: {
        name: '',
        path: '',
        sceneId: '',
      },
    }),

  updateNewProject: (data) =>
    set((state) => ({
      newProject: { ...state.newProject, ...data },
    })),

  // Tauri Actions
  loadProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const projects = await invoke<Project[]>('get_projects');
      set({ projects, isLoading: false });
    } catch (error) {
      set({ error: String(error), isLoading: false });
    }
  },

  createProject: async () => {
    const { newProject } = get();
    if (!newProject.name || !newProject.path) return;

    try {
      const project = await invoke<Project>('add_project', {
        name: newProject.name,
        path: newProject.path,
        sceneId: newProject.sceneId,
      });
      set((state) => ({
        projects: [...state.projects, project],
        isCreating: false,
        selectedProjectId: project.id,
        newProject: {
          name: '',
          path: '',
          sceneId: '',
        },
      }));
      return project;
    } catch (error) {
      set({ error: String(error) });
      throw error;
    }
  },

  updateProject: async (id, data) => {
    try {
      await invoke('update_project', { id, ...data });
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === id ? { ...p, ...data } : p
        ),
      }));
    } catch (error) {
      set({ error: String(error) });
      throw error;
    }
  },

  syncProject: async (id) => {
    const project = get().projects.find((p) => p.id === id);
    if (!project) return;

    const scene = useScenesStore.getState().scenes.find((s) => s.id === project.sceneId);
    if (!scene) {
      set({ error: 'Scene not found' });
      return;
    }

    const { skillSourceDir, mcpSourceDir } = useSettingsStore.getState();

    set({ syncingProjectId: id, error: null });
    try {
      await invoke('sync_project_config', {
        projectPath: project.path,
        skillIds: scene.skillIds,
        mcpIds: scene.mcpIds,
        sourceSkillDir: skillSourceDir,
        sourceMcpDir: mcpSourceDir,
      });

      // Update lastSynced
      const now = new Date().toISOString();
      await invoke('update_project', { id, lastSynced: now });

      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === id ? { ...p, lastSynced: now } : p
        ),
        syncingProjectId: null,
      }));
    } catch (error) {
      set({ error: String(error), syncingProjectId: null });
      throw error;
    }
  },

  clearProjectConfig: async (id) => {
    const project = get().projects.find((p) => p.id === id);
    if (!project) return;

    try {
      await invoke('clear_project_config', { projectPath: project.path });

      // Clear lastSynced
      await invoke('update_project', { id, lastSynced: null });

      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === id ? { ...p, lastSynced: undefined } : p
        ),
      }));
    } catch (error) {
      set({ error: String(error) });
      throw error;
    }
  },

  selectProjectFolder: async () => {
    try {
      const path = await invoke<string | null>('select_folder');
      if (path) {
        set((state) => ({
          newProject: { ...state.newProject, path },
        }));
      }
    } catch (error) {
      set({ error: String(error) });
    }
  },

  deleteProject: async (id) => {
    try {
      await invoke('delete_project', { id });
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        selectedProjectId:
          state.selectedProjectId === id ? null : state.selectedProjectId,
      }));
    } catch (error) {
      set({ error: String(error) });
      throw error;
    }
  },

  // Getters
  getAvailableScenes: () => {
    return useScenesStore.getState().scenes;
  },
}));

export default useProjectsStore;
