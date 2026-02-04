# 第二批 SubAgent 执行规划

> 创建时间: 2026-02-04
> 批次: 第二批（并行执行）
> 目的: 后端和类型实现

---

## 一、执行概述

本批次包含 2 个 SubAgent，可并行执行，无相互依赖。

| SubAgent | 编号 | 任务 | 模型 | 输出 |
|----------|------|------|------|------|
| Rust 后端实现 | B1 | 实现 claude_md.rs | Opus 4.5 | src-tauri/src/commands/claude_md.rs |
| TypeScript 类型和 Store | B2 | 实现类型和 Store | Opus 4.5 | src/types/claudeMd.ts, src/stores/claudeMdStore.ts |

---

## 二、SubAgent B1: Rust 后端实现

### 2.1 任务目标

在 Git Worktree 中实现完整的 CLAUDE.md Rust 后端命令。

### 2.2 必读文档

1. `/Users/bo/Documents/Development/Ensemble/Ensemble2-claude-md-feature/docs/claude-md-feature/11-implementation-master-plan.md` - 总体执行计划
2. `/Users/bo/Documents/Development/Ensemble/Ensemble2-claude-md-feature/docs/claude-md-feature/15-data-model-design.md` - 数据模型设计（包含完整的 Rust 代码）
3. `/Users/bo/Documents/Development/Ensemble/Ensemble2-claude-md-feature/docs/claude-md-feature/14-code-structure-analysis.md` - 代码结构分析

### 2.3 必读代码文件

1. `src-tauri/src/commands/skills.rs` - 参考现有命令实现模式
2. `src-tauri/src/commands/mod.rs` - 了解模块注册方式
3. `src-tauri/src/lib.rs` - 了解命令注册方式
4. `src-tauri/src/types.rs` - 现有类型定义
5. `src-tauri/src/commands/data.rs` - read_app_data 和 write_app_data 函数

### 2.4 工作内容

1. **创建 claude_md.rs 文件**
   - 路径: `src-tauri/src/commands/claude_md.rs`
   - 包含以下命令:
     - `scan_claude_md_files` - 扫描系统中的 CLAUDE.md 文件
     - `import_claude_md` - 导入文件到 Ensemble 管理
     - `read_claude_md` - 读取单个文件
     - `get_claude_md_files` - 获取所有管理的文件
     - `update_claude_md` - 更新文件信息
     - `delete_claude_md` - 删除文件
     - `set_global_claude_md` - 设置某个文件为全局
     - `unset_global_claude_md` - 取消全局设置
     - `distribute_claude_md` - 分发到项目
     - `distribute_scene_claude_md` - 批量分发（用于 Scene）

2. **修改 types.rs**
   - 添加 `ClaudeMdFile` 结构体
   - 添加 `ClaudeMdType` 枚举
   - 添加 `ClaudeMdScanItem` 结构体
   - 添加 `ClaudeMdScanResult` 结构体
   - 添加 `ClaudeMdImportOptions` 结构体
   - 添加 `ClaudeMdImportResult` 结构体
   - 添加 `ClaudeMdDistributionPath` 枚举
   - 添加 `ClaudeMdConflictResolution` 枚举
   - 添加 `ClaudeMdDistributionOptions` 结构体
   - 添加 `ClaudeMdDistributionResult` 结构体
   - 添加 `SetGlobalResult` 结构体
   - 扩展 `AppData` 添加 `claude_md_files` 和 `global_claude_md_id`
   - 扩展 `Scene` 添加 `claude_md_ids`
   - 扩展 `AppSettings` 添加 `claude_md_distribution_path`

3. **修改 mod.rs**
   - 添加 `pub mod claude_md;`

4. **修改 lib.rs**
   - 注册所有新命令

### 2.5 关键实现要点

1. **扫描命令性能优化**
   - 使用 walkdir 库
   - 排除 node_modules, .git 等目录
   - 限制扫描深度 (MAX_SCAN_DEPTH = 10)
   - 并行处理提升性能

2. **全局设置流程**
   ```
   1. 读取当前 ~/.claude/CLAUDE.md
   2. 如果存在且非当前管理的文件：备份到 ~/.ensemble/claude-md/global-backup/
   3. 取消之前全局文件的 isGlobal 标记
   4. 将新文件内容复制到 ~/.claude/CLAUDE.md
   5. 设置新文件的 isGlobal 为 true
   ```

3. **数据兼容性**
   - 所有新增字段使用 `#[serde(default)]`
   - 确保旧版 data.json 可正常解析

### 2.6 项目路径

`/Users/bo/Documents/Development/Ensemble/Ensemble2-claude-md-feature/`

### 2.7 检查清单

- [ ] 创建 claude_md.rs 文件
- [ ] 实现所有 10 个命令
- [ ] 修改 types.rs 添加所有新类型
- [ ] 修改 mod.rs 添加模块
- [ ] 修改 lib.rs 注册命令
- [ ] 代码编译无错误
- [ ] 类型定义与前端一致

---

## 三、SubAgent B2: TypeScript 类型和 Store

