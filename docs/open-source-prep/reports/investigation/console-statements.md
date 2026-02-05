# Console 语句调查报告

## 统计摘要
- console.log: 18 处
- console.warn: 56 处
- console.error: 46 处
- **总计: 120 处**

## 分类统计
| 分类 | 数量 | 说明 |
|------|------|------|
| debug | 18 | 调试用途，可以移除 |
| error-handling | 46 | 错误处理，应保留 |
| business | 56 | 浏览器模式兼容性警告，应保留 |
| unknown | 0 | 无 |

---

## 详细列表

---

### console.log 语句 (18处)

---

#### 1. [src/pages/ScenesPage.tsx:216]
**类型**: console.log
**分类**: debug
**代码上下文**:
```typescript
  }) => {
    console.log('handleCreateScene called with:', sceneData);

    try {
      // Directly call Tauri backend with snake_case parameters
      console.log('Calling safeInvoke add_scene...');
```
**分析**: 函数入口调试日志，打印传入参数，用于开发调试，可以移除。

---

#### 2. [src/pages/ScenesPage.tsx:220]
**类型**: console.log
**分类**: debug
**代码上下文**:
```typescript
    console.log('handleCreateScene called with:', sceneData);

    try {
      // Directly call Tauri backend with snake_case parameters
      console.log('Calling safeInvoke add_scene...');
      const newScene = await safeInvoke<Scene>('add_scene', {
```
**分析**: API 调用前的调试日志，可以移除。

---

#### 3. [src/pages/ScenesPage.tsx:228]
**类型**: console.log
**分类**: debug
**代码上下文**:
```typescript
        mcpIds: sceneData.mcpIds,
      });
      console.log('safeInvoke result:', newScene);

      if (newScene) {
        // Update local state with the new scene from backend
```
**分析**: API 调用结果的调试日志，可以移除。

---

#### 4. [src/pages/ProjectsPage.tsx:246]
**类型**: console.log
**分类**: debug
**代码上下文**:
```typescript
  ) : selectedProject ? (
    <ProjectConfigPanel
      project={selectedProject}
      scene={selectedScene}
      scenes={scenes}
      onOpenFolder={() => console.log('Open folder:', selectedProject.path)}
      onChangeScene={(sceneId) => handleSceneChange(selectedProject.id, sceneId)}
```
**分析**: 作为占位符的回调函数，表示"打开文件夹"功能未实现，可能是未完成的功能或调试代码，可以移除或替换为实际功能。

---

#### 5. [src/stores/claudeMdStore.ts:142]
**类型**: console.log
**分类**: debug
**代码上下文**:
```typescript
      return;
    }

    console.log('[ClaudeMdStore] loadFiles called');
    set({ isLoading: true, error: null });

    try {
```
**分析**: 函数调用追踪日志，带有模块前缀 `[ClaudeMdStore]`，用于开发调试，可以移除。

---

#### 6. [src/stores/claudeMdStore.ts:147]
**类型**: console.log
**分类**: debug
**代码上下文**:
```typescript
    try {
      const files = await safeInvoke<ClaudeMdFile[]>('get_claude_md_files');
      console.log('[ClaudeMdStore] get_claude_md_files result:', files);
      const globalFile = files?.find(f => f.isGlobal);

      set({
```
**分析**: API 返回结果的调试日志，可以移除。

---

#### 7. [src/stores/claudeMdStore.ts:155]
**类型**: console.log
**分类**: debug
**代码上下文**:
```typescript
        globalFileId: globalFile?.id || null,
        isLoading: false,
      });
      console.log('[ClaudeMdStore] Files loaded, count:', files?.length || 0);
    } catch (error) {
      const message = typeof error === 'string' ? error : String(error);
```
**分析**: 加载完成后的调试日志，可以移除。

---

#### 8. [src/stores/claudeMdStore.ts:205]
**类型**: console.log
**分类**: debug
**代码上下文**:
```typescript
      return null;
    }

    console.log('[ClaudeMdStore] importFile called with:', options);
    set({ isImporting: true, error: null });

    try {
```
**分析**: 函数调用参数的调试日志，可以移除。

