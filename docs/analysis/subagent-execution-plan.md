# SubAgent 执行规划文档 - 核心功能实现

## 文档信息
- **创建日期**: 2026-02-02
- **任务**: 实现 Ensemble 核心功能（导入/Scope/Finder 集成）
- **工作分支**: feature/core-import-scope-finder
- **工作目录**: /Users/bo/Documents/Development/Ensemble/Ensemble2-core-features

---

## 确认的设计决策

| 问题 | 决策 |
|------|------|
| Q1: Scope 切换同步策略 | 方案 A: 创建 symlink 到 ~/.claude/，原文件保留 |
| Q2: 导入时 Scope 设置 | 方案 A: 全部设为 Project |
| Q3: 无 Scene 时 Finder 行为 | 方案 B: 弹出独立的 Scene 选择小窗口 |
| Q4: 设计稿 Install Scope | 是，复用设计，改为可选择的下拉框 |
| 额外要求 | 导入前备份，非破坏性操作 |

---

## 执行阶段划分

### Phase 1: 数据模型扩展
**目标**: 扩展类型定义，添加 scope 字段和新设置项

**修改文件**:
- `src/types/index.ts` - TypeScript 类型
- `src-tauri/src/types.rs` - Rust 类型

**新增字段**:
```typescript
// Skill 和 McpServer 新增
scope: 'global' | 'project'

// AppSettings 新增
terminalApp: string
claudeCommand: string
hasCompletedImport: boolean
```

---

### Phase 2: 后端命令实现
**目标**: 实现导入、Scope 管理、备份等核心后端逻辑

**新增命令**:

#### 2.1 detect_existing_config
```rust
#[tauri::command]
fn detect_existing_config(claude_config_dir: String) -> Result<ExistingConfig, String>
```
- 检测 ~/.claude/skills/ 目录中的 Skills
- 检测 ~/.claude/settings.json 中的 mcpServers
- 返回发现的配置列表

#### 2.2 backup_before_import
```rust
#[tauri::command]
fn backup_before_import(
    ensemble_dir: String,
    claude_config_dir: String
) -> Result<BackupInfo, String>
```
- 创建 ~/.ensemble/backups/YYYYMMDD_HHMMSS/ 目录
- 备份 ~/.claude/settings.json
- 备份 ~/.claude/skills/ 目录结构
- 返回备份路径

