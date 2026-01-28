import { create } from 'zustand';
import type { Skill, Category, Tag } from '../types';

// ============================================================================
// Types
// ============================================================================

interface SkillsFilter {
  search: string;
  category: string | null;
  tags: string[];
}

interface SkillsState {
  // Data
  skills: Skill[];
  categories: Category[];
  tags: Tag[];

  // Selection
  selectedSkillId: string | null;

  // Filter
  filter: SkillsFilter;

  // Loading state
  isLoading: boolean;

  // Actions
  setSkills: (skills: Skill[]) => void;
  selectSkill: (id: string | null) => void;
  toggleSkill: (id: string) => void;
  setFilter: (filter: Partial<SkillsFilter>) => void;
  clearFilter: () => void;

  // Computed
  getFilteredSkills: () => Skill[];
  getEnabledCount: () => number;
  getSelectedSkill: () => Skill | undefined;
}

// ============================================================================
// Mock Data
// ============================================================================

const mockCategories: Category[] = [
  { id: 'development', name: 'Development', color: '#18181B', count: 5 },
  { id: 'design', name: 'Design', color: '#8B5CF6', count: 3 },
  { id: 'research', name: 'Research', color: '#3B82F6', count: 2 },
  { id: 'productivity', name: 'Productivity', color: '#10B981', count: 2 },
  { id: 'other', name: 'Other', color: '#71717A', count: 1 },
];

const mockTags: Tag[] = [
  { id: 'react', name: 'React', count: 4 },
  { id: 'typescript', name: 'TypeScript', count: 5 },
  { id: 'frontend', name: 'Frontend', count: 6 },
  { id: 'backend', name: 'Backend', count: 3 },
  { id: 'api', name: 'API', count: 2 },
  { id: 'testing', name: 'Testing', count: 2 },
  { id: 'ui', name: 'UI', count: 3 },
  { id: 'automation', name: 'Automation', count: 2 },
];

