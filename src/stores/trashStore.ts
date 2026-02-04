import { create } from 'zustand';
import type { TrashedItems } from '@/types';
import { isTauri, safeInvoke } from '@/utils/tauri';
import { useSettingsStore } from './settingsStore';

// ============================================================================
// Trash Store
// ============================================================================
// Manages trash/recycle bin state for deleted Skills, MCPs, and CLAUDE.md files.
// Provides restore functionality for recovering deleted items.

interface TrashState {
  trashedItems: TrashedItems | null;
  isLoading: boolean;
  isRestoring: boolean;
  error: string | null;

  // Actions
  loadTrashedItems: () => Promise<void>;
  restoreSkill: (path: string) => Promise<boolean>;
  restoreMcp: (path: string) => Promise<boolean>;
  restoreClaudeMd: (path: string) => Promise<boolean>;
  clearError: () => void;
}

export const useTrashStore = create<TrashState>((set, get) => ({
  // Initial state
  trashedItems: null,
  isLoading: false,
  isRestoring: false,
  error: null,

  // Actions
  loadTrashedItems: async () => {
    // Skip in non-Tauri environment
    if (!isTauri()) {
      console.warn('TrashStore: Cannot load trashed items in browser mode');
      set({ isLoading: false });
      return;
    }

    const { skillSourceDir } = useSettingsStore.getState();
    // Extract ensemble dir from skillSourceDir (e.g., "~/.ensemble/skills" -> "~/.ensemble")
    const ensembleDir = skillSourceDir.replace('/skills', '');

    set({ isLoading: true, error: null });

    try {
      const items = await safeInvoke<TrashedItems>('list_trashed_items', {
        ensembleDir,
      });
      set({ trashedItems: items, isLoading: false });
    } catch (error) {
      const message = typeof error === 'string' ? error : String(error);
      set({ error: message, isLoading: false });
    }
  },

  restoreSkill: async (path: string) => {
    // Skip in non-Tauri environment
    if (!isTauri()) {
      console.warn('TrashStore: Cannot restore skill in browser mode');
      return false;
    }

    const { skillSourceDir } = useSettingsStore.getState();
    const ensembleDir = skillSourceDir.replace('/skills', '');

    set({ isRestoring: true, error: null });

    try {
      await safeInvoke('restore_skill', {
        trashPath: path,
        ensembleDir,
      });
      // Reload trashed items after successful restore
      await get().loadTrashedItems();
      set({ isRestoring: false });
      return true;
    } catch (error) {
      const message = typeof error === 'string' ? error : String(error);
      set({ error: message, isRestoring: false });
      return false;
    }
  },

  restoreMcp: async (path: string) => {
    // Skip in non-Tauri environment
    if (!isTauri()) {
      console.warn('TrashStore: Cannot restore MCP in browser mode');
      return false;
    }

    const { skillSourceDir } = useSettingsStore.getState();
    const ensembleDir = skillSourceDir.replace('/skills', '');

    set({ isRestoring: true, error: null });

    try {
      await safeInvoke('restore_mcp', {
        trashPath: path,
        ensembleDir,
      });
      // Reload trashed items after successful restore
      await get().loadTrashedItems();
      set({ isRestoring: false });
      return true;
    } catch (error) {
      const message = typeof error === 'string' ? error : String(error);
      set({ error: message, isRestoring: false });
      return false;
    }
  },

  restoreClaudeMd: async (path: string) => {
    // Skip in non-Tauri environment
    if (!isTauri()) {
      console.warn('TrashStore: Cannot restore CLAUDE.md in browser mode');
      return false;
    }

    set({ isRestoring: true, error: null });

    try {
      await safeInvoke('restore_claude_md', {
        trashPath: path,
      });
      // Reload trashed items after successful restore
      await get().loadTrashedItems();
      set({ isRestoring: false });
      return true;
    } catch (error) {
      const message = typeof error === 'string' ? error : String(error);
      set({ error: message, isRestoring: false });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