#### 2.3 import_existing_config
```rust
#[tauri::command]
fn import_existing_config(
    claude_config_dir: String,
    ensemble_dir: String,
    items: Vec<ImportItem>
) -> Result<ImportResult, String>
```
- 复制（非移动）Skills 到 ~/.ensemble/skills/
- 提取 mcpServers 配置到 ~/.ensemble/mcps/*.json
- 不修改原 ~/.claude 目录（非破坏性）
- 返回导入结果

#### 2.4 update_skill_scope
```rust
#[tauri::command]
fn update_skill_scope(
    skill_id: String,
    scope: String,
    ensemble_dir: String,
    claude_config_dir: String
) -> Result<(), String>
```
- 如果 scope == "global":
  - 在 ~/.claude/skills/ 创建 symlink 指向 ~/.ensemble/skills/<name>
- 如果 scope == "project":
  - 删除 ~/.claude/skills/<name> 的 symlink（如果存在）
- 更新 metadata 中的 scope 字段

#### 2.5 update_mcp_scope
```rust
#[tauri::command]
fn update_mcp_scope(
    mcp_id: String,
    scope: String,
    ensemble_dir: String,
    claude_config_dir: String
) -> Result<(), String>
```
- 如果 scope == "global":
  - 读取 ~/.ensemble/mcps/<name>.json
  - 添加到 ~/.claude/settings.json 的 mcpServers
- 如果 scope == "project":
  - 从 ~/.claude/settings.json 的 mcpServers 移除
- 更新 metadata 中的 scope 字段

#### 2.6 install_quick_action
```rust
#[tauri::command]
fn install_quick_action() -> Result<String, String>
```
- 创建 Automator Quick Action
- 安装到 ~/Library/Services/
- 返回安装路径

#### 2.7 launch_claude_for_folder
```rust
#[tauri::command]
async fn launch_claude_for_folder(
    folder_path: String,
    terminal_app: String,
    claude_command: String
) -> Result<(), String>
```
- 打开指定的终端应用
- cd 到文件夹
- 执行 claude 命令

---

### Phase 3: 前端 Store 更新
**目标**: 更新状态管理，支持新功能

**修改文件**:
- `src/stores/skillsStore.ts`
- `src/stores/mcpsStore.ts`
- `src/stores/settingsStore.ts`

**新增 Store**:
- `src/stores/importStore.ts` - 导入状态管理

**新增方法**:
```typescript
// skillsStore
updateSkillScope(id: string, scope: 'global' | 'project'): Promise<void>

// mcpsStore
updateMcpScope(id: string, scope: 'global' | 'project'): Promise<void>

// settingsStore
setTerminalApp(app: string): void
setClaudeCommand(command: string): void
setHasCompletedImport(completed: boolean): void

// importStore (新)
interface ImportStore {
  isDetecting: boolean
  detectedConfig: ExistingConfig | null
  isImporting: boolean
  importResult: ImportResult | null
  showImportDialog: boolean

  detectExistingConfig(): Promise<void>
  importConfig(items: ImportItem[]): Promise<void>
  closeImportDialog(): void
}
```

---

### Phase 4: UI 组件实现
**目标**: 实现导入对话框和 Scope 选择器

#### 4.1 ImportDialog 组件
**文件**: `src/components/common/ImportDialog.tsx`

**功能**:
- 显示检测到的 Skills/MCPs 列表
- 可勾选要导入的项目
- 显示备份信息
- 导入/跳过按钮

#### 4.2 ScopeSelector 组件
**文件**: `src/components/common/ScopeSelector.tsx`

**功能**:
- 下拉选择 Global/Project
- 显示当前 scope 的 Badge
- 切换时调用后端更新

#### 4.3 Skill 详情页更新
**文件**: `src/pages/SkillsPage.tsx`

**修改**:
- 在 Source Section 添加 ScopeSelector
- 替换原有的静态 Badge

#### 4.4 MCP 详情页更新
**文件**: `src/pages/McpServersPage.tsx`

**修改**:
- 在 Source Configuration Section 添加 ScopeSelector
- 替换原有的 "Install Scope: User" Badge

#### 4.5 Settings 页面更新
**文件**: `src/pages/SettingsPage.tsx`

**新增**:
- 终端应用选择（Terminal/iTerm/Warp/Custom）
- 启动命令配置输入框
- Quick Action 安装按钮
- 检测并导入新配置按钮

#### 4.6 MainLayout 更新
**文件**: `src/components/layout/MainLayout.tsx`

**修改**:
- 添加首次启动检测逻辑
- 显示 ImportDialog

---

### Phase 5: Finder 集成
**目标**: 实现 Quick Action 和 Scene 选择窗口

#### 5.1 Quick Action Workflow
**输出**: Automator .workflow 文件

**内容**:
- 接收 Finder 选中的文件夹
- 调用 URL Scheme: `ensemble://launch?path=<folder>`

#### 5.2 URL Scheme 处理
**文件**: `src-tauri/src/lib.rs` 和相关前端路由

**功能**:
- 注册 `ensemble://` URL Scheme
- 解析 launch 命令和参数
- 触发 Scene 选择或直接启动

#### 5.3 Scene 选择小窗口
**文件**: `src/components/launcher/SceneSelectorWindow.tsx`

**功能**:
- 独立的小窗口（或模态框）
- 显示可用 Scenes 列表
- 选择后执行配置同步并启动

---

## SubAgent 任务分配

### Round 1: 基础设施准备

**SubAgent 1.1**: 类型定义扩展
- 修改 `src/types/index.ts`
- 修改 `src-tauri/src/types.rs`
- 确保前后端类型同步

**SubAgent 1.2**: 后端命令框架
- 创建 `src-tauri/src/commands/import.rs`
- 在 `lib.rs` 注册新命令
- 实现命令签名和基本结构

### Round 2: 后端核心逻辑

**SubAgent 2.1**: 检测和备份命令
- 实现 `detect_existing_config`
- 实现 `backup_before_import`

**SubAgent 2.2**: 导入命令
- 实现 `import_existing_config`
- 非破坏性复制逻辑

**SubAgent 2.3**: Scope 管理命令
- 实现 `update_skill_scope`
- 实现 `update_mcp_scope`
- symlink 和配置文件管理

### Round 3: 前端 Store 和组件

**SubAgent 3.1**: Store 更新
- 更新 skillsStore
- 更新 mcpsStore
- 更新 settingsStore
- 创建 importStore

**SubAgent 3.2**: ImportDialog 组件
- 创建 ImportDialog.tsx
- 连接 importStore

**SubAgent 3.3**: ScopeSelector 组件
- 创建 ScopeSelector.tsx
- 集成到详情页

### Round 4: 页面集成

**SubAgent 4.1**: Skills/MCP 详情页更新
- SkillsPage.tsx 添加 ScopeSelector
- McpServersPage.tsx 添加 ScopeSelector

**SubAgent 4.2**: Settings 页面更新
- 添加终端配置
- 添加启动命令配置
- 添加 Quick Action 安装

**SubAgent 4.3**: MainLayout 导入检测
- 首次启动检测逻辑
- ImportDialog 显示逻辑

### Round 5: Finder 集成

**SubAgent 5.1**: Quick Action 和终端启动
- 后端 install_quick_action 实现
- launch_claude_for_folder 实现
- Automator Workflow 创建

**SubAgent 5.2**: URL Scheme 和 Scene 选择
- URL Scheme 注册和处理
- Scene 选择窗口/模态框

---

## 质量检查点

### 每个 Round 完成后:
1. 编译检查 (`npm run tauri build` 不报错)
2. 类型检查 (`npm run typecheck` 不报错)
3. 运行测试 (`npm run tauri dev` 可正常启动)

### 最终验收:
1. 首次启动检测现有配置 ✓
2. 导入对话框显示并备份 ✓
3. 导入后文件正确复制到 ~/.ensemble/ ✓
4. Scope 切换功能正常 ✓
5. Global Skill 正确 symlink 到 ~/.claude/skills/ ✓
6. Global MCP 正确写入 ~/.claude/settings.json ✓
7. Settings 页面新配置项正常 ✓
8. Quick Action 安装成功 ✓
9. Finder 右键可触发 ✓
10. 终端正确启动 Claude Code ✓

---

## 文件修改清单

### 新增文件
- `src-tauri/src/commands/import.rs`
- `src/stores/importStore.ts`
- `src/components/common/ImportDialog.tsx`
- `src/components/common/ScopeSelector.tsx`
- `src/components/launcher/SceneSelectorWindow.tsx`

### 修改文件
- `src/types/index.ts`
- `src-tauri/src/types.rs`
- `src-tauri/src/commands/mod.rs`
- `src-tauri/src/lib.rs`
- `src/stores/skillsStore.ts`
- `src/stores/mcpsStore.ts`
- `src/stores/settingsStore.ts`
- `src/stores/index.ts`
- `src/pages/SkillsPage.tsx`
- `src/pages/McpServersPage.tsx`
- `src/pages/SettingsPage.tsx`
- `src/components/layout/MainLayout.tsx`
- `src-tauri/tauri.conf.json` (URL Scheme 配置)

---

## 备份策略

### 备份目录结构
```
~/.ensemble/backups/
└── YYYYMMDD_HHMMSS/
    ├── backup-info.json       # 备份元信息
    ├── claude-settings.json   # ~/.claude/settings.json 副本
    └── claude-skills/         # ~/.claude/skills/ 目录结构
        └── <skill-name>/      # 每个 skill 的完整内容
```

### backup-info.json 格式
```json
{
  "timestamp": "2026-02-02T10:30:00Z",
  "source_paths": {
    "settings": "~/.claude/settings.json",
    "skills": "~/.claude/skills/"
  },
  "items_count": {
    "skills": 12,
    "mcps": 5
  },
  "notes": "Backup created before Ensemble import"
}
```

---

## 执行顺序和依赖关系

```
Round 1 (并行)
├── SubAgent 1.1: 类型定义
└── SubAgent 1.2: 后端框架
         │
         ▼
Round 2 (顺序，依赖 Round 1)
├── SubAgent 2.1: 检测和备份 ──┐
├── SubAgent 2.2: 导入命令 ────┤ (可并行)
└── SubAgent 2.3: Scope 管理 ──┘
         │
         ▼
Round 3 (顺序，依赖 Round 2)
├── SubAgent 3.1: Store 更新 ──┐
├── SubAgent 3.2: ImportDialog ┤ (可并行)
└── SubAgent 3.3: ScopeSelector┘
         │
         ▼
Round 4 (顺序，依赖 Round 3)
├── SubAgent 4.1: 详情页更新 ──┐
├── SubAgent 4.2: Settings 更新┤ (可并行)
└── SubAgent 4.3: MainLayout ──┘
         │
         ▼
Round 5 (顺序，依赖 Round 4)
├── SubAgent 5.1: Quick Action
└── SubAgent 5.2: URL Scheme
```

---

**文档结束 - 准备开始 Round 1 执行**
