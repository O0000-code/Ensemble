import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../appStore';

describe('appStore - frontend-only state management', () => {
  // Reset store before each test
  beforeEach(() => {
    // Reset to initial state
    useAppStore.setState({
      activeCategory: null,
      activeTags: [],
      categories: [],
      tags: [],
      counts: { skills: 0, mcpServers: 0, scenes: 0, projects: 0 },
      isLoading: false,
      error: null,
      editingCategoryId: null,
      isAddingCategory: false,
      editingTagId: null,
      isAddingTag: false,
    });
  });

  describe('setActiveCategory', () => {
    it('sets the active category', () => {
      useAppStore.getState().setActiveCategory('cat-1');
      expect(useAppStore.getState().activeCategory).toBe('cat-1');
    });

    it('clears active category when set to null', () => {
      useAppStore.getState().setActiveCategory('cat-1');
      useAppStore.getState().setActiveCategory(null);
      expect(useAppStore.getState().activeCategory).toBeNull();
    });
  });

  describe('toggleActiveTag', () => {
    it('adds tag to activeTags when not present', () => {
      useAppStore.getState().toggleActiveTag('tag-1');
      expect(useAppStore.getState().activeTags).toEqual(['tag-1']);
    });

    it('removes tag from activeTags when already present', () => {
      useAppStore.getState().toggleActiveTag('tag-1');
      useAppStore.getState().toggleActiveTag('tag-1');
      expect(useAppStore.getState().activeTags).toEqual([]);
    });

    it('supports multiple active tags', () => {
      useAppStore.getState().toggleActiveTag('tag-1');
      useAppStore.getState().toggleActiveTag('tag-2');
      expect(useAppStore.getState().activeTags).toEqual(['tag-1', 'tag-2']);
    });
  });

  describe('clearActiveTags', () => {
    it('clears all active tags', () => {
      useAppStore.getState().toggleActiveTag('tag-1');
      useAppStore.getState().toggleActiveTag('tag-2');
      useAppStore.getState().clearActiveTags();
      expect(useAppStore.getState().activeTags).toEqual([]);
    });
  });

  describe('setCategories / setTags / setCounts', () => {
    it('sets categories array', () => {
      const categories = [{ id: '1', name: 'Dev', color: '#000', count: 3 }];
      useAppStore.getState().setCategories(categories);
      expect(useAppStore.getState().categories).toEqual(categories);
    });

    it('sets tags array', () => {
      const tags = [{ id: '1', name: 'react', count: 5 }];
      useAppStore.getState().setTags(tags);
      expect(useAppStore.getState().tags).toEqual(tags);
    });

    it('merges partial counts', () => {
      useAppStore.getState().setCounts({ skills: 10, mcpServers: 5 });
      const counts = useAppStore.getState().counts;
      expect(counts.skills).toBe(10);
      expect(counts.mcpServers).toBe(5);
      expect(counts.scenes).toBe(0); // untouched
      expect(counts.projects).toBe(0); // untouched
    });
  });

  describe('editing state management', () => {
    it('starts and stops editing category', () => {
      useAppStore.getState().startEditingCategory('cat-1');
      expect(useAppStore.getState().editingCategoryId).toBe('cat-1');

      useAppStore.getState().stopEditingCategory();
      expect(useAppStore.getState().editingCategoryId).toBeNull();
    });

    it('starts and stops adding category', () => {
      useAppStore.getState().startAddingCategory();
      expect(useAppStore.getState().isAddingCategory).toBe(true);

      useAppStore.getState().stopAddingCategory();
      expect(useAppStore.getState().isAddingCategory).toBe(false);
    });

    it('starts and stops editing tag', () => {
      useAppStore.getState().startEditingTag('tag-1');
      expect(useAppStore.getState().editingTagId).toBe('tag-1');

      useAppStore.getState().stopEditingTag();
      expect(useAppStore.getState().editingTagId).toBeNull();
    });

    it('clears all editing states when starting a new edit', () => {
      // Start editing a category
      useAppStore.getState().startEditingCategory('cat-1');
      // Now start editing a tag - should clear category editing
      useAppStore.getState().startEditingTag('tag-1');

      expect(useAppStore.getState().editingCategoryId).toBeNull();
      expect(useAppStore.getState().isAddingCategory).toBe(false);
      expect(useAppStore.getState().editingTagId).toBe('tag-1');
    });

    it('clearAllEditingStates resets everything', () => {
      useAppStore.getState().startEditingCategory('cat-1');
      useAppStore.getState().clearAllEditingStates();

      expect(useAppStore.getState().editingCategoryId).toBeNull();
      expect(useAppStore.getState().isAddingCategory).toBe(false);
      expect(useAppStore.getState().editingTagId).toBeNull();
      expect(useAppStore.getState().isAddingTag).toBe(false);
    });
  });
});
