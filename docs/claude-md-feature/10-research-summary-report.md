# Claude.md 功能集成 - 研究总结报告

> 创建时间: 2026-02-04
> 状态: 等待用户确认

---

## 一、研究成果概览

### 1.1 完成的研究工作

| 研究维度 | 完成状态 | 文档位置 |
|---------|---------|----------|
| Claude.md 官方规范 | ✅ 完成 | `04-claudemd-spec-research.md` |
| 插件结构分析 | ✅ 完成 | `05-plugin-structure-analysis.md` |
| 现有代码分析 | ✅ 完成 | `06-existing-code-analysis.md` |
| Claude Code Guide 研究 | ✅ 完成 | `07-claude-code-guide-research.md` |
| 功能设计方案 | ✅ 完成 | `09-feature-design-proposal.md` |

### 1.2 研究方法

- 使用 claude-code-guide skill 查询官方文档
- 通过 WebFetch 获取 Claude Code 官方文档
- 分析本地文件系统（`~/.claude/` 目录结构）
- 分析 Ensemble 现有代码实现

---

## 二、Claude.md 核心发现

### 2.1 配置层级体系（6层）

```
优先级从高到低：

1. 托管策略级（Managed Policy）
   └── macOS: /Library/Application Support/ClaudeCode/CLAUDE.md
   └── 组织级强制指令，无法被覆盖

2. 用户级（User Scope）
   └── ~/.claude/CLAUDE.md
   └── 个人偏好，适用于所有项目

3. 用户规则（User Rules）
   └── ~/.claude/rules/*.md
   └── 模块化的个人规则

4. 项目级（Project Scope）
   └── ./CLAUDE.md 或 ./.claude/CLAUDE.md（两种路径均支持）
   └── 团队共享的项目指令

5. 项目规则（Project Rules）
   └── ./.claude/rules/*.md
   └── 模块化项目指令，支持条件加载

6. 本地级（Local Scope）
   └── ./CLAUDE.local.md
   └── 个人项目覆盖，自动 gitignore
```

### 2.2 关键技术特性

| 特性 | 说明 |
|------|------|
| **文件格式** | 标准 Markdown，无需 Frontmatter |
| **命名规则** | 必须大写 CLAUDE（大小写敏感） |
| **合并规则** | **内容合并（拼接），非替换** |
| **加载时机** | 会话启动时自动加载 |
| **导入语法** | 支持 `@path/to/file` 语法引用其他文件 |
| **长度限制** | 无硬限制，但建议简洁（影响上下文消耗） |

### 2.3 与 Skill 的本质区别

| 特性 | CLAUDE.md | Skills |
|------|-----------|--------|
| 加载时机 | **每次会话启动** | 按需加载 |
| 上下文消耗 | **持续占用** | 仅调用时 |
| 适用场景 | 广泛适用的规则 | 特定场景的知识/工作流 |
| Frontmatter | 不需要 | 需要 |

**官方建议**：Claude.md 每次会话都加载，只放广泛适用的内容。特定场景知识应使用 Skills。

---

## 三、设计方案核心

### 3.1 功能范围

**本次实现**：
1. Claude.md 与 Scene 的关联和分发
2. 用户级 Claude.md 的读取和显示
3. Scene 分发时的冲突处理

**暂不实现**：
- 托管策略级 Claude.md（需管理员权限）
- 项目规则文件（`.claude/rules/*.md`）的管理
- 独立的 Claude.md 管理页面

### 3.2 数据模型扩展

```typescript
// Scene 接口扩展
interface Scene {
  id: string;
  name: string;
  description: string;
  icon: string;
  skillIds: string[];
  mcpIds: string[];
  createdAt: string;
  lastUsed?: string;
  // 新增字段
  claudeMdContent?: string;  // Scene 的 Claude.md 内容
}
```

### 3.3 分发策略

**推荐策略**：`copy`（复制）

理由：
1. 独立性 - 复制后项目的 Claude.md 独立于 Ensemble
2. 版本控制 - 可被 git 追踪，便于团队协作
3. 简单可靠 - 避免 symlink 的路径问题
4. 符合官方设计 - Claude.md 本就设计为独立文件

**冲突处理**：
- `overwrite` - 覆盖现有内容
- `append` - 在现有内容后追加（带分隔标记）
- `skip` - 保持现有文件不变
- `ask` - 默认行为，弹窗询问用户

### 3.4 UI 集成位置

**方案：集成到 Scene 详情/编辑页**

```
Scene 创建/编辑 Modal
├── 基本信息（名称、描述、图标）
├── Skills 选择（标签页 1）
├── MCPs 选择（标签页 2）
├── Claude.md 编辑（标签页 3）★ 新增
│   ├── Markdown 文本编辑区
│   ├── 字符数统计
│   └── 分发策略选项
└── 操作按钮
```

理由：
- Claude.md 主要与 Scene 分发关联
- 减少导航复杂度
- 与现有 Skills/MCPs 选择器并列，保持一致性

