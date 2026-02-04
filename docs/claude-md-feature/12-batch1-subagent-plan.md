# 第一批 SubAgent 执行规划

> 创建时间: 2026-02-04
> 批次: 第一批（并行执行）
> 目的: 基础研究和设计分析

---

## 一、执行概述

本批次包含 3 个 SubAgent，可并行执行，无相互依赖。

| SubAgent | 编号 | 任务 | 模型 | 输出文档 |
|----------|------|------|------|----------|
| 设计稿分析 | A1 | 读取设计稿，提取详细规范 | Opus 4.5 | 13-design-spec-analysis.md |
| 代码结构分析 | A2 | 分析现有代码，确定修改点 | Opus 4.5 | 14-code-structure-analysis.md |
| 数据模型设计 | A3 | 设计完整数据模型和接口 | Opus 4.5 | 15-data-model-design.md |

---

## 二、SubAgent A1: 设计稿详细分析

### 2.1 任务目标

从设计稿中提取所有页面的详细设计规范，确保后续 UI 实现能够 1:1 还原设计。

### 2.2 必读文档

1. `/Users/bo/Documents/Development/Ensemble/Ensemble2-claude-md-feature/docs/claude-md-feature/11-implementation-master-plan.md` - 总体执行计划

### 2.3 工作内容

1. 使用 Pencil MCP 读取以下节点：
   - `P3AWE` - 列表页
   - `6zwvB` - 空状态页
   - `oc4RY` - 导入弹窗
   - `26KVC` - 详情页
   - `qSzzi` - Settings 页面（CLAUDE.md 相关部分）

2. 对每个页面提取：
   - 布局结构（尺寸、间距、对齐方式）
   - 颜色值（背景、文字、边框）
   - 字体样式（字号、字重、行高）
   - 组件结构（层级关系、组件类型）
   - 交互状态（hover、active、disabled）

3. 特别关注：
   - 角标系统的实现细节
   - Set as Global 开关的样式
   - 导入弹窗的表单布局
   - Distribution Path 设置的 UI

### 2.4 输出要求

将结果写入：`/Users/bo/Documents/Development/Ensemble/Ensemble2-claude-md-feature/docs/claude-md-feature/13-design-spec-analysis.md`

输出格式：
```markdown
# 设计规范分析

## 页面 1: 列表页 (P3AWE)
### 布局结构
...
### 颜色规范
...
### 组件详情
...

## 页面 2: ...
```

### 2.5 设计稿路径

`/Users/bo/Documents/Development/Ensemble/设计稿/MCP 管理.pen`

---

## 三、SubAgent A2: 现有代码结构分析

### 3.1 任务目标

分析 Ensemble 现有代码结构，确定需要新增和修改的文件，确保新功能与现有架构一致。

### 3.2 必读文档

1. `/Users/bo/Documents/Development/Ensemble/Ensemble2-claude-md-feature/docs/claude-md-feature/11-implementation-master-plan.md` - 总体执行计划

### 3.3 工作内容

1. 分析现有页面结构：
   - 读取 `src/pages/SkillsPage.tsx` - 作为列表页参考
   - 读取 `src/pages/McpsPage.tsx` - 作为另一个列表页参考
   - 读取 `src/pages/SettingsPage.tsx` - 需要修改

2. 分析现有组件结构：
   - 读取 `src/components/skills/` 目录下的组件
   - 读取 `src/components/mcps/` 目录下的组件
   - 读取 `src/components/Sidebar.tsx` - 需要添加导航

3. 分析现有 Store 结构：
   - 读取 `src/stores/skillsStore.ts` - 作为参考
   - 读取 `src/stores/mcpsStore.ts` - 作为参考
   - 读取 `src/stores/pluginsStore.ts` - 了解导入逻辑

4. 分析现有 Rust 后端：
   - 读取 `src-tauri/src/commands/` 目录结构
   - 读取 `src-tauri/src/lib.rs` - 了解命令注册方式

5. 分析路由和导航：
   - 读取 `src/App.tsx` - 了解路由配置
   - 确定新路由添加位置

### 3.4 输出要求

将结果写入：`/Users/bo/Documents/Development/Ensemble/Ensemble2-claude-md-feature/docs/claude-md-feature/14-code-structure-analysis.md`

