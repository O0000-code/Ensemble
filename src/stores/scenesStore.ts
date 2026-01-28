import { create } from 'zustand';
import { Scene, Skill, McpServer } from '@/types';

// ============================================================================
// Types
// ============================================================================

export interface CreateModalState {
  isOpen: boolean;
  name: string;
  description: string;
  selectedSkillIds: string[];
  selectedMcpIds: string[];
  activeTab: 'skills' | 'mcps';
  search: string;
  categoryFilter: string;
  tagFilter: string[];
}

interface ScenesState {
  scenes: Scene[];
  selectedSceneId: string | null;
  filter: {
    search: string;
  };
  isLoading: boolean;

  // Modal state
  createModal: CreateModalState;

  // Actions
  setScenes: (scenes: Scene[]) => void;
  selectScene: (id: string | null) => void;
  setFilter: (filter: Partial<ScenesState['filter']>) => void;

  // Create Modal Actions
  openCreateModal: () => void;
  closeCreateModal: () => void;
  updateCreateModal: (data: Partial<CreateModalState>) => void;
  toggleSkillSelection: (skillId: string) => void;
  toggleMcpSelection: (mcpId: string) => void;
  selectAllSkills: (skillIds: string[]) => void;
  selectAllMcps: (mcpIds: string[]) => void;
  clearAllSelections: () => void;
  createScene: () => Scene | null;

  // Edit/Delete Actions
  deleteScene: (id: string) => void;
  updateScene: (id: string, updates: Partial<Scene>) => void;
}

// ============================================================================
// Mock Data
// ============================================================================

const mockScenes: Scene[] = [
  {
    id: 'scene-1',
    name: 'Frontend Development',
    description: 'Complete toolkit for React and TypeScript development with design system integration',
    icon: 'code',
    skillIds: ['skill-1', 'skill-2', 'skill-3', 'skill-4', 'skill-5'],
    mcpIds: ['mcp-1', 'mcp-2', 'mcp-3'],
    createdAt: '2024-12-01T10:00:00Z',
    lastUsed: '2024-12-15T14:30:00Z',
  },
  {
    id: 'scene-2',
    name: 'Backend API Development',
    description: 'Node.js and Python backend development with database tools',
    icon: 'server',
    skillIds: ['skill-6', 'skill-7', 'skill-8'],
    mcpIds: ['mcp-4', 'mcp-5'],
    createdAt: '2024-11-20T09:00:00Z',
    lastUsed: '2024-12-14T11:00:00Z',
  },
  {
    id: 'scene-3',
    name: 'Data Analysis',
    description: 'Data science and machine learning workflow with visualization tools',
    icon: 'bar-chart',
    skillIds: ['skill-9', 'skill-10', 'skill-11', 'skill-12'],
    mcpIds: ['mcp-6', 'mcp-7', 'mcp-8'],
    createdAt: '2024-11-15T08:00:00Z',
    lastUsed: '2024-12-13T16:45:00Z',
  },
  {
    id: 'scene-4',
    name: 'DevOps & Infrastructure',
    description: 'CI/CD pipelines, Docker, Kubernetes, and cloud infrastructure management',
    icon: 'cloud',
    skillIds: ['skill-13', 'skill-14'],
    mcpIds: ['mcp-9', 'mcp-10', 'mcp-11'],
    createdAt: '2024-11-10T12:00:00Z',
    lastUsed: '2024-12-12T09:15:00Z',
  },
  {
    id: 'scene-5',
    name: 'Documentation & Writing',
    description: 'Technical documentation, markdown editing, and content generation',
    icon: 'file-text',
    skillIds: ['skill-15', 'skill-16', 'skill-17', 'skill-18', 'skill-19', 'skill-20'],
    mcpIds: ['mcp-12'],
    createdAt: '2024-11-05T14:00:00Z',
    lastUsed: '2024-12-11T10:30:00Z',
  },
  {
    id: 'scene-6',
    name: 'Research & Learning',
    description: 'Academic research, paper reading, and knowledge management',
    icon: 'book-open',
    skillIds: ['skill-21', 'skill-22', 'skill-23'],
    mcpIds: ['mcp-13', 'mcp-14', 'mcp-15', 'mcp-16'],
    createdAt: '2024-10-28T11:00:00Z',
  },
  {
    id: 'scene-7',
    name: 'Mobile Development',
    description: 'React Native and Flutter mobile app development',
    icon: 'smartphone',
    skillIds: ['skill-24', 'skill-25', 'skill-26', 'skill-27', 'skill-28', 'skill-29', 'skill-30', 'skill-31'],
    mcpIds: ['mcp-17', 'mcp-18', 'mcp-19', 'mcp-20', 'mcp-21'],
    createdAt: '2024-10-20T15:00:00Z',
    lastUsed: '2024-12-10T13:20:00Z',
  },
];

