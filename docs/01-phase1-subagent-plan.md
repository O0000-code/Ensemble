# Phase 1: 信息收集阶段 - SubAgent 执行规划

## 阶段目标
收集所有必要的设计和技术信息，为后续开发提供完整的参考依据。

---

## SubAgent 任务分配

### SubAgent 1: 设计稿整体结构分析
**任务**：读取设计稿，获取所有页面的 Node ID 和基本结构信息

**输入**：
- 设计稿路径：`/Users/bo/Downloads/MCP 管理.pen`

**操作步骤**：
1. 使用 `mcp__pencil__batch_get` 获取设计稿顶层结构
2. 识别所有 19 个页面/组件的 Node ID
3. 记录每个页面的名称、尺寸、布局类型

**输出**：
- 文档路径：`/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/design/01-page-structure.md`

---

### SubAgent 2: Sidebar 设计详情提取
**任务**：提取 Sidebar 的完整设计规范

**输入**：
- 设计稿路径：`/Users/bo/Downloads/MCP 管理.pen`
- 需要分析的页面：Skills 列表页 (rPgYw)

**操作步骤**：
1. 使用 `mcp__pencil__batch_get` 读取 Sidebar 部分的详细结构
2. 提取所有样式信息：颜色、字体、间距、圆角
3. 截图验证

**输出**：
- 文档路径：`/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/design/02-sidebar-design.md`

---

### SubAgent 3: Skills 页面设计详情提取
**任务**：提取 Skills 相关页面的完整设计规范

**输入**：
- 设计稿路径：`/Users/bo/Downloads/MCP 管理.pen`
- 需要分析的 Node IDs：
  - Skills 列表 (rPgYw)
  - Skills 空状态 (DqVji)
  - Skills 按分类筛选 (xzUxa)
  - Skills 按标签筛选 (vjc0x)
  - Skill 详情 (nNy4r)

**操作步骤**：
1. 逐一读取每个页面的详细结构
2. 提取列表项、详情面板的完整样式
3. 截图每个状态

**输出**：
- 文档路径：`/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/design/03-skills-design.md`

---

### SubAgent 4: MCP Servers 页面设计详情提取
**任务**：提取 MCP Servers 相关页面的完整设计规范

**输入**：
- 设计稿路径：`/Users/bo/Downloads/MCP 管理.pen`
- 需要分析的 Node IDs：
  - MCP Servers 列表 (hzMDi)
  - MCP Servers 空状态 (h1E7V)
  - MCP 详情 (ltFNv)

**操作步骤**：
1. 逐一读取每个页面的详细结构
2. 提取与 Skills 页面的差异点
3. 截图每个状态

**输出**：
- 文档路径：`/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/design/04-mcp-design.md`

---

### SubAgent 5: Scenes 页面设计详情提取
**任务**：提取 Scenes 相关页面的完整设计规范

**输入**：
- 设计稿路径：`/Users/bo/Downloads/MCP 管理.pen`
- 需要分析的 Node IDs：
  - Scenes 列表 (M7mYr)
  - Scenes 空状态 (v7TIk)
  - Scene 详情 (LlxKB)
  - 新建 Scene 模态框 (Ek3cB)

**操作步骤**：
1. 逐一读取每个页面的详细结构
2. 特别关注新建 Scene 模态框的三栏布局
3. 截图每个状态

**输出**：
- 文档路径：`/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/design/05-scenes-design.md`

---

### SubAgent 6: Projects 页面设计详情提取
**任务**：提取 Projects 相关页面的完整设计规范

**输入**：
- 设计稿路径：`/Users/bo/Downloads/MCP 管理.pen`
- 需要分析的 Node IDs：
  - Projects 列表 (y0Mt4)
  - Projects 空状态 (F1YbB)
  - 新建 Project (cdnEv)

**操作步骤**：
1. 逐一读取每个页面的详细结构
2. 提取配置面板的完整样式
3. 截图每个状态

**输出**：
- 文档路径：`/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/design/06-projects-design.md`

---

### SubAgent 7: Settings 页面设计详情提取
**任务**：提取 Settings 页面的完整设计规范

**输入**：
- 设计稿路径：`/Users/bo/Downloads/MCP 管理.pen`
- 需要分析的 Node ID：Settings (qSzzi)

**操作步骤**：
1. 读取 Settings 页面的详细结构
2. 提取所有 Section 的样式
3. 截图

**输出**：
- 文档路径：`/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/design/07-settings-design.md`

---

### SubAgent 8: 通用组件设计详情提取
**任务**：提取通用组件的完整设计规范

**输入**：
- 设计稿路径：`/Users/bo/Downloads/MCP 管理.pen`
- 需要分析的 Node IDs：
  - 分类下拉 (weNqA)
  - 标签下拉 (moMFu)
  - 分类右键菜单 (v4ije)

**操作步骤**：
1. 逐一读取每个组件的详细结构
2. 提取所有变体状态的样式
3. 截图每个状态

**输出**：
- 文档路径：`/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/design/08-components-design.md`

---

### SubAgent 9: Claude Code 目录结构分析
**任务**：分析 Claude Code 的本地目录结构，理解 Skills 和 MCP 的存储方式

**输入**：
- Claude Code 配置目录：`~/.claude/`

**操作步骤**：
1. 列出 ~/.claude/ 目录结构
2. 分析 skills 目录下的 SKILL.md 文件格式
3. 分析 MCP 配置文件格式
4. 理解现有的配置结构

**注意**：只读取，不修改任何内容

**输出**：
- 文档路径：`/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/reference/01-claude-code-structure.md`

---

## 执行顺序

**第一批（并行执行）**：
- SubAgent 1: 设计稿整体结构分析（必须首先完成，为其他提供 Node ID 确认）

**第二批（并行执行，依赖第一批完成）**：
- SubAgent 2-8: 各页面设计详情提取
- SubAgent 9: Claude Code 目录结构分析

---

## SubAgent 通用要求

1. **模型**：必须使用 Opus 4.5
2. **输出格式**：所有结果必须写入指定的 md 文档
3. **截图**：使用 `mcp__pencil__get_screenshot` 截取页面，并在文档中描述截图内容
4. **样式记录**：必须记录完整的样式信息，包括：
   - 颜色值（hex 格式）
   - 字体大小（px）
   - 字重
   - 间距（padding, margin, gap）
   - 圆角（border-radius）
   - 边框（border）
   - 阴影（shadow）
