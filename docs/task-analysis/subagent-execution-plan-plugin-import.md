# SubAgent 执行规划文档 - 插件导入功能

## 一、执行依赖关系图

```
Phase 1a (TypeScript 类型定义)
    │
    ▼
Phase 1b (Rust 后端命令) ← 依赖 Phase 1a
    │
    ▼
Phase 2 (pluginsStore 状态管理) ← 依赖 Phase 1a, 1b
    │
    ├────────────────┐
    ▼                ▼
Phase 3          Phase 4
(导入弹框)       (列表显示)
    │                │
    │    ┌───────────┘
    │    ▼
    │  Phase 5 (Scene 创建过滤)
    │    │
    └────┼────────────┐
         ▼            │
Phase 6 (测试验证) ←──┘
```

## 二、执行顺序规划

### 第一轮：Phase 1a（单独执行，基础依赖）
- **SubAgent 数量**: 1
- **任务**: 扩展 TypeScript 类型定义
- **产出**: 修改后的类型文件

### 第二轮：Phase 1b（依赖 Phase 1a）
- **SubAgent 数量**: 1
- **任务**: 实现 Rust 后端插件命令
- **产出**: 新的 plugins.rs 和修改后的相关文件

### 第三轮：Phase 2（依赖 Phase 1a, 1b）
- **SubAgent 数量**: 1
- **任务**: 实现 pluginsStore 状态管理
- **产出**: 新的 pluginsStore.ts

### 第四轮：Phase 3 和 Phase 4（可并行，都依赖 Phase 2）
- **SubAgent 数量**: 2（并行）
- **任务 A**: 修改导入弹框支持插件导入
- **任务 B**: 修改列表显示插件来源标识
- **产出**: 修改后的弹框和卡片组件

### 第五轮：Phase 5（依赖 Phase 4）
- **SubAgent 数量**: 1
- **任务**: 修改 Scene 创建的过滤逻辑
- **产出**: 修改后的 CreateSceneModal

### 第六轮：Phase 6（依赖所有）
- **任务**: 运行测试和验证
- **执行方式**: 主 Agent 直接执行（运行 npm run tauri dev）

---

## 三、各 SubAgent 详细规范

### 3.1 Phase 1a SubAgent - TypeScript 类型定义

**工作目录**: `/Users/bo/Documents/Development/Ensemble/Ensemble2-plugin-import`

**必读文件**:
1. `/Users/bo/Documents/Development/Ensemble/Ensemble2-plugin-import/docs/task-analysis/plugin-import-final-design.md` - 完整设计文档
2. `/Users/bo/Documents/Development/Ensemble/Ensemble2-plugin-import/src/types/index.ts` - 现有类型定义

**任务**:
1. 在 `src/types/index.ts` 中添加 `InstallSource` 类型
2. 扩展 `Skill` 接口，添加 `installSource`, `pluginId`, `pluginMarketplace` 字段
3. 扩展 `McpServer` 接口，添加相同字段
4. 扩展 `AppData` 接口，添加 `importedPluginSkills`, `importedPluginMcps` 字段
5. 新建 `src/types/plugin.ts`，添加插件相关类型

**产出文件**:
- `src/types/index.ts` (修改)
- `src/types/plugin.ts` (新建)

---

### 3.2 Phase 1b SubAgent - Rust 后端命令

**工作目录**: `/Users/bo/Documents/Development/Ensemble/Ensemble2-plugin-import`

**必读文件**:
1. `/Users/bo/Documents/Development/Ensemble/Ensemble2-plugin-import/docs/task-analysis/plugin-import-final-design.md`
2. `/Users/bo/Documents/Development/Ensemble/Ensemble2-plugin-import/docs/task-analysis/plugin-storage-format-verification.md` - 插件存储格式
3. `/Users/bo/Documents/Development/Ensemble/Ensemble2-plugin-import/src/types/index.ts` - 参考 TypeScript 类型
4. `/Users/bo/Documents/Development/Ensemble/Ensemble2-plugin-import/src/types/plugin.ts` - 参考插件类型
5. `/Users/bo/Documents/Development/Ensemble/Ensemble2-plugin-import/src-tauri/src/commands/import.rs` - 现有导入实现参考
6. `/Users/bo/Documents/Development/Ensemble/Ensemble2-plugin-import/src-tauri/src/types.rs` - 现有 Rust 类型

**任务**:
1. 新建 `src-tauri/src/commands/plugins.rs`
2. 实现所有插件检测和导入命令
3. 扩展 `src-tauri/src/types.rs` 添加 Rust 类型
4. 修改 `src-tauri/src/commands/mod.rs` 导出新模块
5. 修改 `src-tauri/src/lib.rs` 注册新命令

**关键逻辑**:
- 插件路径: `~/.claude/plugins/cache/{marketplace}/{plugin}/{version}/`
- 启用状态: `~/.claude/settings.json` → `enabledPlugins`
- 导入时**不删除**源文件
- 使用 symlink 导入 Skills

**产出文件**:
- `src-tauri/src/commands/plugins.rs` (新建)
- `src-tauri/src/commands/mod.rs` (修改)
- `src-tauri/src/lib.rs` (修改)
- `src-tauri/src/types.rs` (修改)

---

### 3.3 Phase 2 SubAgent - pluginsStore 状态管理

**工作目录**: `/Users/bo/Documents/Development/Ensemble/Ensemble2-plugin-import`