---

#### 9. [src/stores/claudeMdStore.ts:212]
**类型**: console.log
**分类**: debug
**代码上下文**:
```typescript
      const result = await safeInvoke<ClaudeMdImportResult>('import_claude_md', {
        options: options,
      });
      console.log('[ClaudeMdStore] import_claude_md result:', result);

      if (result?.success && result.file) {
```
**分析**: API 返回结果的调试日志，可以移除。

---

#### 10. [src/stores/claudeMdStore.ts:215]
**类型**: console.log
**分类**: debug
**代码上下文**:
```typescript
      console.log('[ClaudeMdStore] import_claude_md result:', result);

      if (result?.success && result.file) {
        console.log('[ClaudeMdStore] Import success, adding file:', result.file);
        set((state) => {
          const newFiles = [...state.files, result.file!];
```
**分析**: 成功分支的调试日志，可以移除。

---

#### 11. [src/stores/claudeMdStore.ts:218]
**类型**: console.log
**分类**: debug
**代码上下文**:
```typescript
        console.log('[ClaudeMdStore] Import success, adding file:', result.file);
        set((state) => {
          const newFiles = [...state.files, result.file!];
          console.log('[ClaudeMdStore] New files array length:', newFiles.length);
          return {
            files: newFiles,
```
**分析**: 状态更新的调试日志，可以移除。

---

#### 12. [src/stores/claudeMdStore.ts:225]
**类型**: console.log
**分类**: debug
**代码上下文**:
```typescript
          };
        });
      } else {
        console.log('[ClaudeMdStore] Import failed:', result?.error);
        set({
          error: result?.error || 'Import failed',
```
**分析**: 失败分支的调试日志，可以移除。

---

#### 13. [src/components/layout/MainLayout.tsx:259]
**类型**: console.log
**分类**: debug
**代码上下文**:
```typescript
          }
        }
      } catch (e) {
        console.log('No launch args or error checking:', e);
      }
    };

    checkLaunchArgs();
```
**分析**: 在 catch 块中打印启动参数检查错误，但使用的是 console.log 而非 console.error。这是一个边缘情况处理，没有启动参数时会进入此分支，属于正常流程，可以移除或改为 console.debug。

---

#### 14. [src/components/modals/ScanClaudeMdModal.tsx:127]
**类型**: console.log
**分类**: debug
**代码上下文**:
```typescript
    const itemsToImport = unimportedItems.filter((item) =>
      selectedPaths.has(item.path)
    );

    console.log('[ScanModal] Starting import, items:', itemsToImport.length);
    setImportingCount(0);

    for (const item of itemsToImport) {
```
**分析**: 批量导入开始的调试日志，可以移除。

---

#### 15. [src/components/modals/ScanClaudeMdModal.tsx:131]
**类型**: console.log
**分类**: debug
**代码上下文**:
```typescript
    console.log('[ScanModal] Starting import, items:', itemsToImport.length);
    setImportingCount(0);

    for (const item of itemsToImport) {
      console.log('[ScanModal] Importing:', item.path);
      const result = await importFile({
        sourcePath: item.path,
```
**分析**: 循环内每个项目的导入日志，可以移除。

---

#### 16. [src/components/modals/ScanClaudeMdModal.tsx:136]
**类型**: console.log
**分类**: debug
**代码上下文**:
```typescript
      const result = await importFile({
        sourcePath: item.path,
        name: item.projectName || undefined,
      });
      console.log('[ScanModal] Import result:', result);
      setImportingCount((prev) => prev + 1);
    }
```
**分析**: 每个导入结果的调试日志，可以移除。

---

#### 17. [src/components/modals/ScanClaudeMdModal.tsx:144]
**类型**: console.log
**分类**: debug
**代码上下文**:
```typescript
    setSelectedPaths(new Set());

    // Reload files from backend to ensure UI is in sync
    // Wait for loadFiles to complete before closing the modal
    console.log('[ScanModal] Calling loadFiles...');
    await loadFiles();
    console.log('[ScanModal] loadFiles completed');
```
**分析**: 重新加载文件前后的调试日志，可以移除。

---

