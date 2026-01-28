# Phase 2: 前后端集成与验收 - 主控规划文档

## 一、任务概述

### 1.1 核心目标
完成 Ensemble 项目的前后端集成、功能测试和最终验收，确保：
1. 前端 Stores 与 Tauri 后端命令完全连接
2. 所有 19 个设计稿页面状态与设计稿 1:1 匹配
3. 所有交互功能正常工作
4. 数据持久化和错误处理完善
5. 自动分类功能集成

### 1.2 验收标准（刚性要求）
| 验收项 | 标准 | 验证方式 |
|--------|------|----------|
| 视觉还原 | 所有页面与设计稿 1:1 匹配 | 截图对比 |
| 功能完整 | 19 个页面状态全部实现 | 功能测试 |
| 核心流程 | symlink + mcp.json 正常工作 | 端到端测试 |
| 数据持久化 | 数据正确存储和读取 | 重启验证 |
| 错误处理 | 友好的错误提示 | 异常场景测试 |
| 交互行为 | 符合文档描述 | 交互测试 |
| 代码质量 | 结构清晰，类型完整 | 代码审查 |
| 无错误 | 无 console 错误和警告 | 控制台检查 |

---

## 二、任务分解与执行顺序

### Phase 2.1: 前后端集成
**目标**: 将 React Stores 连接到 Tauri 命令

#### 需要修改的 Stores (6 个)
1. `skillsStore.ts` - 连接 scan_skills, update_skill_metadata
2. `mcpsStore.ts` - 连接 scan_mcps, update_mcp_metadata
3. `scenesStore.ts` - 连接 scenes CRUD 命令
4. `projectsStore.ts` - 连接 projects CRUD + sync_project_config
5. `settingsStore.ts` - 连接 read_settings, write_settings
6. `appStore.ts` - 连接 categories, tags CRUD

#### 集成模式
```typescript
import { invoke } from '@tauri-apps/api/core';

// 替换 mock 数据为真实后端调用
async loadSkills() {
  set({ isLoading: true, error: null });
  try {
    const skills = await invoke<Skill[]>('scan_skills', {
      sourceDir: '~/.ensemble/skills'
    });
    set({ skills, isLoading: false });
  } catch (error) {
    set({ error: String(error), isLoading: false });
  }
}
```

### Phase 2.2: 自动分类集成
**目标**: 集成 Anthropic API 实现自动分类功能

#### 需要实现
1. Tauri 后端添加 `auto_classify` 命令
2. 前端 SettingsPage 添加 API Key 配置
3. Skills/MCPs 页面添加 Auto Classify 按钮功能

### Phase 2.3: 视觉验证
**目标**: 确保所有页面与设计稿 1:1 匹配

#### 验证清单 (19 个页面/状态)
| ID | 页面 | Node ID | 验证项 |
|----|------|---------|--------|
| 1 | Skills 列表 | rPgYw | 布局、颜色、间距 |
| 2 | Skills 空状态 | DqVji | EmptyState 组件 |
| 3 | Skills 分类筛选 | xzUxa | 筛选状态显示 |
| 4 | Skills 标签筛选 | vjc0x | 标签选中状态 |
| 5 | Skill 详情 | nNy4r | 双栏布局 |
| 6 | MCP 列表 | hzMDi | 列表样式 |
| 7 | MCP 空状态 | h1E7V | EmptyState |
| 8 | MCP 详情 | ltFNv | 详情面板 |
| 9 | Scenes 列表 | M7mYr | 卡片样式 |
| 10 | Scenes 空状态 | v7TIk | EmptyState |
| 11 | Scene 详情 | LlxKB | 详情面板 |
| 12 | 新建 Scene | Ek3cB | 三栏模态框 |
| 13 | Projects 列表 | y0Mt4 | 列表样式 |
| 14 | Projects 空状态 | F1YbB | EmptyState |
| 15 | 新建 Project | cdnEv | 配置面板 |
| 16 | Settings | qSzzi | 设置页面 |
| 17 | 分类下拉 | weNqA | Dropdown 组件 |
| 18 | 标签下拉 | moMFu | 多选 Dropdown |
| 19 | 分类右键菜单 | v4ije | ContextMenu |

### Phase 2.4: 功能测试
**目标**: 验证所有功能正常工作

#### UI 一致性检查
- [ ] 所有颜色值使用 CSS 变量
- [ ] 所有字体大小符合规范
- [ ] 所有圆角值符合规范
- [ ] 所有间距使用 4px 倍数
- [ ] Toggle 开关三种尺寸正确
- [ ] 列表项样式区分主列表/侧边列表
- [ ] 空状态页面有正确提示
- [ ] 模态框遮罩透明度正确

#### 功能完整性检查
- [ ] Skills CRUD 完整
- [ ] MCPs CRUD 完整
- [ ] Scenes CRUD 完整
- [ ] Projects CRUD 完整
- [ ] 分类筛选功能
- [ ] 标签筛选功能
- [ ] 搜索功能
- [ ] Symlink 创建
- [ ] MCP 配置生成
- [ ] 自动分类调用

