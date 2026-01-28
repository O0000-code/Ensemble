# Stores 结构分析报告

本报告分析 Ensemble 项目中所有 Zustand Stores 的结构，为前后端集成（Tauri invoke）做准备。

---

## 1. skillsStore

**文件位置**: `/src/stores/skillsStore.ts`

### 状态 (State)

```typescript
interface SkillsState {
  // 数据
  skills: Skill[];
  categories: Category[];
  tags: Tag[];

  // 选择状态
  selectedSkillId: string | null;

  // 筛选器
  filter: SkillsFilter;  // { search: string; category: string | null; tags: string[] }

  // 加载状态
  isLoading: boolean;
}
```

### Actions（需要集成 Tauri）

| Action | 当前实现 | 需要替换为 |
|--------|---------|-----------|
| `setSkills(skills)` | 直接设置 state | 保留（用于接收 Tauri 数据）|
| `selectSkill(id)` | 设置 selectedSkillId | 保留（纯前端状态）|
| `toggleSkill(id)` | 本地切换 enabled 状态 | `invoke('toggle_skill', { id })` |
| `setFilter(filter)` | 设置筛选条件 | 保留（纯前端状态）|
| `clearFilter()` | 清除筛选条件 | 保留（纯前端状态）|

### 需要新增的 Actions

| Action | Tauri Command | 说明 |
|--------|--------------|------|
| `loadSkills()` | `invoke('scan_skills')` | 从文件系统加载所有 Skills |
| `loadCategories()` | `invoke('get_categories')` | 获取分类列表 |
| `loadTags()` | `invoke('get_tags')` | 获取标签列表 |
| `saveSkill(skill)` | `invoke('save_skill', { skill })` | 保存/更新 Skill |
| `deleteSkill(id)` | `invoke('delete_skill', { id })` | 删除 Skill |

### Computed Getters

- `getFilteredSkills()`: 根据筛选条件过滤 skills（前端计算，保留）
- `getEnabledCount()`: 统计启用的 skills 数量（前端计算，保留）
- `getSelectedSkill()`: 获取当前选中的 skill（前端计算，保留）

### Mock 数据位置

- **Line 46-52**: `mockCategories` - 5 个分类
- **Line 54-63**: `mockTags` - 8 个标签
- **Line 65-272**: `mockSkills` - 13 个完整的 Skill 对象

---

## 2. mcpsStore

**文件位置**: `/src/stores/mcpsStore.ts`

### 状态 (State)

```typescript
interface McpsState {
  mcpServers: McpServer[];
  selectedMcpId: string | null;
  filter: McpsFilter;  // { search: string; category: string | null; tags: string[] }
  isLoading: boolean;
}
```

### Actions（需要集成 Tauri）

| Action | 当前实现 | 需要替换为 |
|--------|---------|-----------|
| `setMcpServers(servers)` | 直接设置 state | 保留（用于接收 Tauri 数据）|
| `selectMcp(id)` | 设置 selectedMcpId | 保留（纯前端状态）|
| `toggleMcp(id)` | 本地切换 enabled 状态 | `invoke('toggle_mcp', { id })` |
| `setFilter(filter)` | 设置筛选条件 | 保留（纯前端状态）|

### 需要新增的 Actions

| Action | Tauri Command | 说明 |
|--------|--------------|------|
| `loadMcps()` | `invoke('scan_mcps')` | 从文件系统加载所有 MCP Servers |
| `saveMcp(mcp)` | `invoke('save_mcp', { mcp })` | 保存/更新 MCP 配置 |
| `deleteMcp(id)` | `invoke('delete_mcp', { id })` | 删除 MCP 配置 |
| `testMcpConnection(id)` | `invoke('test_mcp', { id })` | 测试 MCP 连接 |

### Computed Getters

- `getFilteredMcps()`: 根据筛选条件过滤（前端计算，保留）
- `getEnabledCount()`: 统计启用数量（前端计算，保留）
- `getSelectedMcp()`: 获取选中项（前端计算，保留）

### Mock 数据位置

