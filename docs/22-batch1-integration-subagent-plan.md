# Batch 1: 前后端集成 - SubAgent 执行规划

## 执行目标
将 6 个 Zustand Stores 连接到 Tauri 后端命令，移除 Mock 数据，实现真实的数据加载和操作。

---

## 全局约束和规范

### Tauri invoke 调用规范
```typescript
import { invoke } from '@tauri-apps/api/core';

// 参数命名：TypeScript camelCase -> Rust snake_case
// Tauri 会自动转换
await invoke('scan_skills', { sourceDir: '~/.ensemble/skills' });
```

### 错误处理模式
```typescript
try {
  const result = await invoke<T>('command_name', params);
  set({ data: result, isLoading: false, error: null });
} catch (error) {
  const message = typeof error === 'string' ? error : String(error);
  set({ error: message, isLoading: false });
}
```

### 可用的 Tauri 命令列表
```
Skills:
- scan_skills(sourceDir: String) -> Vec<Skill>
- get_skill(sourceDir: String, skillId: String) -> Option<Skill>
- update_skill_metadata(skillId: String, category: Option<String>, tags: Option<Vec<String>>, enabled: Option<bool>)

MCPs:
- scan_mcps(sourceDir: String) -> Vec<McpServer>
- get_mcp(sourceDir: String, mcpId: String) -> Option<McpServer>
- update_mcp_metadata(mcpId: String, category: Option<String>, tags: Option<Vec<String>>, enabled: Option<bool>)

Config:
- sync_project_config(projectPath: String, skillIds: Vec<String>, mcpIds: Vec<String>, sourceSkillDir: String, sourceMcpDir: String)
- clear_project_config(projectPath: String)
- get_project_config_status(projectPath: String) -> ProjectConfigStatus

Data:
- read_app_data() -> AppData
- write_app_data(data: AppData)
- read_settings() -> AppSettings
- write_settings(settings: AppSettings)
- init_app_data()

Categories:
- get_categories() -> Vec<Category>
- add_category(name: String, color: String) -> Category
- update_category(id: String, name: Option<String>, color: Option<String>)
- delete_category(id: String)

Tags:
- get_tags() -> Vec<Tag>
- add_tag(name: String) -> Tag
- delete_tag(id: String)

Scenes:
- get_scenes() -> Vec<Scene>
- add_scene(name: String, description: String, icon: String, skillIds: Vec<String>, mcpIds: Vec<String>) -> Scene
- update_scene(id: String, ...)
- delete_scene(id: String)

Projects:
- get_projects() -> Vec<Project>
- add_project(name: String, path: String, sceneId: String) -> Project
- update_project(id: String, ...)
- delete_project(id: String)

Dialog:
- select_folder() -> Option<String>
- select_file(filters: Option<Vec<FileFilter>>) -> Option<String>
```

---

## SubAgent A: settingsStore 集成

### 任务描述
修改 `src/stores/settingsStore.ts`，连接到 Tauri 后端。

### 必须先阅读的文件
1. `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/22-batch1-integration-subagent-plan.md` - 本规划文档
2. `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/21-stores-analysis.md` - Stores 分析报告
3. `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/stores/settingsStore.ts` - 当前实现

### 具体修改

1. **添加 Tauri import**
```typescript
import { invoke } from '@tauri-apps/api/core';
```

2. **添加新的 Actions**
```typescript
// 加载设置
loadSettings: async () => {
  try {
    const settings = await invoke<AppSettings>('read_settings');
    set({
      skillSourceDir: settings.skillSourceDir,
      mcpSourceDir: settings.mcpSourceDir,
      claudeConfigDir: settings.claudeConfigDir,
      anthropicApiKey: settings.anthropicApiKey || '',
      autoClassifyNewItems: settings.autoClassifyNewItems,
    });
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
},

// 保存设置
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
      }
    });
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
},

// 选择目录
selectDirectory: async (type: 'skill' | 'mcp' | 'claude') => {
  try {
    const path = await invoke<string | null>('select_folder');
    if (path) {
      if (type === 'skill') set({ skillSourceDir: path });
      else if (type === 'mcp') set({ mcpSourceDir: path });
      else set({ claudeConfigDir: path });
      // 保存设置
      get().saveSettings();
    }
  } catch (error) {
    console.error('Failed to select directory:', error);
  }
},
```

