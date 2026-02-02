import { create } from 'zustand';
import type { ExistingConfig, ImportItem, ImportResult, BackupInfo } from '../types';
import { useSettingsStore } from './settingsStore';
import { useSkillsStore } from './skillsStore';
import { useMcpsStore } from './mcpsStore';
import { isTauri, safeInvoke } from '@/utils/tauri';

// ============================================================================
// Import Store
// ============================================================================
// Manages import state for detecting and importing existing Claude configurations
// from ~/.claude/ directory. Supports Skills and MCP servers detection,
// backup before import, and selective import functionality.

interface ImportState {
  // 状态
  isDetecting: boolean;
  detectedConfig: ExistingConfig | null;
  isImporting: boolean;
  importResult: ImportResult | null;
  backupInfo: BackupInfo | null;
  showImportDialog: boolean;
  selectedItems: ImportItem[];
  error: string | null;

  // Actions
  detectExistingConfig: () => Promise<void>;
  backupBeforeImport: () => Promise<BackupInfo | null>;
  importConfig: () => Promise<void>;
  openImportDialog: () => void;
  closeImportDialog: () => void;
  toggleItemSelection: (item: ImportItem) => void;
  selectAllItems: () => void;
  deselectAllItems: () => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  isDetecting: false,
  detectedConfig: null,
  isImporting: false,
  importResult: null,
  backupInfo: null,
  showImportDialog: false,
  selectedItems: [] as ImportItem[],
  error: null,
};

export const useImportStore = create<ImportState>((set, get) => ({
  ...initialState,

  detectExistingConfig: async () => {
    if (!isTauri()) {
      console.warn('ImportStore: Cannot detect config in browser mode');
      return;
    }

    const { claudeConfigDir } = useSettingsStore.getState();
    set({ isDetecting: true, error: null });

    try {
      const config = await safeInvoke<ExistingConfig>('detect_existing_config', {
        claudeConfigDir,
      });

      if (config && config.hasConfig) {
        // 自动选择所有检测到的项目
        const items: ImportItem[] = [
          ...config.skills.map((s) => ({
            type: 'skill' as const,
            name: s.name,
            sourcePath: s.path,
          })),
          ...config.mcps.map((m) => ({
            type: 'mcp' as const,
            name: m.name,
            sourcePath: '', // MCP 从 settings.json 提取
          })),
        ];
        set({
          detectedConfig: config,
          selectedItems: items,
          isDetecting: false,
          showImportDialog: true,
        });
      } else {
        set({ detectedConfig: config, isDetecting: false });
      }
    } catch (error) {
      const message = typeof error === 'string' ? error : String(error);
      set({ error: message, isDetecting: false });
    }
  },

  backupBeforeImport: async () => {
    if (!isTauri()) return null;

    const { claudeConfigDir, skillSourceDir } = useSettingsStore.getState();
    const ensembleDir = skillSourceDir.replace('/skills', '');

    try {
      const backupInfo = await safeInvoke<BackupInfo>('backup_before_import', {
        ensembleDir,
        claudeConfigDir,
      });
      set({ backupInfo });
      return backupInfo;
    } catch (error) {
      const message = typeof error === 'string' ? error : String(error);
      set({ error: message });
      return null;
    }
  },

  importConfig: async () => {
    if (!isTauri()) return;

    const { selectedItems } = get();
    if (selectedItems.length === 0) {
      set({ error: 'No items selected for import' });
      return;
    }

    const { claudeConfigDir, skillSourceDir } = useSettingsStore.getState();
    const ensembleDir = skillSourceDir.replace('/skills', '');

    set({ isImporting: true, error: null });

    try {
      // 先备份
      const backupInfo = await get().backupBeforeImport();
      if (!backupInfo) {
        set({ isImporting: false, error: 'Backup failed' });
        return;
      }

      // 执行导入
      const result = await safeInvoke<ImportResult>('import_existing_config', {
        claudeConfigDir,
        ensembleDir,
        items: selectedItems,
      });

      if (result) {
        result.backupPath = backupInfo.path;
        set({ importResult: result, isImporting: false });

        // 标记导入已完成并重新加载数据
        if (result.success || result.imported.skills > 0 || result.imported.mcps > 0) {
          useSettingsStore.getState().setHasCompletedImport(true);

          // 重新加载 Skills 和 MCPs 数据以显示导入的内容
          await useSkillsStore.getState().loadSkills();
          await useMcpsStore.getState().loadMcps();
        }
      } else {
        set({ isImporting: false, error: 'Import failed' });
      }
    } catch (error) {
      const message = typeof error === 'string' ? error : String(error);
      set({ error: message, isImporting: false });
    }
  },

  openImportDialog: () => set({ showImportDialog: true }),

  closeImportDialog: () => set({ showImportDialog: false }),

  toggleItemSelection: (item) => {
    const { selectedItems } = get();
    const exists = selectedItems.find(
      (i) => i.type === item.type && i.name === item.name
    );

    if (exists) {
      set({
        selectedItems: selectedItems.filter(
          (i) => !(i.type === item.type && i.name === item.name)
        ),
      });
    } else {
      set({ selectedItems: [...selectedItems, item] });
    }
  },

  selectAllItems: () => {
    const { detectedConfig } = get();
    if (!detectedConfig) return;

    const items: ImportItem[] = [
      ...detectedConfig.skills.map((s) => ({
        type: 'skill' as const,
        name: s.name,
        sourcePath: s.path,
      })),
      ...detectedConfig.mcps.map((m) => ({
        type: 'mcp' as const,
        name: m.name,
        sourcePath: '',
      })),
    ];
    set({ selectedItems: items });
  },

  deselectAllItems: () => set({ selectedItems: [] }),

  clearError: () => set({ error: null }),

  reset: () => set(initialState),
}));
