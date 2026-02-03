import { create } from 'zustand';
import {
  InstalledPlugin,
  DetectedPluginSkill,
  DetectedPluginMcp,
  PluginImportItem,
} from '../types/plugin';
import { useSettingsStore } from './settingsStore';
import { useSkillsStore } from './skillsStore';
import { useMcpsStore } from './mcpsStore';
import { isTauri, safeInvoke } from '@/utils/tauri';

// ============================================================================
// Types
// ============================================================================

interface AppData {
  importedPluginSkills?: string[];
  importedPluginMcps?: string[];
  [key: string]: unknown;
}

interface PluginsState {
  // Detected plugins
  installedPlugins: InstalledPlugin[];

  // Detected plugin Skills/MCPs (for import)
  detectedPluginSkills: DetectedPluginSkill[];
  detectedPluginMcps: DetectedPluginMcp[];

  // Imported records (loaded from AppData)
  importedPluginSkills: string[];  // pluginId list
  importedPluginMcps: string[];

  // Plugin enabled status cache
  pluginEnabledStatus: Record<string, boolean>;

  // Loading states
  isLoading: boolean;
  isDetectingSkills: boolean;
  isDetectingMcps: boolean;
  isImporting: boolean;

  // Error state
  error: string | null;

  // Actions
  loadInstalledPlugins: () => Promise<void>;
  detectPluginSkillsForImport: () => Promise<void>;
  detectPluginMcpsForImport: () => Promise<void>;
  importPluginSkills: (items: PluginImportItem[]) => Promise<string[]>;
  importPluginMcps: (items: PluginImportItem[]) => Promise<string[]>;
  refreshPluginEnabledStatus: () => Promise<void>;
  loadImportedPluginIds: () => Promise<void>;
  setImportedPluginSkills: (ids: string[]) => void;
  setImportedPluginMcps: (ids: string[]) => void;
  addImportedPluginSkills: (ids: string[]) => void;
  addImportedPluginMcps: (ids: string[]) => void;
  clearError: () => void;

  // Computed
  getUnimportedPluginSkills: () => DetectedPluginSkill[];
  getUnimportedPluginMcps: () => DetectedPluginMcp[];
}

// ============================================================================
// Helper: Persist imported plugin IDs to AppData
// ============================================================================
const persistImportedPluginIds = async (
  importedPluginSkills: string[],
  importedPluginMcps: string[]
) => {
  if (!isTauri()) {
    return;
  }

  try {
    // Read current AppData
    const appData = await safeInvoke<AppData>('read_app_data');

    if (appData) {
      // Update the imported plugin IDs
      appData.importedPluginSkills = importedPluginSkills;
      appData.importedPluginMcps = importedPluginMcps;

      // Write back to disk
      await safeInvoke('write_app_data', { data: appData });
    }
  } catch (error) {
    console.error('Failed to persist imported plugin IDs:', error);
  }
};

// ============================================================================
// Store
// ============================================================================