3. **修改现有 setters 以自动保存**
```typescript
setSkillSourceDir: (dir: string) => {
  set({ skillSourceDir: dir });
  get().saveSettings();
},
// ... 其他 setters 类似
```

4. **移除 persist 中间件**（改用 Tauri 持久化）

### 输出要求
- 完整修改后的 settingsStore.ts 文件
- 确保 TypeScript 类型正确
- 保留所有现有功能

---

## SubAgent B: appStore 集成

### 任务描述
修改 `src/stores/appStore.ts`，连接到 Tauri 后端。

### 必须先阅读的文件
1. `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/22-batch1-integration-subagent-plan.md`
2. `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/21-stores-analysis.md`
3. `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/stores/appStore.ts`

### 具体修改

1. **添加 Tauri import**

2. **添加加载状态**
```typescript
interface AppState {
  // ... 现有状态
  isLoading: boolean;
  error: string | null;
}
```

3. **添加新的 Actions**
```typescript
loadCategories: async () => {
  try {
    const categories = await invoke<Category[]>('get_categories');
    set({ categories });
  } catch (error) {
    console.error('Failed to load categories:', error);
  }
},

loadTags: async () => {
  try {
    const tags = await invoke<Tag[]>('get_tags');
    set({ tags });
  } catch (error) {
    console.error('Failed to load tags:', error);
  }
},

addCategory: async (name: string, color: string) => {
  try {
    const category = await invoke<Category>('add_category', { name, color });
    set((state) => ({ categories: [...state.categories, category] }));
    return category;
  } catch (error) {
    console.error('Failed to add category:', error);
    throw error;
  }
},

deleteCategory: async (id: string) => {
  try {
    await invoke('delete_category', { id });
    set((state) => ({
      categories: state.categories.filter(c => c.id !== id),
      activeCategory: state.activeCategory === id ? null : state.activeCategory
    }));
  } catch (error) {
    console.error('Failed to delete category:', error);
    throw error;
  }
},

addTag: async (name: string) => {
  try {
    const tag = await invoke<Tag>('add_tag', { name });
    set((state) => ({ tags: [...state.tags, tag] }));
    return tag;
  } catch (error) {
    console.error('Failed to add tag:', error);
    throw error;
  }
},

deleteTag: async (id: string) => {
  try {
    await invoke('delete_tag', { id });
    set((state) => ({
      tags: state.tags.filter(t => t.id !== id),
      activeTags: state.activeTags.filter(t => t !== id)
    }));
  } catch (error) {
    console.error('Failed to delete tag:', error);
    throw error;
  }
},

initApp: async () => {
  set({ isLoading: true });
  try {
    await invoke('init_app_data');
    await Promise.all([
      get().loadCategories(),
      get().loadTags(),
    ]);
    set({ isLoading: false });
  } catch (error) {
    set({ error: String(error), isLoading: false });
  }
},
```

4. **移除 Mock 数据**

---

## SubAgent C: skillsStore 集成

### 任务描述
修改 `src/stores/skillsStore.ts`，连接到 Tauri 后端。

### 必须先阅读的文件
1. `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/22-batch1-integration-subagent-plan.md`
2. `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/21-stores-analysis.md`
3. `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/stores/skillsStore.ts`
4. `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/stores/settingsStore.ts` - 获取 sourceDir

### 具体修改

1. **添加 Tauri import**

2. **添加 error 状态**
```typescript
interface SkillsState {
  // ... 现有状态
  error: string | null;
}
```

3. **添加/修改 Actions**
```typescript
loadSkills: async () => {
  const { skillSourceDir } = useSettingsStore.getState();
  set({ isLoading: true, error: null });
  try {
    const skills = await invoke<Skill[]>('scan_skills', {
      sourceDir: skillSourceDir
    });
    set({ skills, isLoading: false });
  } catch (error) {
    set({ error: String(error), isLoading: false });
  }
},

toggleSkill: async (id: string) => {
  const skill = get().skills.find(s => s.id === id);
  if (!skill) return;

  // 乐观更新
  set((state) => ({
    skills: state.skills.map(s =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    )
  }));

  try {
    await invoke('update_skill_metadata', {
      skillId: id,
      enabled: !skill.enabled,
    });
  } catch (error) {
    // 回滚
    set((state) => ({
      skills: state.skills.map(s =>
        s.id === id ? { ...s, enabled: skill.enabled } : s
      ),
      error: String(error)
    }));
  }
},

updateSkillCategory: async (id: string, category: string) => {
  try {
    await invoke('update_skill_metadata', {
      skillId: id,
      category,
    });
    set((state) => ({
      skills: state.skills.map(s =>
        s.id === id ? { ...s, category } : s
      )
    }));
  } catch (error) {
    set({ error: String(error) });
  }
},

updateSkillTags: async (id: string, tags: string[]) => {
  try {
    await invoke('update_skill_metadata', {
      skillId: id,
      tags,
    });
    set((state) => ({
      skills: state.skills.map(s =>
        s.id === id ? { ...s, tags } : s
      )
    }));
  } catch (error) {
    set({ error: String(error) });
  }
},
```

