import { create } from 'zustand';
import type { Skill } from '../types';
import { useSettingsStore } from './settingsStore';
import { useAppStore } from './appStore';
import { isTauri, safeInvoke } from '@/utils/tauri';

// Classification types
interface ClassifyItem {
  id: string;
  name: string;
  description: string;
  instructions?: string;
}

interface ClassifyResult {
  id: string;
  suggested_category: string;
  suggested_tags: string[];
  confidence: number;
}

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

  // Selection
  selectedSkillId: string | null;

  // Filter
  filter: SkillsFilter;

  // Loading state
  isLoading: boolean;

  // Error state
  error: string | null;

  // Classification state
  isClassifying: boolean;

  // Actions
  loadSkills: () => Promise<void>;
  setSkills: (skills: Skill[]) => void;
  selectSkill: (id: string | null) => void;
  toggleSkill: (id: string) => Promise<void>;
  updateSkillCategory: (id: string, category: string) => Promise<void>;
  updateSkillTags: (id: string, tags: string[]) => Promise<void>;
  updateSkillIcon: (id: string, icon: string) => Promise<void>;
  setFilter: (filter: Partial<SkillsFilter>) => void;
  clearFilter: () => void;
  clearError: () => void;
  autoClassify: () => Promise<void>;

  // Computed
  getFilteredSkills: () => Skill[];
  getEnabledCount: () => number;
  getSelectedSkill: () => Skill | undefined;
}

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
  skills: [],
  selectedSkillId: null,
  filter: initialFilter,
  isLoading: false,
  isClassifying: false,
  error: null,

  // Actions
  loadSkills: async () => {
    // Skip in non-Tauri environment
    if (!isTauri()) {
      console.warn('SkillsStore: Cannot load skills in browser mode');
      set({ isLoading: false });
      return;
    }

    const { skillSourceDir } = useSettingsStore.getState();
    set({ isLoading: true, error: null });
    try {
      const skills = await safeInvoke<Skill[]>('scan_skills', {
        sourceDir: skillSourceDir,
      });
      set({ skills: skills || [], isLoading: false });
    } catch (error) {
      const message = typeof error === 'string' ? error : String(error);
      set({ error: message, isLoading: false });
    }
  },

  setSkills: (skills) => set({ skills }),

  selectSkill: (id) => set({ selectedSkillId: id }),

  toggleSkill: async (id) => {
    // Skip in non-Tauri environment
    if (!isTauri()) {
      console.warn('SkillsStore: Cannot toggle skill in browser mode');
      return;
    }

    const skill = get().skills.find((s) => s.id === id);
    if (!skill) return;

    const newEnabled = !skill.enabled;

    // Optimistic update
    set((state) => ({
      skills: state.skills.map((s) =>
        s.id === id ? { ...s, enabled: newEnabled } : s
      ),
    }));

    try {
      await safeInvoke('update_skill_metadata', {
        skillId: id,
        enabled: newEnabled,
      });
    } catch (error) {
      // Rollback on error
      const message = typeof error === 'string' ? error : String(error);
      set((state) => ({
        skills: state.skills.map((s) =>
          s.id === id ? { ...s, enabled: skill.enabled } : s
        ),
        error: message,
      }));
    }
  },

  updateSkillCategory: async (id, category) => {
    // Skip in non-Tauri environment
    if (!isTauri()) {
      console.warn('SkillsStore: Cannot update skill category in browser mode');
      return;
    }

    const skill = get().skills.find((s) => s.id === id);
    if (!skill) return;

    const oldCategory = skill.category;

    // Optimistic update
    set((state) => ({
      skills: state.skills.map((s) =>
        s.id === id ? { ...s, category } : s
      ),
    }));

    try {
      await safeInvoke('update_skill_metadata', {
        skillId: id,
        category,
      });
    } catch (error) {
      // Rollback on error
      const message = typeof error === 'string' ? error : String(error);
      set((state) => ({
        skills: state.skills.map((s) =>
          s.id === id ? { ...s, category: oldCategory } : s
        ),
        error: message,
      }));
    }
  },

  updateSkillTags: async (id, tags) => {
    // Skip in non-Tauri environment
    if (!isTauri()) {
      console.warn('SkillsStore: Cannot update skill tags in browser mode');
      return;
    }

    const skill = get().skills.find((s) => s.id === id);
    if (!skill) return;

    const oldTags = skill.tags;

    // Optimistic update
    set((state) => ({
      skills: state.skills.map((s) =>
        s.id === id ? { ...s, tags } : s
      ),
    }));

    try {
      await safeInvoke('update_skill_metadata', {
        skillId: id,
        tags,
      });
    } catch (error) {
      // Rollback on error
      const message = typeof error === 'string' ? error : String(error);
      set((state) => ({
        skills: state.skills.map((s) =>
          s.id === id ? { ...s, tags: oldTags } : s
        ),
        error: message,
      }));
    }
  },

  updateSkillIcon: async (id, icon) => {
    // Skip in non-Tauri environment
    if (!isTauri()) {
      console.warn('SkillsStore: Cannot update skill icon in browser mode');
      return;
    }

    const skill = get().skills.find((s) => s.id === id);
    if (!skill) return;

    const oldIcon = skill.icon;

    // Optimistic update
    set((state) => ({
      skills: state.skills.map((s) =>
        s.id === id ? { ...s, icon } : s
      ),
    }));

    try {
      await safeInvoke('update_skill_metadata', {
        skillId: id,
        icon,
      });
    } catch (error) {
      // Rollback on error
      const message = typeof error === 'string' ? error : String(error);
      set((state) => ({
        skills: state.skills.map((s) =>
          s.id === id ? { ...s, icon: oldIcon } : s
        ),
        error: message,
      }));
    }
  },

  setFilter: (filter) => {
    const currentFilter = get().filter;
    set({ filter: { ...currentFilter, ...filter } });
  },

  clearFilter: () => set({ filter: initialFilter }),

  clearError: () => set({ error: null }),

  autoClassify: async () => {
    // Skip in non-Tauri environment
    if (!isTauri()) {
      console.warn('SkillsStore: Cannot auto-classify in browser mode');
      set({ error: 'Auto-classification is not available in browser mode' });
      return;
    }

    const { skills } = get();
    const { anthropicApiKey } = useSettingsStore.getState();
    const { categories, tags } = useAppStore.getState();

    if (!anthropicApiKey) {
      set({ error: 'API key is required for auto-classification. Please configure it in Settings.' });
      return;
    }

    // Get skills that need classification (uncategorized or no tags)
    const skillsToClassify = skills.filter(
      (s) => !s.category || s.category === 'Uncategorized' || s.tags.length === 0
    );

    if (skillsToClassify.length === 0) {
      set({ error: 'No skills need classification.' });
      return;
    }

    set({ isClassifying: true, error: null });

    try {
      // Prepare items for classification
      const items: ClassifyItem[] = skillsToClassify.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        instructions: s.instructions,
      }));

      // Get existing categories and tags
      const existingCategories = categories.map((c) => c.name);
      const existingTags = tags.map((t) => t.name);

      // Call the classification API
      const results = await safeInvoke<ClassifyResult[]>('auto_classify', {
        items,
        apiKey: anthropicApiKey,
        existingCategories,
        existingTags,
      });

      if (!results) {
        set({ error: 'Classification failed', isClassifying: false });
        return;
      }

      // Apply classification results
      for (const result of results) {
        const skill = skills.find((s) => s.id === result.id);
        if (skill) {
          // Update category
          if (result.suggested_category && result.suggested_category !== skill.category) {
            await safeInvoke('update_skill_metadata', {
              skillId: result.id,
              category: result.suggested_category,
            });
          }
          // Update tags
          if (result.suggested_tags.length > 0) {
            const newTags = [...new Set([...skill.tags, ...result.suggested_tags])];
            await safeInvoke('update_skill_metadata', {
              skillId: result.id,
              tags: newTags,
            });
          }
        }
      }

      // Reload skills to get updated data
      await get().loadSkills();
      set({ isClassifying: false });
    } catch (error) {
      const message = typeof error === 'string' ? error : String(error);
      set({ error: message, isClassifying: false });
    }
  },

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
