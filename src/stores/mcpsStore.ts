import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { McpServer } from '@/types';
import { useSettingsStore } from './settingsStore';

interface McpsFilter {
  search: string;
  category: string | null;
  tags: string[];
}

interface McpsState {
  mcpServers: McpServer[];
  selectedMcpId: string | null;
  filter: McpsFilter;
  isLoading: boolean;
  error: string | null;

  // Actions
  setMcpServers: (servers: McpServer[]) => void;
  selectMcp: (id: string | null) => void;
  toggleMcp: (id: string) => Promise<void>;
  setFilter: (filter: Partial<McpsFilter>) => void;
  loadMcps: () => Promise<void>;
  updateMcpCategory: (id: string, category: string) => Promise<void>;
  updateMcpTags: (id: string, tags: string[]) => Promise<void>;

  // Computed getters (via selectors)
  getFilteredMcps: () => McpServer[];
  getEnabledCount: () => number;
  getSelectedMcp: () => McpServer | undefined;
}

export const useMcpsStore = create<McpsState>((set, get) => ({
  mcpServers: [],
  selectedMcpId: null,
  filter: {
    search: '',
    category: null,
    tags: [],
  },
  isLoading: false,
  error: null,

  setMcpServers: (servers) => set({ mcpServers: servers }),

  selectMcp: (id) => set({ selectedMcpId: id }),

  loadMcps: async () => {
    const { mcpSourceDir } = useSettingsStore.getState();
    set({ isLoading: true, error: null });
    try {
      const mcpServers = await invoke<McpServer[]>('scan_mcps', {
        sourceDir: mcpSourceDir,
      });
      set({ mcpServers, isLoading: false });
    } catch (error) {
      set({ error: String(error), isLoading: false });
    }
  },

  toggleMcp: async (id) => {
    const mcp = get().mcpServers.find((m) => m.id === id);
    if (!mcp) return;

    // Optimistic update
    set((state) => ({
      mcpServers: state.mcpServers.map((m) =>
        m.id === id ? { ...m, enabled: !m.enabled } : m
      ),
    }));

    try {
      await invoke('update_mcp_metadata', {
        mcpId: id,
        enabled: !mcp.enabled,
      });
    } catch (error) {
      // Rollback on error
      set((state) => ({
        mcpServers: state.mcpServers.map((m) =>
          m.id === id ? { ...m, enabled: mcp.enabled } : m
        ),
        error: String(error),
      }));
    }
  },

  updateMcpCategory: async (id, category) => {
    try {
      await invoke('update_mcp_metadata', {
        mcpId: id,
        category,
      });
      set((state) => ({
        mcpServers: state.mcpServers.map((m) =>
          m.id === id ? { ...m, category } : m
        ),
      }));
    } catch (error) {
      set({ error: String(error) });
    }
  },

  updateMcpTags: async (id, tags) => {
    try {
      await invoke('update_mcp_metadata', {
        mcpId: id,
        tags,
      });
      set((state) => ({
        mcpServers: state.mcpServers.map((m) =>
          m.id === id ? { ...m, tags } : m
        ),
      }));
    } catch (error) {
      set({ error: String(error) });
    }
  },

  setFilter: (filter) =>
    set((state) => ({
      filter: { ...state.filter, ...filter },
    })),

  getFilteredMcps: () => {
    const state = get();
    let filtered = [...state.mcpServers];

    // Filter by search
    if (state.filter.search) {
      const searchLower = state.filter.search.toLowerCase();
      filtered = filtered.filter(
        (mcp) =>
          mcp.name.toLowerCase().includes(searchLower) ||
          mcp.description.toLowerCase().includes(searchLower)
      );
    }

    // Filter by category
    if (state.filter.category) {
      filtered = filtered.filter((mcp) => mcp.category === state.filter.category);
    }

    // Filter by tags
    if (state.filter.tags.length > 0) {
      filtered = filtered.filter((mcp) =>
        state.filter.tags.some((tag) => mcp.tags.includes(tag))
      );
    }

    return filtered;
  },

  getEnabledCount: () => {
    return get().mcpServers.filter((mcp) => mcp.enabled).length;
  },

  getSelectedMcp: () => {
    const state = get();
    return state.mcpServers.find((mcp) => mcp.id === state.selectedMcpId);
  },
}));