4. **移除 Mock 数据** (mockCategories, mockTags, mockSkills)

5. **保留筛选 Getters** (getFilteredSkills, getEnabledCount 等)

---

## SubAgent D: mcpsStore 集成

### 任务描述
修改 `src/stores/mcpsStore.ts`，连接到 Tauri 后端。

### 必须先阅读的文件
1. `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/22-batch1-integration-subagent-plan.md`
2. `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/21-stores-analysis.md`
3. `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/stores/mcpsStore.ts`
4. `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/stores/settingsStore.ts`

### 具体修改
与 skillsStore 类似：
1. 添加 Tauri import
2. 添加 error 状态
3. 添加 loadMcps, toggleMcp, updateMcpCategory, updateMcpTags
4. 移除 Mock 数据 (mockMcpServers)
5. 保留筛选 Getters

---

## SubAgent E: scenesStore 集成

### 任务描述
修改 `src/stores/scenesStore.ts`，连接到 Tauri 后端。

### 必须先阅读的文件
1. `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/22-batch1-integration-subagent-plan.md`
2. `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/21-stores-analysis.md`
3. `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/stores/scenesStore.ts`
4. `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/stores/skillsStore.ts` - 获取 skills 数据
5. `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/stores/mcpsStore.ts` - 获取 mcps 数据

### 具体修改

1. **添加 Tauri import**

2. **添加 error 状态**

3. **添加/修改 Actions**
```typescript
loadScenes: async () => {
  set({ isLoading: true, error: null });
  try {
    const scenes = await invoke<Scene[]>('get_scenes');
    set({ scenes, isLoading: false });
  } catch (error) {
    set({ error: String(error), isLoading: false });
  }
},

createScene: async () => {
  const { createModal } = get();
  try {
    const scene = await invoke<Scene>('add_scene', {
      name: createModal.name,
      description: createModal.description,
      icon: 'layers', // 默认图标
      skillIds: createModal.selectedSkillIds,
      mcpIds: createModal.selectedMcpIds,
    });
    set((state) => ({
      scenes: [...state.scenes, scene],
      createModal: { ...state.createModal, isOpen: false }
    }));
    // 重置表单
    get().closeCreateModal();
    return scene;
  } catch (error) {
    set({ error: String(error) });
    throw error;
  }
},

deleteScene: async (id: string) => {
  try {
    await invoke('delete_scene', { id });
    set((state) => ({
      scenes: state.scenes.filter(s => s.id !== id),
      selectedSceneId: state.selectedSceneId === id ? null : state.selectedSceneId
    }));
  } catch (error) {
    set({ error: String(error) });
    throw error;
  }
},

updateScene: async (id: string, updates: Partial<Scene>) => {
  try {
    await invoke('update_scene', { id, ...updates });
    set((state) => ({
      scenes: state.scenes.map(s =>
        s.id === id ? { ...s, ...updates } : s
      )
    }));
  } catch (error) {
    set({ error: String(error) });
    throw error;
  }
},
```

4. **修改 Modal getters**
```typescript
// 从其他 stores 获取数据，而不是使用 mock 数据
getAvailableSkills: () => {
  return useSkillsStore.getState().skills;
},

getAvailableMcps: () => {
  return useMcpsStore.getState().mcpServers;
},
```

5. **移除 Mock 数据** (mockScenes, mockSkills, mockMcpServers)

---

## SubAgent F: projectsStore 集成

### 任务描述
修改 `src/stores/projectsStore.ts`，连接到 Tauri 后端。

### 必须先阅读的文件
1. `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/22-batch1-integration-subagent-plan.md`
2. `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/21-stores-analysis.md`
3. `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/stores/projectsStore.ts`
4. `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/stores/scenesStore.ts` - 获取 scenes 数据
5. `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/stores/settingsStore.ts` - 获取配置路径