const mockSkills: Skill[] = [
  {
    id: 'skill-1',
    name: 'Frontend Development',
    description: 'Expert knowledge in React, TypeScript, and modern frontend development practices',
    category: 'development',
    tags: ['react', 'typescript', 'frontend'],
    enabled: true,
    sourcePath: '~/.claude/skills/frontend-development.md',
    scope: 'user',
    invocation: '/frontend',
    allowedTools: ['Read', 'Write', 'Bash', 'Glob', 'Grep'],
    instructions: 'You are an expert frontend developer specializing in React and TypeScript. Follow best practices for component design, state management, and performance optimization. Use modern React patterns including hooks, context, and suspense.',
    createdAt: '2024-01-15T10:00:00Z',
    lastUsed: '2024-01-28T09:30:00Z',
    usageCount: 156,
  },
  {
    id: 'skill-2',
    name: 'GitHub Explorer',
    description: 'Systematic GitHub repository discovery using advanced search methodology',
    category: 'development',
    tags: ['api', 'automation'],
    enabled: true,
    sourcePath: '~/.claude/skills/github-explorer.md',
    scope: 'user',
    invocation: '/github-explorer',
    allowedTools: ['WebFetch', 'Bash'],
    instructions: 'Search GitHub repositories systematically using multiple strategies: trending repos, awesome lists, topic search, and user recommendations.',
    createdAt: '2024-01-10T14:00:00Z',
    lastUsed: '2024-01-27T15:45:00Z',
    usageCount: 89,
  },
  {
    id: 'skill-3',
    name: 'SwiftUI Expert',
    description: 'Write and review SwiftUI code following Apple best practices and iOS 18 patterns',
    category: 'development',
    tags: ['frontend', 'ui'],
    enabled: true,
    sourcePath: '~/.claude/skills/swiftui-expert.md',
    scope: 'user',
    invocation: '/swiftui',
    allowedTools: ['Read', 'Write', 'Bash'],
    instructions: 'Expert in SwiftUI development with deep knowledge of view composition, state management with @State, @Binding, @Observable, and modern iOS development patterns.',
    createdAt: '2024-01-08T09:00:00Z',
    lastUsed: '2024-01-26T11:20:00Z',
    usageCount: 72,
  },
  {
    id: 'skill-4',
    name: 'API Design',
    description: 'Design RESTful and GraphQL APIs following industry standards',
    category: 'development',
    tags: ['api', 'backend'],
    enabled: false,
    sourcePath: '~/.claude/skills/api-design.md',
    scope: 'user',
    invocation: '/api-design',
    allowedTools: ['Read', 'Write'],
    instructions: 'Design clean, scalable APIs following REST principles or GraphQL best practices. Consider versioning, authentication, rate limiting, and documentation.',
    createdAt: '2024-01-05T16:00:00Z',
    lastUsed: '2024-01-20T14:30:00Z',
    usageCount: 45,
  },
  {
    id: 'skill-5',
    name: 'Unit Testing',
    description: 'Write comprehensive unit tests with Jest, Vitest, and Testing Library',
    category: 'development',
    tags: ['testing', 'frontend'],
    enabled: true,
    sourcePath: '~/.claude/skills/unit-testing.md',
    scope: 'user',
    invocation: '/test',
    allowedTools: ['Read', 'Write', 'Bash'],
    instructions: 'Write thorough unit tests focusing on behavior over implementation. Use Testing Library for React components, mock external dependencies appropriately.',
    createdAt: '2024-01-03T11:00:00Z',
    lastUsed: '2024-01-28T08:15:00Z',
    usageCount: 128,
  },
  {
    id: 'skill-6',
    name: 'UI Design Review',
    description: 'Review UI designs for accessibility, usability, and visual consistency',
    category: 'design',
    tags: ['ui', 'frontend'],
    enabled: true,
    sourcePath: '~/.claude/skills/ui-design-review.md',
    scope: 'user',
    invocation: '/ui-review',
    allowedTools: ['Read'],
    instructions: 'Review UI designs with focus on WCAG accessibility guidelines, visual hierarchy, consistent spacing, and responsive design principles.',
    createdAt: '2024-01-02T13:00:00Z',
    lastUsed: '2024-01-25T16:40:00Z',
    usageCount: 34,
  },
  {
    id: 'skill-7',
    name: 'Algorithmic Art',
    description: 'Create generative art using p5.js with seeded randomness and parameters',
    category: 'design',
    tags: ['frontend', 'ui'],
    enabled: true,
    sourcePath: '~/.claude/skills/algorithmic-art.md',
    scope: 'user',
    invocation: '/art',
    allowedTools: ['Write'],
    instructions: 'Create algorithmic and generative art using p5.js. Use seeded randomness for reproducibility, implement interactive parameter controls.',
    createdAt: '2023-12-28T10:00:00Z',
    lastUsed: '2024-01-22T19:30:00Z',
    usageCount: 23,
  },
  {
    id: 'skill-8',
    name: 'Color System Design',
    description: 'Design comprehensive color systems with accessibility considerations',
    category: 'design',
    tags: ['ui'],
    enabled: false,
    sourcePath: '~/.claude/skills/color-system.md',
    scope: 'user',
    invocation: '/colors',
    allowedTools: ['Write'],
    instructions: 'Design color systems with proper contrast ratios, semantic naming, dark mode support, and brand consistency.',
    createdAt: '2023-12-25T14:00:00Z',
    usageCount: 12,
  },
  {
    id: 'skill-9',
    name: 'Literature Review',
    description: 'Conduct systematic academic literature searches and synthesis',
    category: 'research',
    tags: ['automation'],
    enabled: true,
    sourcePath: '~/.claude/skills/literature-review.md',
    scope: 'user',
    invocation: '/literature',
    allowedTools: ['WebSearch', 'WebFetch'],
    instructions: 'Conduct comprehensive literature reviews using academic databases. Synthesize findings, identify research gaps, and produce structured summaries.',
    createdAt: '2023-12-20T09:00:00Z',
    lastUsed: '2024-01-24T10:15:00Z',
    usageCount: 67,
  },
  {
    id: 'skill-10',
    name: 'Data Analysis',
    description: 'Analyze datasets using Python pandas and generate insights',
    category: 'research',
    tags: ['backend', 'automation'],
    enabled: true,
    sourcePath: '~/.claude/skills/data-analysis.md',
    scope: 'project',
    invocation: '/analyze',
    allowedTools: ['Read', 'Write', 'Bash'],
    instructions: 'Analyze data using pandas, numpy, and visualization libraries. Generate statistical summaries, identify patterns, and create clear visualizations.',
    createdAt: '2023-12-18T15:00:00Z',
    lastUsed: '2024-01-23T14:45:00Z',
    usageCount: 89,
  },
  {
    id: 'skill-11',
    name: 'Commit Guidelines',
    description: 'Write clear, conventional commit messages following best practices',
    category: 'productivity',
    tags: ['automation'],
    enabled: true,
    sourcePath: '~/.claude/skills/commit-guidelines.md',
    scope: 'user',
    invocation: '/commit',
    allowedTools: ['Bash'],
    instructions: 'Write commit messages following conventional commits format. Include scope, type, and clear description of changes.',
    createdAt: '2023-12-15T11:00:00Z',
    lastUsed: '2024-01-28T09:00:00Z',
    usageCount: 234,
  },
  {
    id: 'skill-12',
    name: 'PR Review',
    description: 'Review pull requests for code quality, security, and best practices',
    category: 'productivity',
    tags: ['testing', 'backend'],
    enabled: true,
    sourcePath: '~/.claude/skills/pr-review.md',
    scope: 'user',
    invocation: '/review-pr',
    allowedTools: ['Read', 'Bash'],
    instructions: 'Review PRs systematically: check for bugs, security issues, code style, test coverage, and documentation.',
    createdAt: '2023-12-12T16:00:00Z',
    lastUsed: '2024-01-27T17:30:00Z',
    usageCount: 156,
  },
  {
    id: 'skill-13',
    name: 'Custom Template',
    description: 'A custom skill template for specialized workflows',
    category: 'other',
    tags: [],
    enabled: false,
    sourcePath: '~/.claude/skills/custom-template.md',
    scope: 'project',
    invocation: '/custom',
    allowedTools: [],
    instructions: 'This is a template for creating custom skills. Replace this content with your specific instructions.',
    createdAt: '2023-12-10T10:00:00Z',
    usageCount: 0,
  },
];