### 3.1 任务目标

实现完整的 TypeScript 类型定义和 Zustand Store。

### 3.2 必读文档

1. `/Users/bo/Documents/Development/Ensemble/Ensemble2-claude-md-feature/docs/claude-md-feature/11-implementation-master-plan.md` - 总体执行计划
2. `/Users/bo/Documents/Development/Ensemble/Ensemble2-claude-md-feature/docs/claude-md-feature/15-data-model-design.md` - 数据模型设计（包含完整的 TypeScript 代码）
3. `/Users/bo/Documents/Development/Ensemble/Ensemble2-claude-md-feature/docs/claude-md-feature/14-code-structure-analysis.md` - 代码结构分析

### 3.3 必读代码文件

1. `src/types/index.ts` - 现有类型定义
2. `src/stores/skillsStore.ts` - Store 模式参考
3. `src/stores/mcpsStore.ts` - Store 模式参考
4. `src/stores/scenesStore.ts` - 需要扩展的 Store
5. `src/stores/settingsStore.ts` - 需要扩展的 Store
6. `src/utils/tauri.ts` - safeInvoke 使用方式

### 3.4 工作内容

1. **创建 claudeMd.ts 类型文件**
   - 路径: `src/types/claudeMd.ts`
   - 包含:
     - `ClaudeMdType` 类型
     - `ClaudeMdDistributionPath` 类型
     - `ClaudeMdConflictResolution` 类型
     - `ClaudeMdFile` 接口
     - `ClaudeMdScanItem` 接口
     - `ClaudeMdScanResult` 接口
     - `ClaudeMdImportOptions` 接口
     - `ClaudeMdImportResult` 接口
     - `ClaudeMdDistributionOptions` 接口
     - `ClaudeMdDistributionResult` 接口
     - `SetGlobalResult` 接口

2. **修改 types/index.ts**
   - 添加 `export * from './claudeMd';`
   - 扩展 `Scene` 接口添加 `claudeMdIds`
   - 扩展 `AppSettings` 接口添加 `claudeMdDistributionPath`

3. **创建 claudeMdStore.ts**
   - 路径: `src/stores/claudeMdStore.ts`
   - 包含:
     - State: files, globalFileId, scanResult, isScanning, selectedFileId, filter, isLoading, isImporting, isSetting, isDistributing, error
     - Actions: loadFiles, setFiles, selectFile, scanFiles, clearScanResult, importFile, updateFile, deleteFile, setGlobal, unsetGlobal, distributeToProject, setFilter, clearFilter, clearError
     - Computed: getFilteredFiles, getGlobalFile, getNonGlobalFiles, getSelectedFile, getUnimportedScanItems

4. **修改 scenesStore.ts**
   - 添加 `selectedClaudeMdIds` 到 `CreateModalState`
   - 添加 `toggleClaudeMdSelection` 方法
   - 添加 `selectAllClaudeMd` 方法
   - 添加 `getDistributableClaudeMd` 方法
   - 修改 `createScene` 方法支持 `claudeMdIds`

5. **修改 settingsStore.ts**
   - 添加 `claudeMdDistributionPath` state
   - 添加 `setClaudeMdDistributionPath` action

### 3.5 关键实现要点

1. **Store 模式一致性**
   - 遵循现有 skillsStore 和 mcpsStore 的模式
   - 使用 safeInvoke 调用 Tauri 命令
   - 实现乐观更新和错误回滚

2. **类型命名规范**
   - camelCase 用于 TypeScript
   - 与 Rust 的 snake_case 通过 serde 转换

3. **过滤逻辑**
   - 支持搜索（名称、描述、内容）
   - 支持分类过滤
   - 支持标签过滤
   - 全局文件排序在前

### 3.6 项目路径

`/Users/bo/Documents/Development/Ensemble/Ensemble2-claude-md-feature/`

### 3.7 检查清单

- [ ] 创建 claudeMd.ts 类型文件
- [ ] 修改 types/index.ts 导出新类型
- [ ] 创建 claudeMdStore.ts
- [ ] 修改 scenesStore.ts 添加 CLAUDE.md 支持
- [ ] 修改 settingsStore.ts 添加 Distribution Path 设置
- [ ] 类型定义与 Rust 后端一致
- [ ] TypeScript 编译无错误

---

## 四、执行检查清单

### SubAgent B1 检查项
- [ ] 读取了数据模型设计文档
- [ ] 读取了现有 Rust 命令作为参考
- [ ] 实现了所有 10 个命令
- [ ] 添加了所有新类型定义
- [ ] 注册了所有命令
- [ ] 代码编译通过

### SubAgent B2 检查项
- [ ] 读取了数据模型设计文档
- [ ] 读取了现有 Store 作为参考
- [ ] 创建了完整的类型定义
- [ ] 创建了完整的 claudeMdStore
- [ ] 扩展了 scenesStore
- [ ] 扩展了 settingsStore
- [ ] TypeScript 编译通过

---

*文档版本: 1.0*
*创建时间: 2026-02-04*