**必读文件**:
1. `/Users/bo/Documents/Development/Ensemble/Ensemble2-plugin-import/docs/task-analysis/plugin-import-final-design.md`
2. `/Users/bo/Documents/Development/Ensemble/Ensemble2-plugin-import/src/types/plugin.ts`
3. `/Users/bo/Documents/Development/Ensemble/Ensemble2-plugin-import/src/stores/skillsStore.ts` - 参考现有 store 结构
4. `/Users/bo/Documents/Development/Ensemble/Ensemble2-plugin-import/src/stores/mcpsStore.ts`
5. `/Users/bo/Documents/Development/Ensemble/Ensemble2-plugin-import/src/stores/appDataStore.ts`

**任务**:
1. 新建 `src/stores/pluginsStore.ts`
2. 实现所有状态和方法
3. 修改 `src/stores/appDataStore.ts` 支持新字段

**产出文件**:
- `src/stores/pluginsStore.ts` (新建)
- `src/stores/appDataStore.ts` (修改)

---

### 3.4 Phase 3 SubAgent - 导入弹框修改

**工作目录**: `/Users/bo/Documents/Development/Ensemble/Ensemble2-plugin-import`

**必读文件**:
1. `/Users/bo/Documents/Development/Ensemble/Ensemble2-plugin-import/docs/task-analysis/plugin-import-final-design.md`
2. `/Users/bo/Documents/Development/Ensemble/Ensemble2-plugin-import/src/components/modals/ImportSkillsModal.tsx`
3. `/Users/bo/Documents/Development/Ensemble/Ensemble2-plugin-import/src/components/modals/ImportMcpModal.tsx`
4. `/Users/bo/Documents/Development/Ensemble/Ensemble2-plugin-import/src/stores/pluginsStore.ts`
5. 查看设计稿以确保 UI 一致性

**任务**:
1. 修改 `ImportSkillsModal.tsx` 添加 Plugin Skills Tab
2. 修改 `ImportMcpModal.tsx` 添加 Plugin MCPs Tab
3. 集成 pluginsStore
4. 实现已导入过滤逻辑

**UI 要求**:
- Tab 样式与现有组件一致
- 列表项样式复用现有样式
- 保持整体视觉风格统一

**产出文件**:
- `src/components/modals/ImportSkillsModal.tsx` (修改)
- `src/components/modals/ImportMcpModal.tsx` (修改)

---

### 3.5 Phase 4 SubAgent - 列表显示修改

**工作目录**: `/Users/bo/Documents/Development/Ensemble/Ensemble2-plugin-import`

**必读文件**:
1. `/Users/bo/Documents/Development/Ensemble/Ensemble2-plugin-import/docs/task-analysis/plugin-import-final-design.md`
2. `/Users/bo/Documents/Development/Ensemble/Ensemble2-plugin-import/src/components/skills/SkillCard.tsx`
3. `/Users/bo/Documents/Development/Ensemble/Ensemble2-plugin-import/src/components/mcps/McpCard.tsx`
4. `/Users/bo/Documents/Development/Ensemble/Ensemble2-plugin-import/src/stores/pluginsStore.ts`
5. 查看现有 UI 组件样式

**任务**:
1. 修改 `SkillCard.tsx` 显示插件来源标识
2. 修改 `McpCard.tsx` 显示插件来源标识
3. 显示"全局已启用"状态
4. 集成 pluginsStore 获取启用状态

**UI 要求**:
- 插件标识样式小巧、不突兀
- "全局已启用"使用柔和的黄色背景
- 与现有卡片样式协调

**产出文件**:
- `src/components/skills/SkillCard.tsx` (修改)
- `src/components/mcps/McpCard.tsx` (修改)

---

### 3.6 Phase 5 SubAgent - Scene 创建过滤

**工作目录**: `/Users/bo/Documents/Development/Ensemble/Ensemble2-plugin-import`

**必读文件**:
1. `/Users/bo/Documents/Development/Ensemble/Ensemble2-plugin-import/docs/task-analysis/plugin-import-final-design.md`
2. `/Users/bo/Documents/Development/Ensemble/Ensemble2-plugin-import/src/components/modals/CreateSceneModal.tsx`
3. `/Users/bo/Documents/Development/Ensemble/Ensemble2-plugin-import/src/stores/pluginsStore.ts`

**任务**:
1. 修改 `CreateSceneModal.tsx` 添加过滤逻辑
2. 插件仍启用的项显示为禁用状态
3. 添加 Tooltip 说明

**过滤逻辑**:
```typescript
const isDisabled = skill.installSource === 'plugin'
  && skill.pluginId
  && pluginEnabledStatus[skill.pluginId];
```

**Tooltip 文案**: "此 Skill/MCP 由已启用的插件提供，全局已生效，无需添加到场景"

**产出文件**:
- `src/components/modals/CreateSceneModal.tsx` (修改)

---

## 四、通用规范

### 所有 SubAgent 必须遵守:

1. **工作目录**: 所有修改在 `/Users/bo/Documents/Development/Ensemble/Ensemble2-plugin-import` 进行
2. **必读设计文档**: 每个 SubAgent 开始前必须先读取 `plugin-import-final-design.md`
3. **UI 一致性**: 任何 UI 修改必须与现有风格完全一致
4. **不破坏现有功能**: 所有修改必须确保现有功能正常
5. **代码质量**: 遵循项目现有的代码风格和命名规范
6. **错误处理**: 添加适当的错误处理和边界情况处理

### 关键路径提醒:
- 插件缓存目录: `~/.claude/plugins/cache/`
- 插件启用状态: `~/.claude/settings.json` → `enabledPlugins`
- 已安装插件记录: `~/.claude/plugins/installed_plugins.json`
- Ensemble 数据: `~/.ensemble/data.json`