// ============================================================================
// Store
// ============================================================================

const initialFilter: SkillsFilter = {
  search: '',
  category: null,
  tags: [],
};

export const useSkillsStore = create<SkillsState>((set, get) => ({
  // Initial state
  skills: mockSkills,
  categories: mockCategories,
  tags: mockTags,
  selectedSkillId: null,
  filter: initialFilter,
  isLoading: false,

  // Actions
  setSkills: (skills) => set({ skills }),

  selectSkill: (id) => set({ selectedSkillId: id }),

  toggleSkill: (id) => {
    const { skills } = get();
    const updatedSkills = skills.map((skill) =>
      skill.id === id ? { ...skill, enabled: !skill.enabled } : skill
    );
    set({ skills: updatedSkills });
  },

  setFilter: (filter) => {
    const currentFilter = get().filter;
    set({ filter: { ...currentFilter, ...filter } });
  },

  clearFilter: () => set({ filter: initialFilter }),

  // Computed
  getFilteredSkills: () => {
    const { skills, filter } = get();
    let filtered = [...skills];

    // Search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(
        (skill) =>
          skill.name.toLowerCase().includes(searchLower) ||
          skill.description.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (filter.category) {
      filtered = filtered.filter((skill) => skill.category === filter.category);
    }

    // Tags filter
    if (filter.tags.length > 0) {
      filtered = filtered.filter((skill) =>
        filter.tags.some((tag) => skill.tags.includes(tag))
      );
    }

    return filtered;
  },

  getEnabledCount: () => {
    const { skills } = get();
    return skills.filter((skill) => skill.enabled).length;
  },

  getSelectedSkill: () => {
    const { skills, selectedSkillId } = get();
    return skills.find((skill) => skill.id === selectedSkillId);
  },
}));