#### 交互检查
- [ ] 所有可点击元素有 hover 效果
- [ ] 所有表单有验证
- [ ] 所有破坏性操作有确认
- [ ] 键盘导航支持
- [ ] 加载状态显示

---

## 三、SubAgent 任务分配

### Batch 1: 前后端集成 (6 个 SubAgent 并行)

#### SubAgent A: skillsStore 集成
- 修改 `src/stores/skillsStore.ts`
- 集成命令: scan_skills, get_skill, update_skill_metadata
- 添加加载状态和错误处理

#### SubAgent B: mcpsStore 集成
- 修改 `src/stores/mcpsStore.ts`
- 集成命令: scan_mcps, get_mcp, update_mcp_metadata
- 添加加载状态和错误处理

#### SubAgent C: scenesStore 集成
- 修改 `src/stores/scenesStore.ts`
- 集成命令: get_scenes, add_scene, update_scene, delete_scene
- 添加加载状态和错误处理

#### SubAgent D: projectsStore 集成
- 修改 `src/stores/projectsStore.ts`
- 集成命令: get_projects, add_project, update_project, delete_project, sync_project_config
- 添加加载状态和错误处理

#### SubAgent E: settingsStore 集成
- 修改 `src/stores/settingsStore.ts`
- 集成命令: read_settings, write_settings
- 添加加载状态和错误处理

#### SubAgent F: appStore 集成
- 修改 `src/stores/appStore.ts`
- 集成命令: categories CRUD, tags CRUD
- 添加 init_app_data 调用

### Batch 2: 自动分类功能

#### SubAgent G: 后端 auto_classify 命令
- 添加 `src-tauri/src/commands/classify.rs`
- 实现 Anthropic API 调用
- 注册命令到 lib.rs

#### SubAgent H: 前端 Auto Classify 功能
- 修改 SkillsPage 添加功能
- 修改 McpServersPage 添加功能
- 修改 SettingsPage API Key 配置

### Batch 3: 编译和初步测试

#### SubAgent I: 编译验证
- 运行 cargo check 和 npm run build
- 修复编译错误
- 验证类型定义一致性

### Batch 4: 视觉验证 (需要运行应用)

#### SubAgent J: 启动应用并截图验证
- 运行 npm run tauri dev
- 访问每个页面并截图
- 与设计稿对比

### Batch 5: 功能测试和修复

#### 根据 Batch 4 结果进行迭代修复

---

## 四、关键技术细节

### 4.1 Tauri invoke 调用规范

```typescript
import { invoke } from '@tauri-apps/api/core';

// 正确的参数传递方式（驼峰转下划线）
await invoke('scan_skills', { sourceDir: '~/.ensemble/skills' });
// Rust 端接收: source_dir: String

// 返回类型指定
const skills = await invoke<Skill[]>('scan_skills', { sourceDir });
```

### 4.2 错误处理模式

```typescript
try {
  const result = await invoke<T>('command_name', params);
  return result;
} catch (error) {
  // Tauri 错误通常是字符串
  const message = typeof error === 'string' ? error : String(error);
  set({ error: message });
  // 可选：显示 Toast 通知
}
```

### 4.3 加载状态管理

```typescript
interface StoreState {
  isLoading: boolean;
  error: string | null;
  // ... 其他状态
}

// 操作开始
set({ isLoading: true, error: null });
// 操作成功
set({ data, isLoading: false });
// 操作失败
set({ error: message, isLoading: false });
```

### 4.4 数据初始化流程

```typescript
// App.tsx 或 MainLayout.tsx
useEffect(() => {
  const initApp = async () => {
    await invoke('init_app_data');
    await skillsStore.loadSkills();
    await mcpsStore.loadMcps();
    await appStore.loadCategories();
    await appStore.loadTags();
  };
  initApp();
}, []);
```

---

## 五、风险和注意事项

### 5.1 类型一致性
- Rust 端使用 snake_case
- TypeScript 端使用 camelCase
- Tauri 自动转换，但需要确保类型定义一致

### 5.2 路径处理
- 前端传递 `~/.ensemble/skills`
- 后端 expand_path 函数展开 `~`

### 5.3 异步操作
- 所有 Tauri 命令都是异步的
- 需要正确处理 Promise 和错误

### 5.4 测试数据
- 需要创建测试用的 Skills 和 MCPs 文件
- 创建 `~/.ensemble/` 目录结构

---

## 六、验收流程

### Step 1: 编译验证
- `cargo check` 无错误
- `npm run build` 无错误

### Step 2: 运行验证
- `npm run tauri dev` 正常启动
- 无 console 错误

### Step 3: 视觉验证
- 逐页截图
- 与设计稿对比

### Step 4: 功能验证
- 执行开发检查清单
- 记录问题

### Step 5: 迭代修复
- 修复发现的问题
- 重新验证

### Step 6: 最终确认
- 所有检查项通过
- 生成验收报告