// Mock Skills for the modal
export const mockSkills: Skill[] = [
  {
    id: 'skill-1',
    name: 'React Component Builder',
    description: 'Generate React components with TypeScript and best practices',
    category: 'Development',
    tags: ['React', 'TypeScript', 'Frontend'],
    enabled: true,
    sourcePath: '/skills/react-component-builder.md',
    scope: 'user',
    instructions: 'Build React components following best practices...',
    createdAt: '2024-11-01T10:00:00Z',
    usageCount: 45,
  },
  {
    id: 'skill-2',
    name: 'CSS Styling Expert',
    description: 'Create responsive CSS with Tailwind and modern techniques',
    category: 'Design',
    tags: ['CSS', 'Tailwind', 'Frontend'],
    enabled: true,
    sourcePath: '/skills/css-styling.md',
    scope: 'user',
    instructions: 'Create responsive CSS layouts...',
    createdAt: '2024-11-02T10:00:00Z',
    usageCount: 32,
  },
  {
    id: 'skill-3',
    name: 'TypeScript Helper',
    description: 'TypeScript type definitions and advanced patterns',
    category: 'Development',
    tags: ['TypeScript', 'Types'],
    enabled: true,
    sourcePath: '/skills/typescript-helper.md',
    scope: 'user',
    instructions: 'Help with TypeScript types...',
    createdAt: '2024-11-03T10:00:00Z',
    usageCount: 28,
  },
  {
    id: 'skill-4',
    name: 'API Integration',
    description: 'REST and GraphQL API integration patterns',
    category: 'Development',
    tags: ['API', 'REST', 'GraphQL'],
    enabled: true,
    sourcePath: '/skills/api-integration.md',
    scope: 'user',
    instructions: 'Integrate APIs following best practices...',
    createdAt: '2024-11-04T10:00:00Z',
    usageCount: 22,
  },
  {
    id: 'skill-5',
    name: 'State Management',
    description: 'React state management with Zustand, Redux, and Context',
    category: 'Development',
    tags: ['React', 'State', 'Zustand'],
    enabled: true,
    sourcePath: '/skills/state-management.md',
    scope: 'user',
    instructions: 'Manage state in React applications...',
    createdAt: '2024-11-05T10:00:00Z',
    usageCount: 18,
  },
  {
    id: 'skill-6',
    name: 'Node.js Backend',
    description: 'Build Node.js APIs with Express and NestJS',
    category: 'Development',
    tags: ['Node.js', 'Backend', 'Express'],
    enabled: true,
    sourcePath: '/skills/nodejs-backend.md',
    scope: 'user',
    instructions: 'Build backend services...',
    createdAt: '2024-11-06T10:00:00Z',
    usageCount: 35,
  },
  {
    id: 'skill-7',
    name: 'Python Developer',
    description: 'Python development with FastAPI and Django',
    category: 'Development',
    tags: ['Python', 'Backend', 'FastAPI'],
    enabled: true,
    sourcePath: '/skills/python-dev.md',
    scope: 'user',
    instructions: 'Develop Python applications...',
    createdAt: '2024-11-07T10:00:00Z',
    usageCount: 42,
  },
  {
    id: 'skill-8',
    name: 'Database Design',
    description: 'SQL and NoSQL database schema design',
    category: 'Development',
    tags: ['Database', 'SQL', 'NoSQL'],
    enabled: true,
    sourcePath: '/skills/database-design.md',
    scope: 'user',
    instructions: 'Design database schemas...',
    createdAt: '2024-11-08T10:00:00Z',
    usageCount: 15,
  },
  {
    id: 'skill-9',
    name: 'Data Visualization',
    description: 'Create charts and dashboards with D3 and Chart.js',
    category: 'Research',
    tags: ['Data', 'Visualization', 'D3'],
    enabled: true,
    sourcePath: '/skills/data-viz.md',
    scope: 'user',
    instructions: 'Create data visualizations...',
    createdAt: '2024-11-09T10:00:00Z',
    usageCount: 20,
  },
  {
    id: 'skill-10',
    name: 'Machine Learning',
    description: 'ML model development and deployment',
    category: 'Research',
    tags: ['ML', 'AI', 'Python'],
    enabled: true,
    sourcePath: '/skills/machine-learning.md',
    scope: 'user',
    instructions: 'Develop ML models...',
    createdAt: '2024-11-10T10:00:00Z',
    usageCount: 25,
  },
];

