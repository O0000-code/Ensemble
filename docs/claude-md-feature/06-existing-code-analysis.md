# Ensemble 现有代码分析报告

> 创建时间: 2026-02-04
> 创建者: SubAgent B3 (代码分析者)

---

## 一、Store 文件分析

### 1.1 pluginsStore.ts

**文件路径**: `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/stores/pluginsStore.ts`

**已实现功能**:
- [x] 加载已安装插件列表 (`loadInstalledPlugins`)
- [x] 检测可导入的插件 Skills (`detectPluginSkillsForImport`)
- [x] 检测可导入的插件 MCPs (`detectPluginMcpsForImport`)
- [x] 导入插件 Skills (`importPluginSkills`)
- [x] 导入插件 MCPs (`importPluginMcps`)
- [x] 刷新插件启用状态 (`refreshPluginEnabledStatus`)
- [x] 加载已导入的插件 ID (`loadImportedPluginIds`)
- [x] 持久化已导入的插件 ID (`persistImportedPluginIds`)
- [x] 获取未导入的插件 Skills/MCPs (`getUnimportedPluginSkills`/`getUnimportedPluginMcps`)

**关键代码片段**:

```typescript
// 状态接口定义
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

  // ...actions
}
```

```typescript
// 持久化已导入的插件 ID 到 AppData
const persistImportedPluginIds = async (
  importedPluginSkills: string[],
  importedPluginMcps: string[]
) => {
  if (!isTauri()) return;
  try {
    const appData = await safeInvoke<AppData>('read_app_data');
    if (appData) {
      appData.importedPluginSkills = importedPluginSkills;
      appData.importedPluginMcps = importedPluginMcps;
      await safeInvoke('write_app_data', { data: appData });
    }
  } catch (error) {
    console.error('Failed to persist imported plugin IDs:', error);
  }
};
```

**与导入相关的逻辑**:

1. **检测逻辑**: 调用 Rust 后端 `detect_plugin_skills` 和 `detect_plugin_mcps` 命令，传入已导入的 ID 列表，后端返回带有 `isImported` 标记的检测结果。

2. **导入逻辑**:
   - 调用 `import_plugin_skills` / `import_plugin_mcps` 将插件资源复制到 `~/.ensemble/skills/` 或 `~/.ensemble/mcps/`
   - 导入后更新 `importedPluginSkills` / `importedPluginMcps` 列表
   - 自动持久化到 `data.json`
   - 重新加载 Skills/MCPs 列表以显示新导入的项

3. **过滤逻辑**: `getUnimportedPluginSkills()` 和 `getUnimportedPluginMcps()` 返回 `isImported: false` 的项，用于导入弹框显示。

---

### 1.2 importStore.ts

**文件路径**: `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/stores/importStore.ts`

**已实现功能**:
- [x] 检测现有配置 (`detectExistingConfig`) - 从 `~/.claude/` 检测 Skills 和 MCPs
- [x] 导入前备份 (`backupBeforeImport`)
- [x] 完整导入配置 (`importConfig`)
- [x] 独立检测 Skills (`detectSkillsOnly`)
- [x] 独立检测 MCPs (`detectMcpsOnly`)
- [x] 独立导入 Skills (`importSkills`) - 导入后删除源配置
- [x] 独立导入 MCPs (`importMcps`) - 导入后从 `~/.claude.json` 删除

**关键代码片段**:

```typescript
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

  // 独立弹窗状态
  isSkillsModalOpen: boolean;
  isMcpsModalOpen: boolean;

  // 独立检测结果
  detectedSkills: DetectedSkill[];
  detectedMcps: DetectedMcp[];

  // ...
}
```

```typescript
// 独立导入 Skills 后删除源配置
importSkills: async (items: ImportItem[]) => {
  // ... 导入逻辑
  if (result.success || result.imported.skills > 0) {
    const skillNames = items.map((item) => item.name);
    await safeInvoke<number>('remove_imported_skills', {
      claudeConfigDir,
      skillNames,
    });
    await useSkillsStore.getState().loadSkills();
  }
}
```

**与导入相关的逻辑**:

1. **导入来源**: 主要从 `~/.claude/skills/` 目录检测用户级 Skills，从 `~/.claude/settings.json` 和项目级 `.mcp.json` 检测 MCPs。