#### 18. [src/components/modals/ScanClaudeMdModal.tsx:146]
**类型**: console.log
**分类**: debug
**代码上下文**:
```typescript
    // Wait for loadFiles to complete before closing the modal
    console.log('[ScanModal] Calling loadFiles...');
    await loadFiles();
    console.log('[ScanModal] loadFiles completed');

    onImportComplete?.();
    onClose();
```
**分析**: 重新加载完成的调试日志，可以移除。

---

### console.warn 语句 (56处)

---

#### 19. [src/pages/ScenesPage.tsx:235]
**类型**: console.warn
**分类**: error-handling
**代码上下文**:
```typescript
      if (newScene) {
        // Update local state with the new scene from backend
        useScenesStore.getState().setScenes([...scenes, newScene]);
        setSelectedSceneId(newScene.id);
      } else {
        console.warn('newScene is null or undefined');
      }
    } catch (error) {
```
**分析**: API 返回空值的警告，属于错误处理的一部分，帮助识别后端返回异常，应保留。

---

#### 20. [src/utils/tauri.ts:28]
**类型**: console.warn
**分类**: business
**代码上下文**:
```typescript
export const safeInvoke = async <T>(
  command: string,
  args?: Record<string, unknown>
): Promise<T | null> => {
  if (!isTauri()) {
    console.warn(`Tauri not available. Cannot invoke: ${command}`);
    return null;
  }

  const { invoke } = await import('@tauri-apps/api/core');
```
**分析**: 核心工具函数，在非 Tauri 环境中调用时的警告。这是浏览器模式兼容性的重要提示，应保留。

---

#### 21-74. [各 Store 文件中的浏览器模式警告]

以下 54 个 console.warn 语句都遵循相同的模式：在非 Tauri 环境（浏览器模式）中检测到后输出警告。这些都是**业务逻辑日志**，用于开发时的浏览器预览模式，应**保留**。