### 3.5 新增 Rust 命令

```rust
// 需要新增的 Tauri 命令
read_claude_md(path: String) -> ClaudeMdFile
write_claude_md(path: String, content: String) -> ()
detect_project_claude_md(project_path: String) -> ClaudeMdFile
distribute_claude_md(project_path, content, strategy, conflict_resolution) -> ClaudeMdDistributionResult
```

---

## 四、实施计划

### 4.1 阶段划分

**Phase 1: 核心数据模型**
- Scene 接口扩展（添加 claudeMdContent 字段）
- TypeScript 类型定义
- Rust 数据结构更新
- data.json 格式兼容

**Phase 2: Rust 后端**
- 实现 4 个 Claude.md 相关命令
- 集成到 sync_project_config

**Phase 3: 前端 UI**
- CreateSceneModal 添加 Claude.md 标签页
- ClaudeMdEditor 组件
- SceneDetailPanel 显示 Claude.md
- 冲突处理对话框

**Phase 4: 集成测试**
- 端到端测试
- 边界情况验证
- 视觉验证

### 4.2 技术实现要点

1. **Git Worktree 隔离**
   - 创建独立 worktree 进行开发
   - 确保不影响 main 分支现有功能
   - 完成验证后再合并

2. **向后兼容**
   - 新增字段使用 Optional 类型
   - 读取旧数据时自动处理缺失字段
   - 不破坏现有 Scene 数据

3. **UI 一致性**
   - 复用现有组件样式
   - 保持与设计稿一致的视觉风格
   - 标签页切换动画平滑

---

## 五、决策确认点

### 5.1 需要用户确认的决策

1. **分发策略默认值**
   - 当前方案：默认使用 `copy`（复制）
   - 备选方案：默认使用 `symlink`（符号链接）
   - ❓ 是否同意使用 copy 作为默认策略？

2. **冲突处理默认行为**
   - 当前方案：默认 `ask`（询问用户）
   - 备选方案：默认 `append`（追加）
   - ❓ 是否同意默认询问用户？

3. **UI 集成位置**
   - 当前方案：集成到 Scene 创建/编辑 Modal 的第三个标签页
   - 备选方案：创建独立的 Claude.md 管理页面
   - ❓ 是否同意集成到 Scene Modal？

4. **用户级 Claude.md 管理**
   - 当前方案：暂不在 UI 中提供用户级 Claude.md 编辑功能
   - 备选方案：在 Settings 页面添加编辑区域
   - ❓ 是否需要用户级 Claude.md 编辑功能？

5. **项目规则文件支持**
   - 当前方案：暂不支持 `.claude/rules/*.md`
   - 备选方案：在后续版本添加支持
   - ❓ 是否同意暂不支持规则文件？

### 5.2 不需要确认的决策（已根据研究确定）

- ✅ Claude.md 内容存储在 data.json 的 scene.claudeMdContent 字段
- ✅ 使用标准 Markdown 格式，无需 Frontmatter
- ✅ 分发目标路径为 `{project}/.claude/CLAUDE.md`
- ✅ 追加时使用 `<!-- Added by Ensemble Scene: {name} -->` 标记

---

## 六、风险和注意事项

### 6.1 潜在风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 现有 Scene 数据不兼容 | 数据丢失 | 使用 Optional 字段，向后兼容 |
| Claude.md 内容过长 | UI 性能下降 | 添加字符数警告（建议 <2000 字符） |
| 冲突处理用户体验 | 用户困惑 | 清晰的对话框提示和预览 |
| Git Worktree 合并冲突 | 开发延误 | 小步提交，频繁同步 |

### 6.2 不处理的场景

- 托管策略级 CLAUDE.md（系统级，需管理员权限）
- 项目规则文件（`.claude/rules/*.md`）
- 目录级 CLAUDE.md（monorepo 子目录）
- 本地级 CLAUDE.local.md（用户个人配置）

---

## 七、总结

### 7.1 核心要点

1. **Claude.md 是 Claude Code 的记忆系统**，每次会话启动时加载
2. **支持多层级配置**，内容合并而非替换
3. **设计方案聚焦于 Scene 关联**，将 Claude.md 作为 Scene 的一部分进行分发
4. **使用 copy 策略分发**，保持项目独立性和版本控制兼容性
5. **集成到现有 UI**，避免增加导航复杂度

### 7.2 预期成果

完成本功能后，Ensemble 将能够：
- 在 Scene 中配置 Claude.md 内容
- 将 Scene 的 Claude.md 分发到项目
- 智能处理与现有 Claude.md 的冲突
- 完整管理 Claude Code 的"三件套"：Skills、MCPs、Claude.md

### 7.3 下一步

等待用户确认以下内容后开始实施：
1. 确认上述 5 个决策点
2. 确认实施计划和阶段划分
3. 确认技术实现要点

---

*报告版本: 1.0*
*创建时间: 2026-02-04*
