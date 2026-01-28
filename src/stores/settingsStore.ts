import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================================================
// Settings Store
// ============================================================================
// Manages application settings including storage paths, API configuration,
// and auto-classify preferences.

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

  // Actions
  setSkillSourceDir: (dir: string) => void;
  setMcpSourceDir: (dir: string) => void;
  setClaudeConfigDir: (dir: string) => void;
  setAnthropicApiKey: (key: string) => void;
  setAutoClassifyNewItems: (enabled: boolean) => void;
  setStats: (stats: Partial<SettingsStats>) => void;

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
    skillsCount: 127,
    mcpsCount: 18,
    scenesCount: 8,
    totalSize: '2.4 MB',
  },
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Initial state
      ...defaultSettings,

      // Actions
      setSkillSourceDir: (dir: string) => set({ skillSourceDir: dir }),

      setMcpSourceDir: (dir: string) => set({ mcpSourceDir: dir }),

      setClaudeConfigDir: (dir: string) => set({ claudeConfigDir: dir }),

      setAnthropicApiKey: (key: string) => set({ anthropicApiKey: key }),

      setAutoClassifyNewItems: (enabled: boolean) => set({ autoClassifyNewItems: enabled }),

      setStats: (stats: Partial<SettingsStats>) =>
        set((state) => ({
          stats: { ...state.stats, ...stats }
        })),

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
    }),
    {
      name: 'ensemble-settings',
      // Only persist certain fields, not stats
      partialize: (state) => ({
        skillSourceDir: state.skillSourceDir,
        mcpSourceDir: state.mcpSourceDir,
        claudeConfigDir: state.claudeConfigDir,
        anthropicApiKey: state.anthropicApiKey,
        autoClassifyNewItems: state.autoClassifyNewItems,
      }),
    }
  )
);