| 文件 | 行号 | 消息 |
|------|------|------|
| src/stores/importStore.ts | 90 | 'ImportStore: Cannot detect config in browser mode' |
| src/stores/importStore.ts | 255 | 'ImportStore: Cannot detect skills in browser mode' |
| src/stores/importStore.ts | 279 | 'ImportStore: Cannot detect MCPs in browser mode' |
| src/stores/importStore.ts | 329 | 'ImportStore: Cannot import skills in browser mode' |
| src/stores/importStore.ts | 388 | 'ImportStore: Cannot import MCPs in browser mode' |
| src/stores/trashStore.ts | 37 | 'TrashStore: Cannot load trashed items in browser mode' |
| src/stores/trashStore.ts | 62 | 'TrashStore: Cannot restore skill in browser mode' |
| src/stores/trashStore.ts | 90 | 'TrashStore: Cannot restore MCP in browser mode' |
| src/stores/trashStore.ts | 118 | 'TrashStore: Cannot restore CLAUDE.md in browser mode' |
| src/stores/skillsStore.ts | 94 | 'SkillsStore: Cannot load skills in browser mode' |
| src/stores/skillsStore.ts | 119 | 'SkillsStore: Cannot delete skill in browser mode' |
| src/stores/skillsStore.ts | 161 | 'SkillsStore: Cannot update skill category in browser mode' |
| src/stores/skillsStore.ts | 197 | 'SkillsStore: Cannot update skill tags in browser mode' |
| src/stores/skillsStore.ts | 233 | 'SkillsStore: Cannot update skill icon in browser mode' |
| src/stores/skillsStore.ts | 268 | 'SkillsStore: Cannot update skill scope in browser mode' |
| src/stores/skillsStore.ts | 317 | 'SkillsStore: Cannot auto-classify in browser mode' |
| src/stores/skillsStore.ts | 427 | 'SkillsStore: Cannot load usage stats in browser mode' |
| src/stores/pluginsStore.ts | 117 | 'PluginsStore: Cannot load installed plugins in browser mode' |
| src/stores/pluginsStore.ts | 150 | 'PluginsStore: Cannot detect plugin skills in browser mode' |
| src/stores/pluginsStore.ts | 182 | 'PluginsStore: Cannot detect plugin MCPs in browser mode' |
| src/stores/pluginsStore.ts | 214 | 'PluginsStore: Cannot import plugin skills in browser mode' |
| src/stores/pluginsStore.ts | 255 | 'PluginsStore: Cannot import plugin MCPs in browser mode' |
| src/stores/pluginsStore.ts | 296 | 'PluginsStore: Cannot refresh plugin enabled status in browser mode' |
| src/stores/pluginsStore.ts | 327 | 'PluginsStore: Cannot load imported plugin IDs in browser mode' |
| src/stores/scenesStore.ts | 113 | 'ScenesStore: Cannot load scenes in browser mode' |
| src/stores/scenesStore.ts | 130 | 'ScenesStore: Cannot create scene in browser mode' |
| src/stores/scenesStore.ts | 176 | 'ScenesStore: Cannot delete scene in browser mode' |
| src/stores/scenesStore.ts | 196 | 'ScenesStore: Cannot update scene in browser mode' |
| src/stores/projectsStore.ts | 124 | 'ProjectsStore: Cannot load projects in browser mode' |
| src/stores/projectsStore.ts | 141 | 'ProjectsStore: Cannot create project in browser mode' |
| src/stores/projectsStore.ts | 178 | 'ProjectsStore: Cannot update project in browser mode' |
| src/stores/projectsStore.ts | 198 | 'ProjectsStore: Cannot sync project in browser mode' |
| src/stores/projectsStore.ts | 266 | 'ProjectsStore: Cannot clear project config in browser mode' |
| src/stores/projectsStore.ts | 293 | 'ProjectsStore: Cannot select folder in browser mode' |
| src/stores/projectsStore.ts | 312 | 'ProjectsStore: Cannot delete project in browser mode' |
| src/stores/mcpsStore.ts | 80 | 'McpsStore: Cannot load MCPs in browser mode' |
| src/stores/mcpsStore.ts | 100 | 'McpsStore: Cannot delete MCP in browser mode' |
| src/stores/mcpsStore.ts | 142 | 'McpsStore: Cannot update MCP category in browser mode' |
| src/stores/mcpsStore.ts | 164 | 'McpsStore: Cannot update MCP tags in browser mode' |
| src/stores/mcpsStore.ts | 186 | 'McpsStore: Cannot update MCP icon in browser mode' |
| src/stores/mcpsStore.ts | 213 | 'McpsStore: Cannot update MCP scope in browser mode' |
| src/stores/mcpsStore.ts | 253 | 'McpsStore: Cannot fetch MCP tools in browser mode' |
| src/stores/mcpsStore.ts | 314 | 'McpsStore: Cannot load usage stats in browser mode' |
| src/stores/mcpsStore.ts | 340 | 'McpsStore: Cannot auto-classify in browser mode' |
| src/stores/settingsStore.ts | 157 | 'Settings: Running in browser mode, using default settings' |
| src/stores/settingsStore.ts | 192 | 'Settings: Cannot save in browser mode' |
| src/stores/settingsStore.ts | 222 | 'Settings: Directory selection not available in browser mode' |
| src/stores/claudeMdStore.ts | 137 | 'ClaudeMdStore: Cannot load files in browser mode' |
| src/stores/claudeMdStore.ts | 175 | 'ClaudeMdStore: Cannot scan files in browser mode' |
| src/stores/claudeMdStore.ts | 201 | 'ClaudeMdStore: Cannot import file in browser mode' |
| src/stores/claudeMdStore.ts | 246 | 'ClaudeMdStore: Cannot update file in browser mode' |
| src/stores/claudeMdStore.ts | 287 | 'ClaudeMdStore: Cannot delete file in browser mode' |
| src/stores/claudeMdStore.ts | 324 | 'ClaudeMdStore: Cannot set global in browser mode' |
| src/stores/claudeMdStore.ts | 358 | 'ClaudeMdStore: Cannot unset global in browser mode' |
| src/stores/claudeMdStore.ts | 390 | 'ClaudeMdStore: Cannot distribute in browser mode' |
| src/stores/claudeMdStore.ts | 420 | 'ClaudeMdStore: Cannot auto-classify in browser mode' |
| src/stores/appStore.ts | 108 | 'AppStore: Cannot load categories in browser mode' |
| src/stores/appStore.ts | 127 | 'AppStore: Cannot load tags in browser mode' |
| src/stores/appStore.ts | 146 | 'AppStore: Cannot add category in browser mode' |
| src/stores/appStore.ts | 168 | 'AppStore: Cannot update category in browser mode' |
| src/stores/appStore.ts | 192 | 'AppStore: Cannot delete category in browser mode' |
| src/stores/appStore.ts | 213 | 'AppStore: Cannot add tag in browser mode' |
| src/stores/appStore.ts | 235 | 'AppStore: Cannot delete tag in browser mode' |
| src/stores/appStore.ts | 256 | 'AppStore: Cannot update tag in browser mode' |
| src/stores/appStore.ts | 278 | 'AppStore: Cannot initialize app in browser mode' |