2. **导入后行为**:
   - **importStore** 中的导入会**删除源配置**（调用 `remove_imported_skills` 和 `remove_imported_mcps`）
   - **pluginsStore** 中的插件导入**不删除源配置**，只标记已导入

3. **区别**:
   - `importStore` 处理**用户手动配置**的 Skills/MCPs
   - `pluginsStore` 处理**插件安装**的 Skills/MCPs

---

### 1.3 skillsStore.ts

**文件路径**: `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/stores/skillsStore.ts`

**已实现功能**:
- [x] 加载 Skills (`loadSkills`) - 从 `~/.ensemble/skills/` 扫描
- [x] 删除 Skill (`deleteSkill`)
- [x] 更新 Skill 元数据 (`updateSkillCategory`, `updateSkillTags`, `updateSkillIcon`)
- [x] 更新 Skill 作用域 (`updateSkillScope`)
- [x] 过滤 Skills (`getFilteredSkills`)
- [x] 自动分类 (`autoClassify`) - 使用 Anthropic API
- [x] 加载使用统计 (`loadUsageStats`)

**关键代码片段**:

```typescript
// 排序逻辑：插件导入的 Skills 放在底部
getFilteredSkills: () => {
  // ... 过滤逻辑
  filtered.sort((a, b) => {
    const aIsPlugin = a.installSource === 'plugin';
    const bIsPlugin = b.installSource === 'plugin';
    if (aIsPlugin === bIsPlugin) {
      return a.name.localeCompare(b.name);
    }
    return aIsPlugin ? 1 : -1;
  });
  return filtered;
}
```

**关键功能说明**:
- Skills 通过 `installSource` 字段区分来源（`'local'` | `'plugin'`）
- 插件导入的 Skills 在列表中排序到底部
- 支持 `scope` 字段区分全局/项目级

---

### 1.4 mcpsStore.ts

**文件路径**: `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/stores/mcpsStore.ts`

**已实现功能**:
- [x] 加载 MCPs (`loadMcps`) - 从 `~/.ensemble/mcps/` 扫描
- [x] 删除 MCP (`deleteMcp`)
- [x] 更新 MCP 元数据 (`updateMcpCategory`, `updateMcpTags`, `updateMcpIcon`)
- [x] 更新 MCP 作用域 (`updateMcpScope`)
- [x] 获取 MCP 工具列表 (`fetchMcpTools`)
- [x] 过滤 MCPs (`getFilteredMcps`)
- [x] 加载使用统计 (`loadUsageStats`)

**关键代码片段**:

```typescript
// MCP 也使用 installSource 区分来源
getFilteredMcps: () => {
  // ... 过滤逻辑
  filtered.sort((a, b) => {
    const aIsPlugin = a.installSource === 'plugin';
    const bIsPlugin = b.installSource === 'plugin';
    if (aIsPlugin === bIsPlugin) {
      return a.name.localeCompare(b.name);
    }
    return aIsPlugin ? 1 : -1;
  });
  return filtered;
}
```

**关键功能说明**:
- 结构与 skillsStore 类似
- 支持运行时获取 MCP 提供的工具列表
- 同样通过 `installSource` 区分来源

---

### 1.5 scenesStore.ts

**文件路径**: `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/stores/scenesStore.ts`

**已实现功能**:
- [x] 加载 Scenes (`loadScenes`)
- [x] 创建 Scene (`createScene`)
- [x] 删除 Scene (`deleteScene`)
- [x] 更新 Scene (`updateScene`)
- [x] 创建 Modal 状态管理
- [x] 选择 Skills/MCPs (`toggleSkillSelection`, `toggleMcpSelection`)

**关键代码片段**:

```typescript
// Scene 创建时选择 Skills 和 MCPs
createScene: async () => {
  const { createModal } = get();
  const scene = await safeInvoke<Scene>('add_scene', {
    name: createModal.name.trim(),
    description: createModal.description.trim(),
    icon: 'layers',
    skillIds: createModal.selectedSkillIds,
    mcpIds: createModal.selectedMcpIds,
  });
  // ...
}

// 获取可用的 Skills/MCPs
getAvailableSkills: () => {
  return useSkillsStore.getState().skills;
},
getAvailableMcps: () => {
  return useMcpsStore.getState().mcpServers;
},
```