- **Line 29-151**: `mockMcpServers` - 6 个 MCP Server 配置
  - postgres-mcp, filesystem-mcp, github-mcp, slack-mcp, web-search-mcp, notion-mcp

---

## 3. scenesStore

**文件位置**: `/src/stores/scenesStore.ts`

### 状态 (State)

```typescript
interface ScenesState {
  scenes: Scene[];
  selectedSceneId: string | null;
  filter: { search: string };
  isLoading: boolean;

  // 创建 Modal 状态
  createModal: CreateModalState;
}

interface CreateModalState {
  isOpen: boolean;
  name: string;
  description: string;
  selectedSkillIds: string[];
  selectedMcpIds: string[];
  activeTab: 'skills' | 'mcps';
  search: string;
  categoryFilter: string;
  tagFilter: string[];
}
```

### Actions（需要集成 Tauri）

| Action | 当前实现 | 需要替换为 |
|--------|---------|-----------|
| `setScenes(scenes)` | 直接设置 state | 保留（用于接收 Tauri 数据）|
| `selectScene(id)` | 设置 selectedSceneId | 保留（纯前端状态）|
| `setFilter(filter)` | 设置筛选条件 | 保留（纯前端状态）|
| `createScene()` | 本地创建新 Scene | `invoke('create_scene', { scene })` |
| `deleteScene(id)` | 本地删除 | `invoke('delete_scene', { id })` |
| `updateScene(id, updates)` | 本地更新 | `invoke('update_scene', { id, updates })` |

### Modal 相关 Actions（纯前端，保留）

- `openCreateModal()`, `closeCreateModal()`, `updateCreateModal()`
- `toggleSkillSelection()`, `toggleMcpSelection()`
- `selectAllSkills()`, `selectAllMcps()`, `clearAllSelections()`

### 需要新增的 Actions

| Action | Tauri Command | 说明 |
|--------|--------------|------|
| `loadScenes()` | `invoke('load_scenes')` | 加载所有 Scenes |
| `saveScene(scene)` | `invoke('save_scene', { scene })` | 保存 Scene |
| `applyScene(id)` | `invoke('apply_scene', { id })` | 应用 Scene 到 Claude 配置 |

### Mock 数据位置

- **Line 56-126**: `mockScenes` - 7 个 Scene
- **Line 129-260**: `mockSkills` - 10 个用于 Modal 的 Skill
- **Line 263-370**: `mockMcpServers` - 6 个用于 Modal 的 MCP Server

---

## 4. projectsStore

**文件位置**: `/src/stores/projectsStore.ts`

### 状态 (State)

```typescript
interface ProjectsState {
  // 数据
  projects: Project[];
  selectedProjectId: string | null;
  isCreating: boolean;
  filter: ProjectsFilter;  // { search: string }

  // 新建项目表单
  newProject: NewProjectForm;  // { name: string; path: string; sceneId: string }
}
```

### Actions（需要集成 Tauri）

| Action | 当前实现 | 需要替换为 |
|--------|---------|-----------|
| `setProjects(projects)` | 直接设置 state | 保留（用于接收 Tauri 数据）|
| `selectProject(id)` | 设置 selectedProjectId | 保留（纯前端状态）|
| `setFilter(filter)` | 设置筛选条件 | 保留（纯前端状态）|
| `createProject()` | 本地创建 | `invoke('create_project', { project })` |
| `updateProject(id, data)` | 本地更新 | `invoke('update_project', { id, data })` |
| `syncProject(id)` | 本地更新 lastSynced | `invoke('sync_project', { id })` |
| `clearProjectConfig(id)` | 本地清除配置 | `invoke('clear_project_config', { id })` |
| `deleteProject(id)` | 本地删除 | `invoke('delete_project', { id })` |

### 表单相关 Actions（纯前端，保留）

- `startCreating()`, `cancelCreating()`, `updateNewProject()`

### 需要新增的 Actions

| Action | Tauri Command | 说明 |
|--------|--------------|------|
| `loadProjects()` | `invoke('load_projects')` | 加载所有项目 |
| `scanProjectDirectory(path)` | `invoke('scan_directory', { path })` | 扫描目录获取项目信息 |
| `applySceneToProject(projectId, sceneId)` | `invoke('apply_scene_to_project', {...})` | 将 Scene 应用到项目 |