---

#### 75. [src/components/modals/ImportClaudeMdModal.tsx:100]
**类型**: console.warn
**分类**: business
**代码上下文**:
```typescript
  const handleBrowseFile = useCallback(async () => {
    if (!isTauri()) {
      console.warn('File selection requires Tauri environment');
      return;
    }
```
**分析**: 浏览器模式兼容性警告，应保留。

---

#### 76. [src/components/layout/MainLayout.tsx:189]
**类型**: console.warn
**分类**: business
**代码上下文**:
```typescript
        // In browser mode, skip data loading but allow UI preview
        if (!isTauri()) {
          console.warn('Running in browser mode - Tauri API not available. Using empty data for UI preview.');
          setIsInitializing(false);
          return;
        }
```
**分析**: 应用初始化时的浏览器模式提示，帮助开发者理解 UI 预览模式下的限制，应保留。

---

### console.error 语句 (46处)

以下所有 console.error 语句都在 catch 块中或错误处理流程中，用于记录操作失败的错误信息。这些都是**错误处理日志**，应**保留**。

---

#### 77. [src/pages/McpServersPage.tsx:306]
**类型**: console.error
**分类**: error-handling
**代码上下文**:
```typescript
      if (!existingTag) {
        try {
          await addGlobalTag(trimmedName);
        } catch (error) {
          console.error('Failed to add tag to global store:', error);
        }
      }
```
**分析**: 添加标签失败的错误处理，应保留。

---

#### 78. [src/pages/SkillsPage.tsx:357]
**类型**: console.error
**分类**: error-handling
**代码上下文**:
```typescript
      if (!existingTag) {
        try {
          await addGlobalTag(trimmedName);
        } catch (error) {
          console.error('Failed to add tag to global store:', error);
        }
      }
```
**分析**: 添加标签失败的错误处理，应保留。

---

#### 79. [src/pages/ScenesPage.tsx:238]
**类型**: console.error
**分类**: error-handling
**代码上下文**:
```typescript
      } else {
        console.warn('newScene is null or undefined');
      }
    } catch (error) {
      console.error('Failed to create scene:', error);
    }
```
**分析**: 创建场景失败的错误处理，应保留。

---

#### 80. [src/pages/ScenesPage.tsx:281]
**类型**: console.error
**分类**: error-handling
**代码上下文**:
```typescript
            : scene
        )
      );
    } catch (error) {
      console.error('Failed to update scene:', error);
    }
```
**分析**: 更新场景失败的错误处理，应保留。

---

#### 81. [src/pages/ScenesPage.tsx:323]
**类型**: console.error
**分类**: error-handling
**代码上下文**:
```typescript
      if (selectedSceneId === id) {
        setSelectedSceneId(null);
      }
    } catch (error) {
      console.error('Failed to delete scene:', error);
      window.alert('Failed to delete scene. Please try again.');
    }
```
**分析**: 删除场景失败的错误处理，应保留。

---

#### 82. [src/pages/SettingsPage.tsx:253]
**类型**: console.error
**分类**: error-handling
**代码上下文**:
```typescript
    } catch (error) {
      setQuickActionStatus('error');
      setQuickActionMessage(typeof error === 'string' ? error : String(error));
      console.error('Failed to install Quick Action:', error);
    }
```
**分析**: Quick Action 安装失败的错误处理，应保留。

