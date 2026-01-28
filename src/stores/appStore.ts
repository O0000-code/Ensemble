import { create } from 'zustand';
import { Category, Tag } from '@/types';
import { isTauri, safeInvoke } from '@/utils/tauri';

interface AppState {
  // Navigation state (frontend-only)
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

  // Loading state
  isLoading: boolean;
  error: string | null;

  // Frontend-only Actions
  setActiveCategory: (categoryId: string | null) => void;
  toggleActiveTag: (tagId: string) => void;
  clearActiveTags: () => void;

  // Data setters (for receiving Tauri data)
  setCategories: (categories: Category[]) => void;
  setTags: (tags: Tag[]) => void;
  setCounts: (counts: Partial<AppState['counts']>) => void;

  // Tauri-integrated Actions
  loadCategories: () => Promise<void>;
  loadTags: () => Promise<void>;
  addCategory: (name: string, color: string) => Promise<Category>;
  updateCategory: (id: string, name?: string, color?: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addTag: (name: string) => Promise<Tag>;
  deleteTag: (id: string) => Promise<void>;
  initApp: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  activeCategory: null,
  activeTags: [],
  categories: [],
  tags: [],
  counts: {
    skills: 0,
    mcpServers: 0,
    scenes: 0,
    projects: 0,
  },
  isLoading: false,
  error: null,

  // Frontend-only Actions
  setActiveCategory: (categoryId) => set({ activeCategory: categoryId }),

  toggleActiveTag: (tagId) => set((state) => ({
    activeTags: state.activeTags.includes(tagId)
      ? state.activeTags.filter((id) => id !== tagId)
      : [...state.activeTags, tagId],
  })),

  clearActiveTags: () => set({ activeTags: [] }),

  // Data setters
  setCategories: (categories) => set({ categories }),
  setTags: (tags) => set({ tags }),
  setCounts: (counts) => set((state) => ({ counts: { ...state.counts, ...counts } })),

  // Tauri-integrated Actions
  loadCategories: async () => {
    // Skip in non-Tauri environment
    if (!isTauri()) {
      console.warn('AppStore: Cannot load categories in browser mode');
      return;
    }

    try {
      const categories = await safeInvoke<Category[]>('get_categories');
      if (categories) {
        set({ categories });
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      const message = typeof error === 'string' ? error : String(error);
      set({ error: message });
    }
  },

  loadTags: async () => {
    // Skip in non-Tauri environment
    if (!isTauri()) {
      console.warn('AppStore: Cannot load tags in browser mode');
      return;
    }

    try {
      const tags = await safeInvoke<Tag[]>('get_tags');
      if (tags) {
        set({ tags });
      }
    } catch (error) {
      console.error('Failed to load tags:', error);
      const message = typeof error === 'string' ? error : String(error);
      set({ error: message });
    }
  },

  addCategory: async (name: string, color: string) => {
    // Skip in non-Tauri environment
    if (!isTauri()) {
      console.warn('AppStore: Cannot add category in browser mode');
      throw new Error('Not available in browser mode');
    }

    try {
      const category = await safeInvoke<Category>('add_category', { name, color });
      if (category) {
        set((state) => ({ categories: [...state.categories, category] }));
        return category;
      }
      throw new Error('Failed to create category');
    } catch (error) {
      console.error('Failed to add category:', error);
      const message = typeof error === 'string' ? error : String(error);
      set({ error: message });
      throw error;
    }
  },

  updateCategory: async (id: string, name?: string, color?: string) => {
    // Skip in non-Tauri environment
    if (!isTauri()) {
      console.warn('AppStore: Cannot update category in browser mode');
      throw new Error('Not available in browser mode');
    }

    try {
      await safeInvoke('update_category', { id, name, color });
      set((state) => ({
        categories: state.categories.map((c) =>
          c.id === id
            ? { ...c, ...(name !== undefined && { name }), ...(color !== undefined && { color }) }
            : c
        ),
      }));
    } catch (error) {
      console.error('Failed to update category:', error);
      const message = typeof error === 'string' ? error : String(error);
      set({ error: message });
      throw error;
    }
  },

  deleteCategory: async (id: string) => {
    // Skip in non-Tauri environment
    if (!isTauri()) {
      console.warn('AppStore: Cannot delete category in browser mode');
      throw new Error('Not available in browser mode');
    }

    try {
      await safeInvoke('delete_category', { id });
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
        activeCategory: state.activeCategory === id ? null : state.activeCategory,
      }));
    } catch (error) {
      console.error('Failed to delete category:', error);
      const message = typeof error === 'string' ? error : String(error);
      set({ error: message });
      throw error;
    }
  },

  addTag: async (name: string) => {
    // Skip in non-Tauri environment
    if (!isTauri()) {
      console.warn('AppStore: Cannot add tag in browser mode');
      throw new Error('Not available in browser mode');
    }

    try {
      const tag = await safeInvoke<Tag>('add_tag', { name });
      if (tag) {
        set((state) => ({ tags: [...state.tags, tag] }));
        return tag;
      }
      throw new Error('Failed to create tag');
    } catch (error) {
      console.error('Failed to add tag:', error);
      const message = typeof error === 'string' ? error : String(error);
      set({ error: message });
      throw error;
    }
  },

  deleteTag: async (id: string) => {
    // Skip in non-Tauri environment
    if (!isTauri()) {
      console.warn('AppStore: Cannot delete tag in browser mode');
      throw new Error('Not available in browser mode');
    }

    try {
      await safeInvoke('delete_tag', { id });
      set((state) => ({
        tags: state.tags.filter((t) => t.id !== id),
        activeTags: state.activeTags.filter((t) => t !== id),
      }));
    } catch (error) {
      console.error('Failed to delete tag:', error);
      const message = typeof error === 'string' ? error : String(error);
      set({ error: message });
      throw error;
    }
  },

  initApp: async () => {
    // Skip in non-Tauri environment
    if (!isTauri()) {
      console.warn('AppStore: Cannot initialize app in browser mode');
      set({ isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      await safeInvoke('init_app_data');
      await Promise.all([
        get().loadCategories(),
        get().loadTags(),
      ]);
      set({ isLoading: false });
    } catch (error) {
      console.error('Failed to initialize app:', error);
      const message = typeof error === 'string' ? error : String(error);
      set({ error: message, isLoading: false });
    }
  },
}));