### Mock 数据位置

- **Line 46-82**: `mockProjects` - 5 个项目
- **Line 199-250**: `mockScenes` - 5 个用于选择的 Scene

---

## 5. settingsStore

**文件位置**: `/src/stores/settingsStore.ts`

### 状态 (State)

```typescript
interface SettingsState {
  // 存储路径
  skillSourceDir: string;      // 默认: '~/.ensemble/skills'
  mcpSourceDir: string;        // 默认: '~/.ensemble/mcps'
  claudeConfigDir: string;     // 默认: '~/.claude'

  // API 配置
  anthropicApiKey: string;

  // 自动分类设置
  autoClassifyNewItems: boolean;

  // 统计信息
  stats: SettingsStats;  // { skillsCount, mcpsCount, scenesCount, totalSize }
}
```

### 特性

- **使用 `persist` 中间件**: 数据持久化到 localStorage
- **选择性持久化**: 只持久化配置项，不持久化 stats

### Actions（需要集成 Tauri）

| Action | 当前实现 | 需要替换为 |
|--------|---------|-----------|
| `setSkillSourceDir(dir)` | 直接设置 state | `invoke('set_skill_source_dir', { dir })` |
| `setMcpSourceDir(dir)` | 直接设置 state | `invoke('set_mcp_source_dir', { dir })` |
| `setClaudeConfigDir(dir)` | 直接设置 state | `invoke('set_claude_config_dir', { dir })` |
| `setAnthropicApiKey(key)` | 直接设置 state | `invoke('set_api_key', { key })` (需安全存储) |
| `setAutoClassifyNewItems(enabled)` | 直接设置 state | `invoke('set_auto_classify', { enabled })` |
| `setStats(stats)` | 直接设置 state | 保留（用于接收数据）|

### 需要新增的 Actions

| Action | Tauri Command | 说明 |
|--------|--------------|------|
| `loadSettings()` | `invoke('load_settings')` | 加载应用设置 |
| `saveSettings()` | `invoke('save_settings', { settings })` | 保存设置 |
| `refreshStats()` | `invoke('get_stats')` | 刷新统计信息 |
| `validateApiKey(key)` | `invoke('validate_api_key', { key })` | 验证 API Key |
| `selectDirectory(type)` | `invoke('select_directory')` | 打开目录选择对话框 |

### Computed Getters

- `getMaskedApiKey()`: 获取脱敏的 API Key
- `hasApiKey()`: 检查是否设置了 API Key

### Mock 数据位置

- **Line 46-58**: `defaultSettings` - 默认配置值

---

## 6. appStore

**文件位置**: `/src/stores/appStore.ts`

### 状态 (State)

```typescript
interface AppState {
  // 导航状态
  activeCategory: string | null;
  activeTags: string[];

  // 全局数据
  categories: Category[];
  tags: Tag[];

  // 计数统计
  counts: {
    skills: number;
    mcpServers: number;
    scenes: number;
    projects: number;
  };
}
```

### Actions（需要集成 Tauri）

| Action | 当前实现 | 需要替换为 |
|--------|---------|-----------|
| `setActiveCategory(id)` | 设置 activeCategory | 保留（纯前端状态）|
| `toggleActiveTag(tagId)` | 切换标签选择 | 保留（纯前端状态）|
| `setCategories(categories)` | 直接设置 state | 保留（用于接收数据）|
| `setTags(tags)` | 直接设置 state | 保留（用于接收数据）|
| `setCounts(counts)` | 直接设置 state | 保留（用于接收数据）|

### 需要新增的 Actions

| Action | Tauri Command | 说明 |
|--------|--------------|------|
| `loadAppData()` | `invoke('get_app_overview')` | 加载应用全局数据 |
| `refreshCounts()` | `invoke('get_counts')` | 刷新各模块计数 |

### Mock 数据位置

- **Line 30-36**: `mockCategories` - 5 个分类
- **Line 38-47**: `mockTags` - 8 个标签
- **Line 54-59**: `counts` - 硬编码的统计数字