---

#### 83. [src/pages/ProjectsPage.tsx:90]
**类型**: console.error
**分类**: error-handling
**代码上下文**:
```typescript
      // 3. Sync new configuration
      await syncProject(projectId);
    } catch (error) {
      console.error('Failed to change scene:', error);
    }
```
**分析**: 更改场景失败的错误处理，应保留。

---

#### 84. [src/components/skills/SkillDetailPanel.tsx:314]
**类型**: console.error
**分类**: error-handling
**代码上下文**:
```typescript
      if (!existingTag) {
        try {
          await addGlobalTag(trimmedName);
        } catch (error) {
          console.error('Failed to add tag to global store:', error);
        }
      }
```
**分析**: 添加标签失败的错误处理，应保留。

---

#### 85. [src/components/claude-md/ClaudeMdDetailPanel.tsx:204]
**类型**: console.error
**分类**: error-handling
**代码上下文**:
```typescript
      if (!existingTag) {
        try {
          existingTag = await addGlobalTag(trimmedName);
        } catch (error) {
          console.error('Failed to add tag to global store:', error);
          return;
        }
      }
```
**分析**: 添加标签失败的错误处理，应保留。

---

#### 86. [src/components/common/ErrorBoundary.tsx:22]
**类型**: console.error
**分类**: error-handling
**代码上下文**:
```typescript
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }
```
**分析**: React ErrorBoundary 的标准实现，捕获组件错误，应保留。

---

#### 87. [src/components/mcps/McpDetailPanel.tsx:252]
**类型**: console.error
**分类**: error-handling
**代码上下文**:
```typescript
      if (!existingTag) {
        try {
          await addGlobalTag(trimmedName);
        } catch (error) {
          console.error('Failed to add tag to global store:', error);
        }
      }
```
**分析**: 添加标签失败的错误处理，应保留。

---

#### 88. [src/components/modals/ImportClaudeMdModal.tsx:78]
**类型**: console.error
**分类**: error-handling
**代码上下文**:
```typescript
        }
      );
    } catch (error) {
      console.error('Failed to setup drag-drop listener:', error);
    }
```
**分析**: 拖放监听器设置失败的错误处理，应保留。

---

#### 89. [src/components/modals/ImportClaudeMdModal.tsx:120]
**类型**: console.error
**分类**: error-handling
**代码上下文**:
```typescript
        }
      }
    } catch (error) {
      console.error('Failed to select file:', error);
    }
```
**分析**: 文件选择失败的错误处理，应保留。

---

#### 90-120. [各 Store 文件中的错误处理日志]

以下所有 console.error 语句都在 catch 块中，用于记录各种操作失败的错误信息。全部应**保留**。

