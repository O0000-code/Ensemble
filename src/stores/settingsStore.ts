import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import type { AppSettings } from '../types';

// ============================================================================
// Settings Store
// ============================================================================
// Manages application settings including storage paths, API configuration,
// and auto-classify preferences. Uses Tauri backend for persistence.

export interface SettingsStats {
  skillsCount: number;
  mcpsCount: number;
  scenesCount: number;
  totalSize: string;
}

export interface SettingsState {
  // Storage paths
  skillSourceDir: string;
  mcpSourceDir: string;
  claudeConfigDir: string;

  // API configuration
  anthropicApiKey: string;

  // Auto classify settings
  autoClassifyNewItems: boolean;

  // Stats (computed from other stores or fetched)
  stats: SettingsStats;

  // Loading state
  isLoading: boolean;
  error: string | null;

  // Actions - Setters (with auto-save)
  setSkillSourceDir: (dir: string) => void;
  setMcpSourceDir: (dir: string) => void;
  setClaudeConfigDir: (dir: string) => void;
  setAnthropicApiKey: (key: string) => void;
  setAutoClassifyNewItems: (enabled: boolean) => void;
  setStats: (stats: Partial<SettingsStats>) => void;

  // Actions - Tauri integration
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
  selectDirectory: (type: 'skill' | 'mcp' | 'claude') => Promise<void>;

  // Utility
  getMaskedApiKey: () => string;
  hasApiKey: () => boolean;
}

// Default values
const defaultSettings = {
  skillSourceDir: '~/.ensemble/skills',
  mcpSourceDir: '~/.ensemble/mcps',
  claudeConfigDir: '~/.claude',
  anthropicApiKey: '',
  autoClassifyNewItems: false,
  stats: {
    skillsCount: 0,
    mcpsCount: 0,
    scenesCount: 0,
    totalSize: '0 MB',
  },
};

export const useSettingsStore = create<SettingsState>()((set, get) => ({
  // Initial state
  ...defaultSettings,
  isLoading: false,
  error: null,

  // Actions - Setters (with auto-save)
  setSkillSourceDir: (dir: string) => {
    set({ skillSourceDir: dir });
    get().saveSettings();
  },

  setMcpSourceDir: (dir: string) => {
    set({ mcpSourceDir: dir });
    get().saveSettings();
  },

  setClaudeConfigDir: (dir: string) => {
    set({ claudeConfigDir: dir });
    get().saveSettings();
  },

  setAnthropicApiKey: (key: string) => {
    set({ anthropicApiKey: key });
    get().saveSettings();
  },

  setAutoClassifyNewItems: (enabled: boolean) => {
    set({ autoClassifyNewItems: enabled });
    get().saveSettings();
  },

  setStats: (stats: Partial<SettingsStats>) =>
    set((state) => ({
      stats: { ...state.stats, ...stats },
    })),

  // Actions - Tauri integration
  loadSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const settings = await invoke<AppSettings>('read_settings');
      set({
        skillSourceDir: settings.skillSourceDir,
        mcpSourceDir: settings.mcpSourceDir,
        claudeConfigDir: settings.claudeConfigDir,
        anthropicApiKey: settings.anthropicApiKey || '',
        autoClassifyNewItems: settings.autoClassifyNewItems,
        isLoading: false,
      });
    } catch (error) {
      const message = typeof error === 'string' ? error : String(error);
      console.error('Failed to load settings:', error);
      set({ error: message, isLoading: false });
    }
  },

  saveSettings: async () => {
    const state = get();
    try {
      await invoke('write_settings', {
        settings: {
          skillSourceDir: state.skillSourceDir,
          mcpSourceDir: state.mcpSourceDir,
          claudeConfigDir: state.claudeConfigDir,
          anthropicApiKey: state.anthropicApiKey,
          autoClassifyNewItems: state.autoClassifyNewItems,
        },
      });
    } catch (error) {
      const message = typeof error === 'string' ? error : String(error);
      console.error('Failed to save settings:', error);
      set({ error: message });
    }
  },

  selectDirectory: async (type: 'skill' | 'mcp' | 'claude') => {
    try {
      const path = await invoke<string | null>('select_folder');
      if (path) {
        if (type === 'skill') {
          set({ skillSourceDir: path });
        } else if (type === 'mcp') {
          set({ mcpSourceDir: path });
        } else {
          set({ claudeConfigDir: path });
        }
        // Save settings after directory selection
        get().saveSettings();
      }
    } catch (error) {
      const message = typeof error === 'string' ? error : String(error);
      console.error('Failed to select directory:', error);
      set({ error: message });
    }
  },

  // Utility functions
  getMaskedApiKey: () => {
    const key = get().anthropicApiKey;
    if (!key) return '';
    // Show first 10 chars and mask the rest
    if (key.length <= 15) {
      return key.substring(0, 7) + '***...';
    }
    return key.substring(0, 10) + '***...';
  },

  hasApiKey: () => {
    const key = get().anthropicApiKey;
    return key.length > 0;
  },
}));