// Mock MCP Servers for the modal
export const mockMcpServers: McpServer[] = [
  {
    id: 'mcp-1',
    name: 'GitHub MCP',
    description: 'GitHub repository management and code operations',
    category: 'Development',
    tags: ['Git', 'GitHub', 'VCS'],
    enabled: true,
    sourcePath: '/mcps/github',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-github'],
    providedTools: [
      { name: 'create_repository', description: 'Create a new GitHub repository' },
      { name: 'push_files', description: 'Push files to repository' },
      { name: 'create_pull_request', description: 'Create a pull request' },
    ],
    createdAt: '2024-11-01T10:00:00Z',
    usageCount: 50,
  },
  {
    id: 'mcp-2',
    name: 'File System',
    description: 'Local file system operations',
    category: 'Development',
    tags: ['Files', 'Local'],
    enabled: true,
    sourcePath: '/mcps/filesystem',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', '/Users'],
    providedTools: [
      { name: 'read_file', description: 'Read file contents' },
      { name: 'write_file', description: 'Write to a file' },
      { name: 'list_directory', description: 'List directory contents' },
    ],
    createdAt: '2024-11-02T10:00:00Z',
    usageCount: 80,
  },
  {
    id: 'mcp-3',
    name: 'Puppeteer',
    description: 'Browser automation and web scraping',
    category: 'Development',
    tags: ['Browser', 'Automation', 'Testing'],
    enabled: true,
    sourcePath: '/mcps/puppeteer',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-puppeteer'],
    providedTools: [
      { name: 'navigate', description: 'Navigate to a URL' },
      { name: 'screenshot', description: 'Take a screenshot' },
      { name: 'click', description: 'Click an element' },
    ],
    createdAt: '2024-11-03T10:00:00Z',
    usageCount: 30,
  },
  {
    id: 'mcp-4',
    name: 'PostgreSQL',
    description: 'PostgreSQL database operations',
    category: 'Development',
    tags: ['Database', 'SQL', 'PostgreSQL'],
    enabled: true,
    sourcePath: '/mcps/postgres',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-postgres'],
    providedTools: [
      { name: 'query', description: 'Execute SQL query' },
      { name: 'list_tables', description: 'List database tables' },
    ],
    createdAt: '2024-11-04T10:00:00Z',
    usageCount: 45,
  },
  {
    id: 'mcp-5',
    name: 'Redis',
    description: 'Redis cache and data store operations',
    category: 'Development',
    tags: ['Database', 'Cache', 'Redis'],
    enabled: true,
    sourcePath: '/mcps/redis',
    command: 'node',
    args: ['redis-mcp-server.js'],
    providedTools: [
      { name: 'get', description: 'Get value by key' },
      { name: 'set', description: 'Set key-value pair' },
      { name: 'delete', description: 'Delete a key' },
    ],
    createdAt: '2024-11-05T10:00:00Z',
    usageCount: 25,
  },
  {
    id: 'mcp-6',
    name: 'Brave Search',
    description: 'Web search using Brave Search API',
    category: 'Research',
    tags: ['Search', 'Web', 'API'],
    enabled: true,
    sourcePath: '/mcps/brave-search',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-brave-search'],
    providedTools: [
      { name: 'search', description: 'Search the web' },
      { name: 'local_search', description: 'Search local businesses' },
    ],
    createdAt: '2024-11-06T10:00:00Z',
    usageCount: 60,
  },
];