**Scene 包含 Skills/MCPs 的方式**:
- Scene 通过 `skillIds: string[]` 和 `mcpIds: string[]` 存储关联的资源
- ID 使用资源的文件路径（如 `/Users/bo/.ensemble/skills/agent-browser`）
- 创建时从 skillsStore 和 mcpsStore 获取所有可用的 Skills/MCPs
- **当前没有对插件来源的 Skills/MCPs 做特殊过滤**

---

## 二、data.json 数据结构

### 2.1 完整结构

```json
{
  "categories": [
    {
      "id": "uuid",
      "name": "分类名称",
      "color": "#HEX颜色",
      "count": 0
    }
  ],
  "tags": [
    {
      "id": "uuid",
      "name": "标签名称",
      "count": 0
    }
  ],
  "scenes": [
    {
      "id": "uuid",
      "name": "场景名称",
      "description": "描述",
      "icon": "layers",
      "skillIds": ["skill路径1", "skill路径2"],
      "mcpIds": ["mcp路径1"],
      "createdAt": "ISO时间戳",
      "lastUsed": null
    }
  ],
  "projects": [
    {
      "id": "uuid",
      "name": "项目名称",
      "path": "/项目/路径",
      "sceneId": "关联的场景ID或空",
      "lastSynced": "ISO时间戳或null"
    }
  ],
  "skillMetadata": {
    "/skill/路径": {
      "category": "分类名",
      "tags": ["标签1", "标签2"],
      "enabled": false,
      "usageCount": 0,
      "lastUsed": null,
      "icon": "图标名或null",
      "scope": ""
    }
  },
  "mcpMetadata": {
    "/mcp/路径.json": {
      "category": "分类名",
      "tags": ["标签"],
      "enabled": false,
      "usageCount": 0,
      "lastUsed": null,
      "scope": ""
    }
  },
  "trashedScenes": [],
  "trashedProjects": [],
  "importedPluginSkills": [
    "pluginId1",
    "pluginId2|skillName"
  ],
  "importedPluginMcps": []
}
```

### 2.2 importedPluginSkills 字段

**当前状态**: 已实现并在使用中

**数据格式**:
```json
"importedPluginSkills": [
  "algorithmic-art@claude-code-settings",
  "skill-installer@claude-code-settings",
  "skill-installer@claude-code-settings|skill-installer",
  "skill-creator@claude-code-settings|skill-creator"
]
```

**使用方式**:
1. 存储格式：`pluginId` 或 `pluginId|skillName`
2. 在 `pluginsStore.detectPluginSkillsForImport()` 中传给 Rust 后端
3. 后端检测插件 Skills 时，对比此列表标记 `isImported`
4. 导入成功后通过 `addImportedPluginSkills()` 添加新 ID
5. 通过 `persistImportedPluginIds()` 持久化到 `data.json`

### 2.3 importedPluginMcps 字段

**当前状态**: 已实现，当前为空数组

**数据格式**:
```json
"importedPluginMcps": []
```

**使用方式**: 与 `importedPluginSkills` 相同的逻辑，只是针对 MCP 类型插件。

### 2.4 Claude.md 相关字段

**当前状态**: **不存在**

`data.json` 中目前没有任何与 Claude.md 相关的字段。如果要实现 Claude.md 管理功能，需要新增：

```json
{
  // 可能需要新增的字段
  "claudeMdConfigs": {
    "user": {
      "path": "~/.claude/CLAUDE.md",
      "content": "...",
      "lastModified": "ISO时间戳"
    }
  },
  // 或者在 Scene 中添加
  "scenes": [
    {
      // ... 现有字段
      "claudeMdContent": "Scene 专属的 Claude.md 内容"
    }
  ]
}
```

---

## 三、通用设计模式

### 3.1 Store 设计模式

**使用框架**: Zustand

**模式特点**:

1. **单一 Store 文件**: 每个功能域一个 Store（skills, mcps, scenes, plugins 等）

2. **状态与动作分离**:
```typescript
interface StoreState {
  // 数据状态
  data: DataType[];
  selectedId: string | null;
  filter: FilterType;

  // 加载状态
  isLoading: boolean;
  error: string | null;

  // 动作方法
  loadData: () => Promise<void>;
  updateData: (id: string, updates: Partial<DataType>) => Promise<void>;

  // 计算属性（getter 函数）
  getFilteredData: () => DataType[];
}
```

