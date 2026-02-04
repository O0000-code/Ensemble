# Claude.md 功能实现 - 总体执行计划

> 创建时间: 2026-02-04
> 状态: 执行中
> Git Worktree: Ensemble2-claude-md-feature

---

## 一、功能需求确认

### 1.1 核心功能

1. **全局扫描** - 扫描系统中所有 CLAUDE.md 文件
   - 本地级: `./CLAUDE.local.md`
   - 项目级: `./CLAUDE.md` 或 `./.claude/CLAUDE.md`
   - 用户级: `~/.claude/CLAUDE.md`

2. **复制导入** - 将扫描到的文件复制到 `~/.ensemble/claude-md/` 管理

3. **Scene 规划** - 在 Scene 中选择要分发的 CLAUDE.md（排除全局的）

4. **分发到项目** - 将选中的 CLAUDE.md 复制到项目
   - 可选路径（Settings 配置）：
     - `./.claude/CLAUDE.md`（默认）
     - `./CLAUDE.md`
     - `./CLAUDE.local.md`

5. **设置全局** - 将某个 CLAUDE.md 设为全局（`~/.claude/CLAUDE.md`）
   - 只能有一个全局
   - 切换时备份原有全局文件

### 1.2 UI 页面

| 页面 | 节点 ID | 说明 |
|------|---------|------|
| 列表页 | P3AWE | CLAUDE.md 文件列表 |
| 空状态页 | 6zwvB | 无文件时的状态 |
| 导入弹窗 | oc4RY | 导入新的 CLAUDE.md |
| 详情页 | 26KVC | 文件详情，含 Set as Global 开关 |
| Settings | qSzzi | 新增 Distribution Path 设置 |

### 1.3 角标系统

- Global → 紫色 #7C3AED + globe 图标
- Project → 青色 #0EA5E9 + folder 图标
- Local → 橙色 #F59E0B + user 图标

---

## 二、SubAgent 执行计划

### 第一批（并行）- 基础研究

| SubAgent | 任务 | 依赖 | 输出文档 |
|----------|------|------|----------|
| A1 | 设计稿详细分析 | 无 | 12-design-spec-analysis.md |
| A2 | 现有代码结构分析 | 无 | 13-code-structure-analysis.md |
| A3 | 数据模型设计 | 无 | 14-data-model-design.md |

### 第二批（依赖第一批）- 后端实现

| SubAgent | 任务 | 依赖 | 输出 |
|----------|------|------|------|
| B1 | Rust 后端命令实现 | A3 | src-tauri/src/commands/claude_md.rs |
| B2 | TypeScript 类型和 Store | A3 | src/stores/claudeMdStore.ts |

### 第三批（依赖第一、二批）- 前端实现

| SubAgent | 任务 | 依赖 | 输出 |
|----------|------|------|------|
| C1 | 通用组件实现 | A1 | ClaudeMdCard, ClaudeMdBadge 等 |
| C2 | 列表页和空状态页 | A1, C1 | ClaudeMdPage.tsx |
| C3 | 详情页实现 | A1, C1 | ClaudeMdDetailPanel.tsx |
| C4 | 导入弹窗实现 | A1, C1 | ImportClaudeMdModal.tsx |
| C5 | Settings 页面修改 | A1 | SettingsPage.tsx 修改 |
| C6 | Scene Modal 集成 | A1 | CreateSceneModal.tsx 修改 |

### 第四批（依赖前三批）- 集成测试

| SubAgent | 任务 | 依赖 | 输出 |
|----------|------|------|------|
| D1 | 端到端集成 | B1, B2, C1-C6 | 路由、导航、数据流 |
| D2 | 视觉验证 | D1 | 截图对比报告 |

---

## 三、文件结构规划

### 3.1 新增文件

```
src/
├── components/
│   └── claude-md/
│       ├── ClaudeMdCard.tsx          # 列表卡片
│       ├── ClaudeMdBadge.tsx         # 类型角标
│       ├── ClaudeMdDetailPanel.tsx   # 详情面板
│       ├── ImportClaudeMdModal.tsx   # 导入弹窗
│       └── ClaudeMdList.tsx          # 列表组件
├── pages/
│   └── ClaudeMdPage.tsx              # 列表页面
├── stores/
│   └── claudeMdStore.ts              # 状态管理
└── types/
    └── claudeMd.ts                   # 类型定义

src-tauri/src/
├── commands/
│   └── claude_md.rs                  # Rust 命令
└── lib.rs                            # 注册命令

~/.ensemble/
└── claude-md/                        # CLAUDE.md 源文件存储
    ├── global-backup/                # 全局文件备份
    └── managed/                      # 被管理的文件
```

### 3.2 修改文件

```
src/
├── App.tsx                           # 添加路由
├── components/
│   ├── Sidebar.tsx                   # 添加导航项
│   ├── scenes/
│   │   └── CreateSceneModal.tsx      # 添加 CLAUDE.md 标签页
│   └── settings/
│       └── SettingsPage.tsx          # 添加 Distribution Path
└── types/
    └── index.ts                      # 添加类型导出
```

---

## 四、数据模型概要

### 4.1 ClaudeMdFile 接口

```typescript
interface ClaudeMdFile {
  id: string;                    // 唯一标识
  name: string;                  // 显示名称
  sourcePath: string;            // 原始路径
  managedPath: string;           // 管理后的路径
  content: string;               // 文件内容
  type: 'global' | 'project' | 'local';  // 类型
  isGlobal: boolean;             // 是否设为全局
  category?: string;             // 分类
  tags: string[];                // 标签
  createdAt: string;
  updatedAt: string;
}
```

### 4.2 Scene 扩展

```typescript
interface Scene {
  // ... 现有字段
  claudeMdIds: string[];         // 关联的 CLAUDE.md ID 列表
}
```

### 4.3 Settings 扩展

```typescript
interface AppSettings {
  // ... 现有字段
  claudeMdDistributionPath: '.claude/CLAUDE.md' | 'CLAUDE.md' | 'CLAUDE.local.md';
}
```

---

## 五、关键技术点

### 5.1 全局扫描策略

- 使用 Rust 的 walkdir 库进行高效遍历
- 限制扫描深度（建议 5-10 层）
- 排除 node_modules、.git 等目录
- 并行扫描提升性能

### 5.2 全局切换逻辑

```
设置某个 CLAUDE.md 为全局：
1. 读取当前 ~/.claude/CLAUDE.md
2. 如果存在且非当前管理的文件：
   a. 备份到 ~/.ensemble/claude-md/global-backup/
   b. 导入到管理文件夹（如果未导入）
3. 将原全局文件的 isGlobal 设为 false
4. 将新文件复制到 ~/.claude/CLAUDE.md
5. 将新文件的 isGlobal 设为 true
```

### 5.3 Scene 分发限制

- isGlobal = true 的文件不能参与 Scene 分发
- UI 中显示但禁用这些文件

---

## 六、质量标准

1. **视觉还原** - 与设计稿 1:1 匹配
2. **功能完整** - 所有功能点均实现
3. **性能要求** - 全局扫描 < 5 秒
4. **不影响现有功能** - 原有功能保持正常
5. **代码质量** - 类型完整，无 console 错误

---

## 七、执行时间线

- 第一批 SubAgent：设计分析和数据模型（并行）
- 第二批 SubAgent：后端和类型实现（依赖第一批）
- 第三批 SubAgent：前端组件实现（并行，依赖前两批）
- 第四批 SubAgent：集成和验证（依赖全部）

---

*文档版本: 1.0*
*创建时间: 2026-02-04*
