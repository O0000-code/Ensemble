import { create } from 'zustand';
import { Category, Tag } from '@/types';

interface AppState {
  // Navigation state
  activeCategory: string | null;
  activeTags: string[];

  // Data
  categories: Category[];
  tags: Tag[];

  // Counts
  counts: {
    skills: number;
    mcpServers: number;
    scenes: number;
    projects: number;
  };

  // Actions
  setActiveCategory: (categoryId: string | null) => void;
  toggleActiveTag: (tagId: string) => void;
  setCategories: (categories: Category[]) => void;
  setTags: (tags: Tag[]) => void;
  setCounts: (counts: Partial<AppState['counts']>) => void;
}

// Initial mock data for development
const mockCategories: Category[] = [
  { id: '1', name: 'Development', color: '#18181B', count: 42 },
  { id: '2', name: 'Design', color: '#71717A', count: 18 },
  { id: '3', name: 'Research', color: '#16A34A', count: 12 },
  { id: '4', name: 'Productivity', color: '#D97706', count: 5 },
  { id: '5', name: 'Uncategorized', color: '#A1A1AA', count: 50 },
];

const mockTags: Tag[] = [
  { id: '1', name: 'React', count: 15 },
  { id: '2', name: 'Frontend', count: 22 },
  { id: '3', name: 'Python', count: 8 },
  { id: '4', name: 'AI/ML', count: 12 },
  { id: '5', name: 'TypeScript', count: 18 },
  { id: '6', name: 'Backend', count: 10 },
  { id: '7', name: 'Database', count: 6 },
  { id: '8', name: 'DevOps', count: 4 },
];

export const useAppStore = create<AppState>((set) => ({
  activeCategory: null,
  activeTags: [],
  categories: mockCategories,
  tags: mockTags,
  counts: {
    skills: 127,
    mcpServers: 18,
    scenes: 8,
    projects: 24,
  },

  setActiveCategory: (categoryId) => set({ activeCategory: categoryId }),
  toggleActiveTag: (tagId) => set((state) => ({
    activeTags: state.activeTags.includes(tagId)
      ? state.activeTags.filter((id) => id !== tagId)
      : [...state.activeTags, tagId],
  })),
  setCategories: (categories) => set({ categories }),
  setTags: (tags) => set({ tags }),
  setCounts: (counts) => set((state) => ({ counts: { ...state.counts, ...counts } })),
}));