3. **乐观更新模式**:
```typescript
updateSomething: async (id, value) => {
  const oldValue = get().data.find(d => d.id === id)?.value;

  // 乐观更新 UI
  set((state) => ({
    data: state.data.map((d) =>
      d.id === id ? { ...d, value } : d
    ),
  }));

  try {
    await safeInvoke('update_command', { id, value });
  } catch (error) {
    // 失败时回滚
    set((state) => ({
      data: state.data.map((d) =>
        d.id === id ? { ...d, value: oldValue } : d
      ),
      error: String(error),
    }));
  }
}
```

4. **跨 Store 访问**:
```typescript
// 在一个 Store 中访问另一个 Store
import { useOtherStore } from './otherStore';

// 在 action 中使用
someAction: async () => {
  const { someMethod } = useOtherStore.getState();
  await someMethod();
}
```

### 3.2 与 Rust 后端交互

**交互方式**: 通过 Tauri 的 `invoke` 命令

**封装函数**:
```typescript
// src/utils/tauri.ts
export const isTauri = () => {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
};

export const safeInvoke = async <T>(cmd: string, args?: object): Promise<T | null> => {
  if (!isTauri()) return null;
  return await invoke<T>(cmd, args);
};
```

**调用模式**:
```typescript
// 1. 检查 Tauri 环境
if (!isTauri()) {
  console.warn('Cannot do X in browser mode');
  return;
}

// 2. 设置加载状态
set({ isLoading: true, error: null });

// 3. 调用后端命令
try {
  const result = await safeInvoke<ResultType>('command_name', {
    param1: value1,
    param2: value2,
  });

  if (result) {
    set({ data: result, isLoading: false });
  }
} catch (error) {
  const message = typeof error === 'string' ? error : String(error);
  set({ error: message, isLoading: false });
}
```

**常用 Rust 命令**:
- `read_app_data` / `write_app_data` - 读写 AppData
- `read_settings` / `write_settings` - 读写设置
- `scan_skills` / `scan_mcps` - 扫描资源
- `detect_installed_plugins` - 检测插件
- `detect_plugin_skills` / `detect_plugin_mcps` - 检测插件资源
- `import_plugin_skills` / `import_plugin_mcps` - 导入插件资源

### 3.3 数据持久化

**持久化机制**:

1. **Settings**: 存储在 `~/.ensemble/settings.json`
   - 通过 `settingsStore.saveSettings()` 自动保存
   - 每次 setter 调用后自动触发保存

2. **AppData**: 存储在 `~/.ensemble/data.json`
   - 包含 categories, tags, scenes, projects, metadata, importedPlugin* 等
   - 通过 `read_app_data` / `write_app_data` 命令读写
   - 特定操作后调用持久化（如导入插件后）

3. **Skills/MCPs**:
   - Skills 存储为目录（`~/.ensemble/skills/{skill-name}/SKILL.md`）
   - MCPs 存储为 JSON 文件（`~/.ensemble/mcps/{mcp-name}.json`）
   - 元数据存储在 `data.json` 的 `skillMetadata` / `mcpMetadata` 中

4. **Scenes**: 存储在 `data.json` 的 `scenes` 数组中

---

## 四、已实现 vs 待实现功能

### 4.1 已实现功能清单

**插件系统**:
- [x] 检测已安装的 Claude Code 插件
- [x] 检测插件中的 Skills 和 MCPs
- [x] 导入插件 Skills（复制到 ~/.ensemble/skills/）
- [x] 导入插件 MCPs（复制到 ~/.ensemble/mcps/）
- [x] 标记已导入的插件资源
- [x] 过滤已导入的项（不在导入弹框中显示）
- [x] 持久化已导入记录到 data.json

**Skills 管理**:
- [x] 扫描和显示 Skills
- [x] 区分本地/插件来源 (`installSource`)
- [x] 分类、标签、图标管理
- [x] 作用域管理（global/project）
- [x] 使用统计

**MCPs 管理**:
- [x] 扫描和显示 MCPs
- [x] 区分本地/插件来源
- [x] 分类、标签、图标管理
- [x] 作用域管理
- [x] 获取 MCP 工具列表

**Scenes 管理**:
- [x] 创建/删除/更新 Scene
- [x] 选择 Skills 和 MCPs 加入 Scene
- [x] Scene 与 Project 关联

### 4.2 需要扩展的功能点

**Claude.md 管理（全新功能）**:
- [ ] 读取用户级 Claude.md (`~/.claude/CLAUDE.md`)
- [ ] 读取项目级 Claude.md
- [ ] 编辑/预览 Claude.md 内容
- [ ] Claude.md 与 Scene 的关联
- [ ] Scene 分发时同步 Claude.md

