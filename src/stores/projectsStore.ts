import { create } from 'zustand';
import type { Project, Scene } from '../types';

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
  filter: ProjectsFilter;

  // New project form
  newProject: NewProjectForm;

  // Actions
  setProjects: (projects: Project[]) => void;
  selectProject: (id: string | null) => void;
  setFilter: (filter: Partial<ProjectsFilter>) => void;
  startCreating: () => void;
  cancelCreating: () => void;
  updateNewProject: (data: Partial<NewProjectForm>) => void;
  createProject: () => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  syncProject: (id: string) => void;
  clearProjectConfig: (id: string) => void;
  deleteProject: (id: string) => void;
}

// ============================================================================
// Mock Data
// ============================================================================

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'ensemble-app',
    path: '/Users/bo/Documents/Development/Ensemble/Ensemble2',
    sceneId: '1',
    lastSynced: '2024-01-20T10:30:00Z',
  },
  {
    id: '2',
    name: 'claude-mcp-server',
    path: '/Users/bo/Projects/claude-mcp-server',
    sceneId: '2',
    lastSynced: '2024-01-19T15:45:00Z',
  },
  {
    id: '3',
    name: 'personal-website',
    path: '/Users/bo/Projects/personal-website',
    sceneId: '3',
    lastSynced: '2024-01-18T09:20:00Z',
  },
  {
    id: '4',
    name: 'data-pipeline',
    path: '/Users/bo/Work/data-pipeline',
    sceneId: '4',
    lastSynced: '2024-01-17T14:00:00Z',
  },
  {
    id: '5',
    name: 'mobile-app-ios',
    path: '/Users/bo/Projects/mobile-app-ios',
    sceneId: '',
    lastSynced: undefined,
  },
];

// ============================================================================
// Store
// ============================================================================

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  // Initial state
  projects: mockProjects,
  selectedProjectId: null,
  isCreating: false,
  filter: {
    search: '',
  },
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

  createProject: () => {
    const { newProject, projects } = get();
    if (!newProject.name || !newProject.path) return;

    const newProjectData: Project = {
      id: String(Date.now()),
      name: newProject.name,
      path: newProject.path,
      sceneId: newProject.sceneId,
      lastSynced: undefined,
    };

    set({
      projects: [...projects, newProjectData],
      selectedProjectId: newProjectData.id,
      isCreating: false,
      newProject: {
        name: '',
        path: '',
        sceneId: '',
      },
    });
  },

  updateProject: (id, data) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...data } : p
      ),
    })),

  syncProject: (id) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, lastSynced: new Date().toISOString() } : p
      ),
    })),

  clearProjectConfig: (id) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, sceneId: '', lastSynced: undefined } : p
      ),
    })),

  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      selectedProjectId:
        state.selectedProjectId === id ? null : state.selectedProjectId,
    })),
}));

// ============================================================================
// Mock Scenes Data (for reference in components)
// ============================================================================

export const mockScenes: Scene[] = [
  {
    id: '1',
    name: 'Web Development',
    description: 'React, TypeScript, and frontend development tools',
    icon: 'code',
    skillIds: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    mcpIds: ['1', '2', '3'],
    createdAt: '2024-01-01T00:00:00Z',
    lastUsed: '2024-01-20T10:30:00Z',
  },
  {
    id: '2',
    name: 'Backend Development',
    description: 'Node.js, Python, and server-side development',
    icon: 'server',
    skillIds: ['13', '14', '15', '16', '17', '18'],
    mcpIds: ['4', '5'],
    createdAt: '2024-01-02T00:00:00Z',
    lastUsed: '2024-01-19T15:45:00Z',
  },
  {
    id: '3',
    name: 'Design System',
    description: 'UI/UX design, prototyping, and style guides',
    icon: 'palette',
    skillIds: ['19', '20', '21', '22'],
    mcpIds: ['6'],
    createdAt: '2024-01-03T00:00:00Z',
    lastUsed: '2024-01-18T09:20:00Z',
  },
  {
    id: '4',
    name: 'Data Science',
    description: 'Machine learning, data analysis, and visualization',
    icon: 'bar-chart',
    skillIds: ['23', '24', '25', '26', '27', '28', '29', '30'],
    mcpIds: ['7', '8', '9'],
    createdAt: '2024-01-04T00:00:00Z',
    lastUsed: '2024-01-17T14:00:00Z',
  },
  {
    id: '5',
    name: 'DevOps',
    description: 'CI/CD, containerization, and infrastructure',
    icon: 'cloud',
    skillIds: ['31', '32', '33'],
    mcpIds: ['10', '11'],
    createdAt: '2024-01-05T00:00:00Z',
    lastUsed: '2024-01-16T08:00:00Z',
  },
];

export default useProjectsStore;