输出格式：
```markdown
# 代码结构分析

## 一、需要新增的文件
### 1.1 前端文件
...
### 1.2 后端文件
...

## 二、需要修改的文件
### 2.1 前端修改
...
### 2.2 后端修改
...

## 三、代码模式参考
### 3.1 Store 模式
...
### 3.2 组件模式
...
### 3.3 Rust 命令模式
...
```

### 3.5 项目路径

`/Users/bo/Documents/Development/Ensemble/Ensemble2-claude-md-feature/`

---

## 四、SubAgent A3: 数据模型设计

### 4.1 任务目标

设计完整的数据模型和 Rust 后端接口，确保前后端数据流畅通。

### 4.2 必读文档

1. `/Users/bo/Documents/Development/Ensemble/Ensemble2-claude-md-feature/docs/claude-md-feature/11-implementation-master-plan.md` - 总体执行计划
2. `/Users/bo/Documents/Development/Ensemble/Ensemble2-claude-md-feature/docs/claude-md-feature/09-feature-design-proposal.md` - 之前的设计方案（如果存在）

### 4.3 工作内容

1. 设计 TypeScript 类型：
   - ClaudeMdFile 接口
   - ClaudeMdType 类型
   - ClaudeMdScanResult 接口
   - Scene 扩展接口
   - Settings 扩展接口

2. 设计 Rust 数据结构：
   - ClaudeMdFile struct
   - ScanResult struct
   - ImportOptions struct

3. 设计 Rust 命令接口：
   - scan_claude_md_files() - 全局扫描
   - import_claude_md() - 导入文件
   - read_claude_md() - 读取内容
   - write_claude_md() - 写入内容
   - set_global_claude_md() - 设置全局
   - distribute_claude_md() - 分发到项目

4. 设计 Store 接口：
   - claudeMdStore 的 state 和 actions
   - 与现有 Store 的交互方式

5. 设计数据存储结构：
   - data.json 中的新增字段
   - ~/.ensemble/claude-md/ 目录结构

### 4.4 输出要求

将结果写入：`/Users/bo/Documents/Development/Ensemble/Ensemble2-claude-md-feature/docs/claude-md-feature/15-data-model-design.md`

输出格式：
```markdown
# 数据模型设计

## 一、TypeScript 类型定义
### 1.1 ClaudeMdFile
```typescript
interface ClaudeMdFile {
  ...
}
```

## 二、Rust 数据结构
### 2.1 ClaudeMdFile
```rust
#[derive(Debug, Serialize, Deserialize)]
pub struct ClaudeMdFile {
  ...
}
```

## 三、Rust 命令接口
### 3.1 scan_claude_md_files
```rust
#[tauri::command]
pub async fn scan_claude_md_files(...) -> Result<...> {
  ...
}
```

## 四、Store 设计
...

## 五、数据存储结构
...
```

### 4.5 参考文件

读取以下文件了解现有模式：
- `src/types/index.ts` - 现有类型定义
- `src-tauri/src/types.rs` - 现有 Rust 类型
- `src/stores/skillsStore.ts` - Store 模式参考

---

## 五、执行检查清单

### SubAgent A1 检查项
- [ ] 读取了所有 5 个页面节点
- [ ] 提取了完整的布局规范
- [ ] 提取了完整的颜色规范
- [ ] 提取了完整的字体规范
- [ ] 特别记录了角标系统细节
- [ ] 特别记录了 Set as Global 开关细节
- [ ] 输出文档格式规范

### SubAgent A2 检查项
- [ ] 分析了所有相关页面组件
- [ ] 分析了所有相关 Store
- [ ] 分析了 Rust 后端结构
- [ ] 确定了所有需要新增的文件
- [ ] 确定了所有需要修改的文件
- [ ] 提取了代码模式供参考
- [ ] 输出文档格式规范

### SubAgent A3 检查项
- [ ] 设计了完整的 TypeScript 类型
- [ ] 设计了完整的 Rust 数据结构
- [ ] 设计了所有 Rust 命令接口
- [ ] 设计了 Store 的完整接口
- [ ] 设计了数据存储结构
- [ ] 考虑了与现有系统的兼容性
- [ ] 输出文档格式规范

---

*文档版本: 1.0*
*创建时间: 2026-02-04*