| 文件 | 行号 | 消息 |
|------|------|------|
| src/stores/appStore.ts | 118 | 'Failed to load categories:' |
| src/stores/appStore.ts | 137 | 'Failed to load tags:' |
| src/stores/appStore.ts | 158 | 'Failed to add category:' |
| src/stores/appStore.ts | 182 | 'Failed to update category:' |
| src/stores/appStore.ts | 203 | 'Failed to delete category:' |
| src/stores/appStore.ts | 225 | 'Failed to add tag:' |
| src/stores/appStore.ts | 246 | 'Failed to delete tag:' |
| src/stores/appStore.ts | 268 | 'Failed to update tag:' |
| src/stores/appStore.ts | 292 | 'Failed to initialize app:' |
| src/stores/skillsStore.ts | 446 | 'Failed to load usage stats:' |
| src/stores/claudeMdStore.ts | 158 | '[ClaudeMdStore] loadFiles error:' |
| src/stores/claudeMdStore.ts | 235 | '[ClaudeMdStore] Import error:' |
| src/stores/settingsStore.ts | 184 | 'Failed to load settings:' |
| src/stores/settingsStore.ts | 214 | 'Failed to save settings:' |
| src/stores/settingsStore.ts | 241 | 'Failed to select directory:' |
| src/stores/mcpsStore.ts | 305 | 'Failed to fetch MCP tools:' |
| src/stores/mcpsStore.ts | 333 | 'Failed to load MCP usage stats:' |
| src/components/layout/MainLayout.tsx | 137 | '[handleLaunchPath] Error:' |
| src/components/layout/MainLayout.tsx | 176 | 'Failed to focus window:' |
| src/components/layout/MainLayout.tsx | 211 | 'Failed to initialize app:' |
| src/components/layout/MainLayout.tsx | 358 | 'Failed to save category:' |
| src/components/layout/MainLayout.tsx | 372 | 'Failed to update category color:' |
| src/components/layout/MainLayout.tsx | 388 | 'Failed to delete category:' |
| src/components/layout/MainLayout.tsx | 419 | 'Failed to delete tag:' |
| src/components/layout/MainLayout.tsx | 437 | 'Failed to save tag:' |
| src/components/layout/MainLayout.tsx | 460 | 'Failed to refresh data:' |
| src/stores/pluginsStore.ts | 90 | 'Failed to persist imported plugin IDs:' |
| src/stores/pluginsStore.ts | 140 | 'Failed to load installed plugins:' |
| src/stores/pluginsStore.ts | 172 | 'Failed to detect plugin skills:' |
| src/stores/pluginsStore.ts | 204 | 'Failed to detect plugin MCPs:' |
| src/stores/pluginsStore.ts | 244 | 'Failed to import plugin skills:' |
| src/stores/pluginsStore.ts | 285 | 'Failed to import plugin MCPs:' |
| src/stores/pluginsStore.ts | 317 | 'Failed to refresh plugin enabled status:' |
| src/stores/pluginsStore.ts | 342 | 'Failed to load imported plugin IDs:' |

---

## 建议处理方案

### 可安全移除的语句 (18 处)

以下 18 个 console.log 语句都是纯调试用途，可以安全移除：

| 序号 | 文件 | 行号 | 类型 |
|------|------|------|------|
| 1 | src/pages/ScenesPage.tsx | 216 | console.log |
| 2 | src/pages/ScenesPage.tsx | 220 | console.log |
| 3 | src/pages/ScenesPage.tsx | 228 | console.log |
| 4 | src/pages/ProjectsPage.tsx | 246 | console.log |
| 5 | src/stores/claudeMdStore.ts | 142 | console.log |
| 6 | src/stores/claudeMdStore.ts | 147 | console.log |
| 7 | src/stores/claudeMdStore.ts | 155 | console.log |
| 8 | src/stores/claudeMdStore.ts | 205 | console.log |
| 9 | src/stores/claudeMdStore.ts | 212 | console.log |
| 10 | src/stores/claudeMdStore.ts | 215 | console.log |
| 11 | src/stores/claudeMdStore.ts | 218 | console.log |
| 12 | src/stores/claudeMdStore.ts | 225 | console.log |
| 13 | src/components/layout/MainLayout.tsx | 259 | console.log |
| 14 | src/components/modals/ScanClaudeMdModal.tsx | 127 | console.log |
| 15 | src/components/modals/ScanClaudeMdModal.tsx | 131 | console.log |
| 16 | src/components/modals/ScanClaudeMdModal.tsx | 136 | console.log |
| 17 | src/components/modals/ScanClaudeMdModal.tsx | 144 | console.log |
| 18 | src/components/modals/ScanClaudeMdModal.tsx | 146 | console.log |

### 应保留的语句 (102 处)

- **console.warn (56 处)**: 全部是浏览器模式兼容性警告或重要的业务逻辑警告
- **console.error (46 处)**: 全部是错误处理日志，在 catch 块中记录操作失败信息

### 特别说明

1. **ProjectsPage.tsx:246** 的 `console.log('Open folder:', ...)` 可能是未完成功能的占位符，建议检查该功能是否需要实现。

2. 所有浏览器模式的 console.warn 都是有意设计的，用于支持开发时的 UI 预览，不应移除。

3. 所有 console.error 都在错误处理流程中，是良好的错误记录实践，应保留。

---

## 调查完成时间
2026-02-05