**插件资源与 Scene 的限制**:
- [ ] 在 Scene 创建/编辑时过滤掉 `installSource === 'plugin'` 的资源
- [ ] 或在 UI 中提示用户插件资源不能加入 Scene
- [ ] 显示插件资源的特殊标记（如 "Plugin" 徽章）

**data.json 扩展**:
- [ ] 添加 `claudeMdConfigs` 或类似字段存储 Claude.md 配置
- [ ] 可能在 Scene 中添加 `claudeMdContent` 字段

---

## 五、代码扩展建议

### 5.1 Claude.md 管理功能

**建议创建新的 Store**: `src/stores/claudeMdStore.ts`

```typescript
interface ClaudeMdState {
  // 用户级 Claude.md
  userClaudeMd: {
    path: string;
    content: string;
    exists: boolean;
  } | null;

  // 项目级 Claude.md 缓存
  projectClaudeMds: Record<string, {
    path: string;
    content: string;
    exists: boolean;
  }>;

  // 加载状态
  isLoading: boolean;
  error: string | null;

  // Actions
  loadUserClaudeMd: () => Promise<void>;
  saveUserClaudeMd: (content: string) => Promise<void>;
  loadProjectClaudeMd: (projectPath: string) => Promise<void>;
  saveProjectClaudeMd: (projectPath: string, content: string) => Promise<void>;
}
```

### 5.2 Scene 分发限制

**修改位置**: `src/stores/scenesStore.ts`

```typescript
// 新增方法：获取可分发的 Skills（排除插件来源）
getDistributableSkills: () => {
  return useSkillsStore.getState().skills.filter(
    (skill) => skill.installSource !== 'plugin'
  );
},

getDistributableMcps: () => {
  return useMcpsStore.getState().mcpServers.filter(
    (mcp) => mcp.installSource !== 'plugin'
  );
},
```

### 5.3 UI 扩展建议

1. **新增 Claude.md 页面**: 类似 Skills/MCPs 页面的布局
   - 左侧显示已管理的 Claude.md 列表
   - 右侧显示 Markdown 编辑器/预览

2. **Scene 创建弹窗修改**:
   - 过滤掉插件来源的资源，或
   - 显示插件资源但禁用选择，附加提示

3. **Skills/MCPs 列表**:
   - 为插件导入的资源添加 "Plugin" 徽章
   - 可考虑分组显示（本地 vs 插件）

### 5.4 Rust 后端需要新增的命令

```rust
// Claude.md 相关
#[tauri::command]
fn read_claude_md(path: String) -> Result<ClaudeMdInfo, String>;

#[tauri::command]
fn write_claude_md(path: String, content: String) -> Result<(), String>;

#[tauri::command]
fn detect_claude_md_files() -> Result<Vec<ClaudeMdInfo>, String>;
```

---

## 六、类型定义总结

### 6.1 现有类型（src/types/index.ts）

| 类型名 | 用途 |
|--------|------|
| `Skill` | Skill 完整数据，含 `installSource`, `pluginId` 等 |
| `McpServer` | MCP 完整数据，含 `installSource`, `pluginId` 等 |
| `Scene` | 场景数据，含 `skillIds`, `mcpIds` |
| `Project` | 项目数据，含 `sceneId` |
| `AppData` | 应用持久化数据，含 `importedPluginSkills/Mcps` |
| `ExistingConfig` | 检测到的现有配置 |
| `ImportItem` | 导入项 |
| `ImportResult` | 导入结果 |

### 6.2 插件类型（src/types/plugin.ts）

| 类型名 | 用途 |
|--------|------|
| `DetectedPluginSkill` | 检测到的插件 Skill |
| `DetectedPluginMcp` | 检测到的插件 MCP |
| `InstalledPlugin` | 已安装的插件信息 |
| `PluginImportItem` | 插件导入项 |

### 6.3 需要新增的类型

```typescript
// Claude.md 相关
interface ClaudeMdConfig {
  path: string;
  content: string;
  lastModified: string;
  level: 'user' | 'project' | 'directory';
}

// Scene 扩展
interface Scene {
  // ... 现有字段
  claudeMdContent?: string;  // 可选：Scene 专属的 Claude.md 内容
}
```

---

*文档版本: 1.0*
*创建时间: 2026-02-04*
