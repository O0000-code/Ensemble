# 预设演示数据设计

## 文档信息
- 日期: 2026-02-05
- 作者: SubAgent E
- 目的: 设计用于截图展示的预设演示数据

---

## 一、执行摘要

本文档设计了 Ensemble 应用的预设演示数据，包括：
- **10 个预设 Skills** - 覆盖文档处理、开发工具、自动化等主要场景
- **8 个预设 MCP Servers** - 包含官方参考服务器和常用第三方服务器
- **7 个预设 Categories** - 合理的分类体系
- **18 个预设 Tags** - 实用的标签系统
- **4 个预设 Scenes** - 覆盖不同使用场景
- **3 个预设 CLAUDE.md** - 展示不同类型的配置文件

这些数据选自真实的 Claude Code 生态系统，确保演示内容专业、实用、易于理解。

---

## 二、数据来源与研究依据

### 2.1 Skills 数据来源
- [Anthropic Official Skills Repository](https://github.com/anthropics/skills) - 官方技能库
- [awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills) - 社区精选技能
- [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) - 200+ 技能收集

### 2.2 MCP Servers 数据来源
- [Model Context Protocol Servers](https://github.com/modelcontextprotocol/servers) - 官方 MCP 服务器
- [MCP Servers Directory](https://mcpservers.org/) - 社区目录
- [MCP Registry](https://modelcontextprotocol.io/examples) - 官方注册表

---

## 三、预设 Skills 列表

| # | 名称 | 描述 | 分类 | 标签 | 图标 |
|---|------|------|------|------|------|
| 1 | **pdf** | Comprehensive PDF manipulation toolkit for extracting text, tables, creating, merging and splitting documents | Documents | `official`, `file-handling` | `file-text` |
| 2 | **docx** | Create, edit, and analyze Word documents with tracked changes support | Documents | `official`, `file-handling` | `file-type` |
| 3 | **xlsx** | Create and analyze Excel spreadsheets with formula and formatting support | Documents | `official`, `data-analysis` | `table` |
| 4 | **pptx** | Create and edit PowerPoint presentations with layout and template support | Documents | `official`, `productivity` | `presentation` |
| 5 | **frontend-design** | Avoid generic aesthetics; works well with React and Tailwind CSS for professional UI | Development | `ui-ux`, `react`, `tailwind` | `palette` |
| 6 | **webapp-testing** | Test local web applications using Playwright for UI verification | Development | `testing`, `automation` | `test-tube` |
| 7 | **mcp-builder** | Guide for creating high-quality MCP servers for API integration | Development | `mcp`, `api` | `server` |
| 8 | **skill-creator** | Interactive Q&A tool for building new Claude Code skills | Utilities | `official`, `meta` | `wand` |
| 9 | **brand-guidelines** | Apply official brand colors and typography to artifacts | Creative | `design`, `branding` | `brush` |
| 10 | **playwright-skill** | General-purpose browser automation for web scraping and testing | Automation | `browser`, `automation` | `globe` |

### Skills 数据结构示例 (JSON)

```json
{
  "id": "skill-pdf",
  "name": "pdf",
  "description": "Comprehensive PDF manipulation toolkit for extracting text, tables, creating, merging and splitting documents",
  "category": "Documents",
  "tags": ["official", "file-handling"],
  "enabled": true,
  "scope": "global",
  "icon": "file-text",
  "instructions": "# PDF Skill\n\nThis skill enables comprehensive PDF manipulation...",
  "invocation": "/pdf",
  "usageCount": 42,
  "createdAt": "2026-01-15T10:00:00Z"
}
```

---

## 四、预设 MCP Servers 列表

| # | 名称 | 描述 | 分类 | 提供的工具 | 图标 |
|---|------|------|------|------------|------|
| 1 | **Filesystem** | Secure file operations with configurable access controls | File System | `read_file`, `write_file`, `list_directory`, `move_file`, `search_files` | `folder` |
| 2 | **Git** | Read, search, and manipulate Git repositories | Development | `git_status`, `git_log`, `git_diff`, `git_commit`, `git_branch` | `git-branch` |
| 3 | **Memory** | Knowledge graph-based persistent memory system | AI & Memory | `store_memory`, `retrieve_memory`, `search_memory`, `list_entities` | `brain` |
| 4 | **Fetch** | Web content fetching and conversion for efficient LLM usage | Web | `fetch_url`, `fetch_html`, `convert_to_markdown` | `globe` |
| 5 | **PostgreSQL** | Connect to PostgreSQL databases for queries and analysis | Database | `query`, `list_tables`, `describe_table`, `execute_sql` | `database` |
| 6 | **SQLite** | Lightweight database operations for local data storage | Database | `query`, `execute`, `list_tables`, `create_table` | `database` |
| 7 | **Slack** | Channel management and messaging integration | Communication | `send_message`, `list_channels`, `search_messages`, `get_users` | `message-square` |
| 8 | **GitHub** | Repository management and API integration | Development | `create_issue`, `list_repos`, `get_file`, `create_pr`, `search_code` | `github` |

### MCP Server 数据结构示例 (JSON)

```json
{
  "id": "mcp-filesystem",
  "name": "Filesystem",
  "description": "Secure file operations with configurable access controls",
  "category": "File System",
  "tags": ["official", "file-handling"],
  "enabled": true,
  "scope": "global",
  "icon": "folder",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/dir"],
  "providedTools": [
    {"name": "read_file", "description": "Read contents of a file"},
    {"name": "write_file", "description": "Write content to a file"},
    {"name": "list_directory", "description": "List files in a directory"},
    {"name": "move_file", "description": "Move or rename a file"},
    {"name": "search_files", "description": "Search for files by pattern"}
  ],
  "usageCount": 128,
  "createdAt": "2026-01-10T08:00:00Z"
}
```

---

## 五、预设 Categories 体系

| # | 名称 | 颜色 | 说明 | 适用资源 |
|---|------|------|------|----------|
| 1 | **Documents** | `#3B82F6` (Blue) | 文档处理相关 | Skills, CLAUDE.md |
| 2 | **Development** | `#10B981` (Green) | 开发工具相关 | Skills, MCPs |
| 3 | **Database** | `#8B5CF6` (Purple) | 数据库操作相关 | MCPs |
| 4 | **Web** | `#F59E0B` (Amber) | 网络和浏览器相关 | Skills, MCPs |
| 5 | **Automation** | `#EF4444` (Red) | 自动化和脚本相关 | Skills, MCPs |
| 6 | **Creative** | `#EC4899` (Pink) | 创意和设计相关 | Skills, CLAUDE.md |
| 7 | **Utilities** | `#6B7280` (Gray) | 通用工具 | Skills, MCPs |

### Categories 数据结构示例 (JSON)

```json
[
  {"id": "cat-documents", "name": "Documents", "color": "#3B82F6", "count": 4},
  {"id": "cat-development", "name": "Development", "color": "#10B981", "count": 5},
  {"id": "cat-database", "name": "Database", "color": "#8B5CF6", "count": 2},
  {"id": "cat-web", "name": "Web", "color": "#F59E0B", "count": 2},
  {"id": "cat-automation", "name": "Automation", "color": "#EF4444", "count": 1},
  {"id": "cat-creative", "name": "Creative", "color": "#EC4899", "count": 1},
  {"id": "cat-utilities", "name": "Utilities", "color": "#6B7280", "count": 1}
]
```

---

## 六、预设 Tags 体系

| # | 标签名 | 说明 | 适用场景 |
|---|--------|------|----------|
| 1 | `official` | 官方提供的资源 | Anthropic 官方 Skills/MCPs |
| 2 | `community` | 社区贡献的资源 | 第三方 Skills/MCPs |
| 3 | `file-handling` | 文件处理相关 | PDF, DOCX, Filesystem |
| 4 | `data-analysis` | 数据分析相关 | Excel, Database |
| 5 | `productivity` | 提升生产力 | PPT, 自动化工具 |
| 6 | `ui-ux` | UI/UX 设计相关 | Frontend 设计技能 |
| 7 | `react` | React 开发相关 | 前端开发 |
| 8 | `tailwind` | Tailwind CSS 相关 | 样式开发 |
| 9 | `testing` | 测试相关 | Playwright, 自动化测试 |
| 10 | `automation` | 自动化相关 | 脚本、自动化任务 |
| 11 | `mcp` | MCP 相关 | MCP 开发和集成 |
| 12 | `api` | API 相关 | API 集成和开发 |
| 13 | `browser` | 浏览器相关 | 浏览器自动化 |
| 14 | `design` | 设计相关 | 品牌、UI 设计 |
| 15 | `branding` | 品牌相关 | 品牌规范 |
| 16 | `meta` | 元工具 | 用于创建其他工具 |
| 17 | `database` | 数据库相关 | PostgreSQL, SQLite |
| 18 | `git` | Git 版本控制相关 | Git 操作 |

### Tags 数据结构示例 (JSON)

```json
[
  {"id": "tag-official", "name": "official", "count": 6},
  {"id": "tag-community", "name": "community", "count": 4},
  {"id": "tag-file-handling", "name": "file-handling", "count": 3},
  {"id": "tag-data-analysis", "name": "data-analysis", "count": 2},
  {"id": "tag-productivity", "name": "productivity", "count": 2},
  {"id": "tag-ui-ux", "name": "ui-ux", "count": 1},
  {"id": "tag-react", "name": "react", "count": 1},
  {"id": "tag-tailwind", "name": "tailwind", "count": 1},
  {"id": "tag-testing", "name": "testing", "count": 2},
  {"id": "tag-automation", "name": "automation", "count": 2},
  {"id": "tag-mcp", "name": "mcp", "count": 1},
  {"id": "tag-api", "name": "api", "count": 1},
  {"id": "tag-browser", "name": "browser", "count": 1},
  {"id": "tag-design", "name": "design", "count": 1},
  {"id": "tag-branding", "name": "branding", "count": 1},
  {"id": "tag-meta", "name": "meta", "count": 1},
  {"id": "tag-database", "name": "database", "count": 2},
  {"id": "tag-git", "name": "git", "count": 1}
]
```

---

## 七、预设 Scenes 示例

### Scene 1: Frontend Development (前端开发)
| 属性 | 值 |
|------|-----|
| **名称** | Frontend Development |
| **描述** | Complete setup for React/Tailwind frontend development with testing |
| **图标** | `code` |
| **包含 Skills** | frontend-design, webapp-testing |
| **包含 MCPs** | Filesystem, Git, GitHub |
| **包含 CLAUDE.md** | React Project Guidelines |

### Scene 2: Data Analysis (数据分析)
| 属性 | 值 |
|------|-----|
| **名称** | Data Analysis |
| **描述** | Tools for working with spreadsheets, databases, and data processing |
| **图标** | `bar-chart` |
| **包含 Skills** | xlsx, pdf |
| **包含 MCPs** | PostgreSQL, SQLite, Filesystem |
| **包含 CLAUDE.md** | Data Analysis Standards |

### Scene 3: Document Processing (文档处理)
| 属性 | 值 |
|------|-----|
| **名称** | Document Processing |
| **描述** | Full suite for creating and editing Office documents |
| **图标** | `file-stack` |
| **包含 Skills** | pdf, docx, xlsx, pptx |
| **包含 MCPs** | Filesystem |
| **包含 CLAUDE.md** | (无) |

### Scene 4: Full Stack Development (全栈开发)
| 属性 | 值 |
|------|-----|
| **名称** | Full Stack Development |
| **描述** | Comprehensive tools for full stack web development |
| **图标** | `layers` |
| **包含 Skills** | frontend-design, webapp-testing, mcp-builder |
| **包含 MCPs** | Filesystem, Git, GitHub, PostgreSQL, Fetch |
| **包含 CLAUDE.md** | React Project Guidelines |

### Scenes 数据结构示例 (JSON)

```json
{
  "id": "scene-frontend",
  "name": "Frontend Development",
  "description": "Complete setup for React/Tailwind frontend development with testing",
  "icon": "code",
  "skillIds": ["skill-frontend-design", "skill-webapp-testing"],
  "mcpIds": ["mcp-filesystem", "mcp-git", "mcp-github"],
  "claudeMdIds": ["claudemd-react"],
  "createdAt": "2026-01-20T14:00:00Z"
}
```

---

## 八、预设 CLAUDE.md 示例

### CLAUDE.md 1: React Project Guidelines (React 项目指南)

**基本信息:**
| 属性 | 值 |
|------|-----|
| 名称 | React Project Guidelines |
| 描述 | Standard guidelines for React/TypeScript projects |
| 类型 | project |
| 是否全局 | 否 |
| 图标 | `code` |

**内容:**
```markdown
# React Project Guidelines

## Tech Stack
- React 18+ with TypeScript
- Tailwind CSS 4.x for styling
- Zustand for state management
- React Router 7.x for routing

## Code Standards
- Use functional components with hooks
- Prefer TypeScript strict mode
- Follow ESLint + Prettier configuration
- Write unit tests with Vitest

## File Structure
- Components in `src/components/`
- Pages in `src/pages/`
- Hooks in `src/hooks/`
- Types in `src/types/`

## Naming Conventions
- Components: PascalCase (e.g., `UserProfile.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useAuth.ts`)
- Utils: camelCase (e.g., `formatDate.ts`)
```

### CLAUDE.md 2: Data Analysis Standards (数据分析规范)

**基本信息:**
| 属性 | 值 |
|------|-----|
| 名称 | Data Analysis Standards |
| 描述 | Guidelines for data analysis and processing tasks |
| 类型 | project |
| 是否全局 | 否 |
| 图标 | `bar-chart` |

**内容:**
```markdown
# Data Analysis Standards

## Data Handling
- Always validate data before processing
- Use appropriate data types for columns
- Handle missing values explicitly
- Document data transformations

## SQL Guidelines
- Use parameterized queries to prevent injection
- Optimize queries for large datasets
- Add indexes for frequently queried columns
- Comment complex queries

## Output Format
- Export results in CSV or JSON format
- Include metadata (timestamp, row count, etc.)
- Provide summary statistics when relevant

## Security
- Never expose sensitive data in logs
- Mask PII in outputs
- Use read-only connections when possible
```

### CLAUDE.md 3: Global Preferences (全局偏好)

**基本信息:**
| 属性 | 值 |
|------|-----|
| 名称 | Global Preferences |
| 描述 | My global preferences for all Claude Code interactions |
| 类型 | global |
| 是否全局 | 是 |
| 图标 | `settings` |

**内容:**
```markdown
# Global Preferences

## Communication Style
- Be concise and direct
- Use technical terminology appropriately
- Provide code examples when helpful
- Explain trade-offs in technical decisions

## Code Preferences
- Prefer TypeScript over JavaScript
- Use modern ES6+ syntax
- Write self-documenting code
- Add comments for complex logic only

## Workflow
- Create small, focused commits
- Write descriptive commit messages
- Test changes before committing
- Keep PRs reasonably sized

## Response Format
- Use markdown formatting
- Include relevant file paths
- Show command examples when applicable
```

### CLAUDE.md 数据结构示例 (JSON)

```json
{
  "id": "claudemd-react",
  "name": "React Project Guidelines",
  "description": "Standard guidelines for React/TypeScript projects",
  "sourcePath": "~/.ensemble/claude-md/react-guidelines.md",
  "sourceType": "project",
  "content": "# React Project Guidelines\n\n## Tech Stack\n...",
  "isGlobal": false,
  "icon": "code",
  "tagIds": ["tag-react", "tag-development"],
  "size": 1024,
  "createdAt": "2026-01-18T09:00:00Z",
  "updatedAt": "2026-01-18T09:00:00Z"
}
```

---

## 九、数据设计理由说明

### 9.1 Skills 选择理由

1. **官方 Document Skills (pdf, docx, xlsx, pptx)**
   - 来自 Anthropic 官方仓库，权威性强
   - 覆盖最常见的办公文档场景
   - 展示 Ensemble 管理 "一套文档处理工具" 的能力

2. **开发类 Skills (frontend-design, webapp-testing, mcp-builder)**
   - 面向开发者用户群
   - 展示技术深度
   - 与 MCP Servers 形成互补

3. **自动化和工具类 (skill-creator, playwright-skill, brand-guidelines)**
   - 展示 Skills 的多样性
   - 包含 meta-skill (skill-creator) 体现生态完整性

### 9.2 MCP Servers 选择理由

1. **官方参考服务器 (Filesystem, Git, Memory, Fetch)**
   - 展示 MCP 核心能力
   - 稳定可靠，易于演示

2. **数据库服务器 (PostgreSQL, SQLite)**
   - 展示数据处理能力
   - 覆盖企业级和轻量级场景

3. **协作工具 (Slack, GitHub)**
   - 展示第三方集成能力
   - 贴近真实工作流程

### 9.3 Categories 设计理由

- **7 个分类**：足够细致但不冗余
- **颜色系统**：使用 Tailwind 调色板，视觉一致
- **覆盖面**：涵盖 Skills、MCPs、CLAUDE.md 的主要用途

### 9.4 Tags 设计理由

- **18 个标签**：提供足够的标记维度
- **层次分明**：
  - 来源标签：`official`, `community`
  - 功能标签：`file-handling`, `data-analysis`
  - 技术标签：`react`, `tailwind`, `database`
- **避免重复**：标签与分类互补而非重叠

### 9.5 Scenes 设计理由

- **4 个场景**：展示不同使用模式
- **组合多样**：
  - 纯 Skills 场景 (Document Processing)
  - 纯 MCPs 场景 (Data Analysis)
  - 混合场景 (Frontend, Full Stack)
- **实用性强**：覆盖前端、数据、文档、全栈四大场景

### 9.6 CLAUDE.md 设计理由

- **3 个示例**：展示不同类型
  - 项目级配置 (React Guidelines, Data Analysis)
  - 全局配置 (Global Preferences)
- **内容真实**：包含有意义的配置内容
- **结构清晰**：展示 Markdown 格式化能力

---

## 十、功能覆盖矩阵

| 功能 | 演示数据覆盖 |
|------|-------------|
| Skills 列表展示 | 10 个 Skills |
| Skills 分类筛选 | 6 个分类 |
| Skills 标签筛选 | 12+ 个标签 |
| Skills 详情展示 | 包含描述、指令、调用方式 |
| MCPs 列表展示 | 8 个 MCP Servers |
| MCPs 工具发现 | 每个 MCP 有 3-5 个工具 |
| MCPs 分类筛选 | 4 个分类 |
| Scenes 场景管理 | 4 个预设场景 |
| Scenes 组合展示 | 包含 Skills + MCPs + CLAUDE.md |
| CLAUDE.md 管理 | 3 个不同类型 |
| CLAUDE.md 全局设置 | 1 个全局文件 |
| Categories 管理 | 7 个分类 |
| Tags 管理 | 18 个标签 |
| AI 自动分类 | 数据已预分类 |

---

## 十一、实施建议

### 11.1 数据文件位置

演示数据应存储在以下位置：
- `~/.ensemble/data.json` - 主数据文件
- `~/.ensemble/skills/` - Skills 文件目录
- `~/.ensemble/mcps/` - MCPs 配置目录
- `~/.ensemble/claude-md/` - CLAUDE.md 文件目录

### 11.2 截图顺序建议

1. **Skills Page** - 展示 10 个 Skills，筛选 "Documents" 分类
2. **MCP Servers Page** - 展示 8 个 MCPs，选中 Filesystem 展示详情
3. **Scenes Page** - 展示 4 个场景，选中 "Frontend Development"
4. **CLAUDE.md Page** - 展示 3 个文件，展示全局标记
5. **Categories/Tags 侧边栏** - 展示分类和标签管理

### 11.3 配色一致性

所有分类颜色使用 Tailwind CSS 500 色阶：
- Blue: `#3B82F6`
- Green: `#10B981`
- Purple: `#8B5CF6`
- Amber: `#F59E0B`
- Red: `#EF4444`
- Pink: `#EC4899`
- Gray: `#6B7280`

---

## 参考来源

1. [Anthropic Skills Repository](https://github.com/anthropics/skills)
2. [awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills)
3. [Model Context Protocol Servers](https://github.com/modelcontextprotocol/servers)
4. [MCP Servers Directory](https://mcpservers.org/)
5. [Claude Code Documentation](https://code.claude.com/docs/en/skills)
6. [MCP Specification](https://modelcontextprotocol.io/specification/2025-11-25)