export const usePluginsStore = create<PluginsState>((set, get) => ({
  // Initial state
  installedPlugins: [],
  detectedPluginSkills: [],
  detectedPluginMcps: [],
  importedPluginSkills: [],
  importedPluginMcps: [],
  pluginEnabledStatus: {},
  isLoading: false,
  isDetectingSkills: false,
  isDetectingMcps: false,
  isImporting: false,
  error: null,

  // ============================================================================
  // Load installed plugins
  // ============================================================================
  loadInstalledPlugins: async () => {
    if (!isTauri()) {
      console.warn('PluginsStore: Cannot load installed plugins in browser mode');
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const plugins = await safeInvoke<InstalledPlugin[]>('detect_installed_plugins');

      if (plugins) {
        set({ installedPlugins: plugins, isLoading: false });

        // Also update the enabled status cache
        const statusMap: Record<string, boolean> = {};
        for (const plugin of plugins) {
          statusMap[plugin.id] = plugin.enabled;
        }
        set({ pluginEnabledStatus: statusMap });
      } else {
        set({ installedPlugins: [], isLoading: false });
      }
    } catch (error) {
      const message = typeof error === 'string' ? error : String(error);
      console.error('Failed to load installed plugins:', error);
      set({ error: message, isLoading: false });
    }
  },

  // ============================================================================
  // Detect plugin Skills for import
  // ============================================================================
  detectPluginSkillsForImport: async () => {
    if (!isTauri()) {
      console.warn('PluginsStore: Cannot detect plugin skills in browser mode');
      return;
    }

    set({ isDetectingSkills: true, error: null });

    try {
      const { importedPluginSkills } = get();
      const skills = await safeInvoke<DetectedPluginSkill[]>('detect_plugin_skills', {
        importedPluginSkills,
      });

      set({
        detectedPluginSkills: skills || [],
        isDetectingSkills: false
      });
    } catch (error) {
      const message = typeof error === 'string' ? error : String(error);
      console.error('Failed to detect plugin skills:', error);
      set({ error: message, isDetectingSkills: false });
    }
  },

  // ============================================================================
  // Detect plugin MCPs for import
  // ============================================================================
  detectPluginMcpsForImport: async () => {
    if (!isTauri()) {
      console.warn('PluginsStore: Cannot detect plugin MCPs in browser mode');
      return;
    }

    set({ isDetectingMcps: true, error: null });

    try {
      const { importedPluginMcps } = get();
      const mcps = await safeInvoke<DetectedPluginMcp[]>('detect_plugin_mcps', {
        importedPluginMcps,
      });

      set({
        detectedPluginMcps: mcps || [],
        isDetectingMcps: false
      });
    } catch (error) {
      const message = typeof error === 'string' ? error : String(error);
      console.error('Failed to detect plugin MCPs:', error);
      set({ error: message, isDetectingMcps: false });
    }
  },

  // ============================================================================
  // Import plugin Skills
  // ============================================================================
  importPluginSkills: async (items: PluginImportItem[]) => {
    if (!isTauri()) {
      console.warn('PluginsStore: Cannot import plugin skills in browser mode');
      return [];
    }

    if (items.length === 0) {
      return [];
    }

    set({ isImporting: true, error: null });

    try {
      const { skillSourceDir } = useSettingsStore.getState();

      const importedIds = await safeInvoke<string[]>('import_plugin_skills', {
        items,
        destDir: skillSourceDir,
      });

      if (importedIds && importedIds.length > 0) {
        // Update the imported plugin skills list
        get().addImportedPluginSkills(importedIds);

        // Reload skills to show the newly imported ones
        await useSkillsStore.getState().loadSkills();
      }

      set({ isImporting: false });
      return importedIds || [];
    } catch (error) {
      const message = typeof error === 'string' ? error : String(error);
      console.error('Failed to import plugin skills:', error);
      set({ error: message, isImporting: false });
      return [];
    }
  },

  // ============================================================================
  // Import plugin MCPs
  // ============================================================================
  importPluginMcps: async (items: PluginImportItem[]) => {
    if (!isTauri()) {
      console.warn('PluginsStore: Cannot import plugin MCPs in browser mode');
      return [];
    }

    if (items.length === 0) {
      return [];
    }

    set({ isImporting: true, error: null });

    try {
      const { mcpSourceDir } = useSettingsStore.getState();

      const importedIds = await safeInvoke<string[]>('import_plugin_mcps', {
        items,
        destDir: mcpSourceDir,
      });

      if (importedIds && importedIds.length > 0) {
        // Update the imported plugin MCPs list
        get().addImportedPluginMcps(importedIds);

        // Reload MCPs to show the newly imported ones
        await useMcpsStore.getState().loadMcps();
      }

      set({ isImporting: false });
      return importedIds || [];
    } catch (error) {
      const message = typeof error === 'string' ? error : String(error);
      console.error('Failed to import plugin MCPs:', error);
      set({ error: message, isImporting: false });
      return [];
    }
  },

  // ============================================================================
  // Refresh plugin enabled status
  // ============================================================================
  refreshPluginEnabledStatus: async () => {
    if (!isTauri()) {
      console.warn('PluginsStore: Cannot refresh plugin enabled status in browser mode');
      return;
    }

    try {
      const { installedPlugins } = get();
      const pluginIds = installedPlugins.map((p) => p.id);

      if (pluginIds.length === 0) {
        return;
      }

      const status = await safeInvoke<Record<string, boolean>>('check_plugins_enabled', {
        pluginIds,
      });

      if (status) {
        set({ pluginEnabledStatus: status });
      }
    } catch (error) {
      const message = typeof error === 'string' ? error : String(error);
      console.error('Failed to refresh plugin enabled status:', error);
      set({ error: message });
    }
  },

  // ============================================================================
  // Load imported plugin IDs from AppData
  // ============================================================================
  loadImportedPluginIds: async () => {
    if (!isTauri()) {
      console.warn('PluginsStore: Cannot load imported plugin IDs in browser mode');
      return;
    }

    try {
      const appData = await safeInvoke<AppData>('read_app_data');

      if (appData) {
        set({
          importedPluginSkills: appData.importedPluginSkills || [],
          importedPluginMcps: appData.importedPluginMcps || [],
        });
      }
    } catch (error) {
      const message = typeof error === 'string' ? error : String(error);
      console.error('Failed to load imported plugin IDs:', error);
      set({ error: message });
    }
  },

  // ============================================================================
  // Set imported plugin Skills (with persistence)
  // ============================================================================
  setImportedPluginSkills: (ids: string[]) => {
    set({ importedPluginSkills: ids });
    // Persist to AppData
    const { importedPluginMcps } = get();
    persistImportedPluginIds(ids, importedPluginMcps);
  },

  // ============================================================================
  // Set imported plugin MCPs (with persistence)
  // ============================================================================
  setImportedPluginMcps: (ids: string[]) => {
    set({ importedPluginMcps: ids });
    // Persist to AppData
    const { importedPluginSkills } = get();
    persistImportedPluginIds(importedPluginSkills, ids);
  },

  // ============================================================================
  // Add imported plugin Skills (with persistence)
  // ============================================================================
  addImportedPluginSkills: (ids: string[]) => {
    const { importedPluginSkills, importedPluginMcps } = get();
    const newIds = [...new Set([...importedPluginSkills, ...ids])];
    set({ importedPluginSkills: newIds });
    // Persist to AppData
    persistImportedPluginIds(newIds, importedPluginMcps);
  },

  // ============================================================================
  // Add imported plugin MCPs (with persistence)
  // ============================================================================
  addImportedPluginMcps: (ids: string[]) => {
    const { importedPluginSkills, importedPluginMcps } = get();
    const newIds = [...new Set([...importedPluginMcps, ...ids])];
    set({ importedPluginMcps: newIds });
    // Persist to AppData
    persistImportedPluginIds(importedPluginSkills, newIds);
  },

  // ============================================================================
  // Clear error
  // ============================================================================
  clearError: () => set({ error: null }),

  // ============================================================================
  // Computed: Get unimported plugin Skills
  // ============================================================================
  getUnimportedPluginSkills: () => {
    const { detectedPluginSkills } = get();
    return detectedPluginSkills.filter((skill) => !skill.isImported);
  },

  // ============================================================================
  // Computed: Get unimported plugin MCPs
  // ============================================================================
  getUnimportedPluginMcps: () => {
    const { detectedPluginMcps } = get();
    return detectedPluginMcps.filter((mcp) => !mcp.isImported);
  },
}));