---

## 类型定义汇总

**文件位置**: `/src/types/index.ts`

### 核心数据类型

```typescript
// Skill 技能
interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  enabled: boolean;
  sourcePath: string;
  scope: 'user' | 'project';
  invocation?: string;
  allowedTools?: string[];
  instructions: string;
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
}

// MCP Server
interface McpServer {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  enabled: boolean;
  sourcePath: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
  providedTools: Tool[];
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
}

// Tool (MCP 提供的工具)
interface Tool {
  name: string;
  description: string;
}

// Scene 场景
interface Scene {
  id: string;
  name: string;
  description: string;
  icon: string;
  skillIds: string[];
  mcpIds: string[];
  createdAt: string;
  lastUsed?: string;
}

// Project 项目
interface Project {
  id: string;
  name: string;
  path: string;
  sceneId: string;
  lastSynced?: string;
}

// Category 分类
interface Category {
  id: string;
  name: string;
  color: string;
  count: number;
}

// Tag 标签
interface Tag {
  id: string;
  name: string;
  count: number;
}

// App Settings
interface AppSettings {
  skillSourceDir: string;
  mcpSourceDir: string;
  claudeConfigDir: string;
  anthropicApiKey: string;
  autoClassifyNewItems: boolean;
}

// Config Status
interface ConfigStatus {
  projectExists: boolean;
  sceneSelected: boolean;
  skillsConfigured: boolean;
  mcpsConfigured: boolean;
}
```

---

## 集成优先级建议

基于依赖关系和功能重要性，建议按以下顺序进行 Tauri 集成：

### 第一阶段：基础设置（优先级最高）

1. **settingsStore**
   - 原因：所有其他功能依赖于配置路径
   - 关键 Commands: `load_settings`, `save_settings`, `select_directory`

### 第二阶段：核心数据加载

2. **skillsStore**
   - 原因：Skills 是核心功能
   - 关键 Commands: `scan_skills`, `save_skill`, `toggle_skill`

3. **mcpsStore**
   - 原因：MCP Servers 是核心功能
   - 关键 Commands: `scan_mcps`, `save_mcp`, `toggle_mcp`

### 第三阶段：组合功能

4. **scenesStore**
   - 原因：依赖 Skills 和 MCPs
   - 关键 Commands: `load_scenes`, `create_scene`, `apply_scene`

5. **projectsStore**
   - 原因：依赖 Scenes
   - 关键 Commands: `load_projects`, `sync_project`, `apply_scene_to_project`

### 第四阶段：全局状态

6. **appStore**
   - 原因：汇总统计，可最后集成
   - 关键 Commands: `get_app_overview`, `get_counts`

---

## Mock 数据清理检查清单

集成完成后需要清理的 Mock 数据：

- [ ] `skillsStore.ts`: Line 46-272 (mockCategories, mockTags, mockSkills)
- [ ] `mcpsStore.ts`: Line 29-151 (mockMcpServers)
- [ ] `scenesStore.ts`: Line 56-370 (mockScenes, mockSkills, mockMcpServers)
- [ ] `projectsStore.ts`: Line 46-250 (mockProjects, mockScenes)
- [ ] `settingsStore.ts`: Line 46-58 (defaultSettings.stats)
- [ ] `appStore.ts`: Line 30-59 (mockCategories, mockTags, counts)

---

## 需要注意的设计模式

### 1. 状态持久化
- `settingsStore` 使用 `zustand/middleware/persist`
- 需要评估是否改用 Tauri 的持久化存储

### 2. 前端筛选 vs 后端筛选
- 当前所有筛选逻辑在前端 (`getFilteredSkills`, `getFilteredMcps`)
- 如果数据量大，考虑后端筛选

### 3. 乐观更新
- 当前的 toggle 等操作是乐观更新
- 集成 Tauri 后需要处理错误回滚

### 4. 重复 Mock 数据
- `scenesStore` 和 `projectsStore` 都有各自的 mockSkills 和 mockMcpServers
- 集成时统一从后端获取

---

*报告生成时间: 2026-01-28*