// ============================================================================
// Initial State
// ============================================================================

const initialCreateModalState: CreateModalState = {
  isOpen: false,
  name: '',
  description: '',
  selectedSkillIds: [],
  selectedMcpIds: [],
  activeTab: 'skills',
  search: '',
  categoryFilter: '',
  tagFilter: [],
};

// ============================================================================
// Store
// ============================================================================

export const useScenesStore = create<ScenesState>((set, get) => ({
  scenes: mockScenes,
  selectedSceneId: null,
  filter: {
    search: '',
  },
  isLoading: false,
  createModal: initialCreateModalState,

  // Basic Actions
  setScenes: (scenes) => set({ scenes }),

  selectScene: (id) => set({ selectedSceneId: id }),

  setFilter: (filter) =>
    set((state) => ({
      filter: { ...state.filter, ...filter },
    })),

  // Create Modal Actions
  openCreateModal: () =>
    set(() => ({
      createModal: {
        ...initialCreateModalState,
        isOpen: true,
      },
    })),

  closeCreateModal: () =>
    set((state) => ({
      createModal: {
        ...state.createModal,
        isOpen: false,
      },
    })),

  updateCreateModal: (data) =>
    set((state) => ({
      createModal: {
        ...state.createModal,
        ...data,
      },
    })),

  toggleSkillSelection: (skillId) =>
    set((state) => {
      const { selectedSkillIds } = state.createModal;
      const newIds = selectedSkillIds.includes(skillId)
        ? selectedSkillIds.filter((id) => id !== skillId)
        : [...selectedSkillIds, skillId];
      return {
        createModal: {
          ...state.createModal,
          selectedSkillIds: newIds,
        },
      };
    }),

  toggleMcpSelection: (mcpId) =>
    set((state) => {
      const { selectedMcpIds } = state.createModal;
      const newIds = selectedMcpIds.includes(mcpId)
        ? selectedMcpIds.filter((id) => id !== mcpId)
        : [...selectedMcpIds, mcpId];
      return {
        createModal: {
          ...state.createModal,
          selectedMcpIds: newIds,
        },
      };
    }),

  selectAllSkills: (skillIds) =>
    set((state) => ({
      createModal: {
        ...state.createModal,
        selectedSkillIds: skillIds,
      },
    })),

  selectAllMcps: (mcpIds) =>
    set((state) => ({
      createModal: {
        ...state.createModal,
        selectedMcpIds: mcpIds,
      },
    })),

  clearAllSelections: () =>
    set((state) => ({
      createModal: {
        ...state.createModal,
        selectedSkillIds: [],
        selectedMcpIds: [],
      },
    })),

  createScene: () => {
    const state = get();
    const { name, description, selectedSkillIds, selectedMcpIds } = state.createModal;

    if (!name.trim()) {
      return null;
    }

    const newScene: Scene = {
      id: `scene-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      icon: 'layers',
      skillIds: selectedSkillIds,
      mcpIds: selectedMcpIds,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      scenes: [...state.scenes, newScene],
      createModal: {
        ...initialCreateModalState,
        isOpen: false,
      },
      selectedSceneId: newScene.id,
    }));

    return newScene;
  },

  // Edit/Delete Actions
  deleteScene: (id) =>
    set((state) => ({
      scenes: state.scenes.filter((scene) => scene.id !== id),
      selectedSceneId: state.selectedSceneId === id ? null : state.selectedSceneId,
    })),

  updateScene: (id, updates) =>
    set((state) => ({
      scenes: state.scenes.map((scene) =>
        scene.id === id ? { ...scene, ...updates } : scene
      ),
    })),
}));

export default useScenesStore;