### 具体修改

1. **添加 Tauri import**

2. **添加 error 和 syncing 状态**
```typescript
interface ProjectsState {
  // ... 现有状态
  error: string | null;
  syncingProjectId: string | null;
}
```

3. **添加/修改 Actions**
```typescript
loadProjects: async () => {
  set({ isLoading: true, error: null });
  try {
    const projects = await invoke<Project[]>('get_projects');
    set({ projects, isLoading: false });
  } catch (error) {
    set({ error: String(error), isLoading: false });
  }
},

createProject: async () => {
  const { newProject } = get();
  try {
    const project = await invoke<Project>('add_project', {
      name: newProject.name,
      path: newProject.path,
      sceneId: newProject.sceneId,
    });
    set((state) => ({
      projects: [...state.projects, project],
      isCreating: false,
      selectedProjectId: project.id,
    }));
    return project;
  } catch (error) {
    set({ error: String(error) });
    throw error;
  }
},

syncProject: async (id: string) => {
  const project = get().projects.find(p => p.id === id);
  if (!project) return;

  const scene = useScenesStore.getState().scenes.find(s => s.id === project.sceneId);
  if (!scene) {
    set({ error: 'Scene not found' });
    return;
  }

  const { skillSourceDir, mcpSourceDir } = useSettingsStore.getState();

  set({ syncingProjectId: id });
  try {
    await invoke('sync_project_config', {
      projectPath: project.path,
      skillIds: scene.skillIds,
      mcpIds: scene.mcpIds,
      sourceSkillDir: skillSourceDir,
      sourceMcpDir: mcpSourceDir,
    });

    // 更新 lastSynced
    const now = new Date().toISOString();
    await invoke('update_project', { id, lastSynced: now });

    set((state) => ({
      projects: state.projects.map(p =>
        p.id === id ? { ...p, lastSynced: now } : p
      ),
      syncingProjectId: null
    }));
  } catch (error) {
    set({ error: String(error), syncingProjectId: null });
    throw error;
  }
},

clearProjectConfig: async (id: string) => {
  const project = get().projects.find(p => p.id === id);
  if (!project) return;

  try {
    await invoke('clear_project_config', { projectPath: project.path });

    // 清除 lastSynced
    await invoke('update_project', { id, lastSynced: null });

    set((state) => ({
      projects: state.projects.map(p =>
        p.id === id ? { ...p, lastSynced: undefined } : p
      )
    }));
  } catch (error) {
    set({ error: String(error) });
    throw error;
  }
},

selectProjectFolder: async () => {
  try {
    const path = await invoke<string | null>('select_folder');
    if (path) {
      set((state) => ({
        newProject: { ...state.newProject, path }
      }));
    }
  } catch (error) {
    set({ error: String(error) });
  }
},

deleteProject: async (id: string) => {
  try {
    await invoke('delete_project', { id });
    set((state) => ({
      projects: state.projects.filter(p => p.id !== id),
      selectedProjectId: state.selectedProjectId === id ? null : state.selectedProjectId
    }));
  } catch (error) {
    set({ error: String(error) });
    throw error;
  }
},
```

4. **修改获取 scenes 的方式**
```typescript
getAvailableScenes: () => {
  return useScenesStore.getState().scenes;
},
```

5. **移除 Mock 数据** (mockProjects, mockScenes)

---

## 输出检查清单

每个 SubAgent 完成后需要确认：

- [ ] 添加了 `import { invoke } from '@tauri-apps/api/core'`
- [ ] 添加了 error 状态
- [ ] 实现了所有需要的 Tauri 调用
- [ ] 移除了所有 Mock 数据
- [ ] 保留了纯前端的状态和 getters
- [ ] TypeScript 类型正确
- [ ] 没有语法错误

---

## 执行顺序

1. SubAgent A (settingsStore) - 基础配置
2. SubAgent B (appStore) - 全局状态
3. SubAgent C (skillsStore) - 依赖 settingsStore
4. SubAgent D (mcpsStore) - 依赖 settingsStore
5. SubAgent E (scenesStore) - 依赖 skillsStore, mcpsStore
6. SubAgent F (projectsStore) - 依赖 scenesStore, settingsStore

由于依赖关系，建议：
- 第一批并行：A, B
- 第二批并行：C, D
- 第三批并行：E, F

或者全部并行，但每个 SubAgent 需要注意跨 store 引用的正确性。
