# 批次 4-8: 模块页面开发 - SubAgent 执行规划

## 批次目标
并行开发 Skills、MCP Servers、Scenes、Projects、Settings 五个模块的所有页面。

---

## 设计规范参考文档
- `/docs/design/03-skills-design.md` - Skills 模块
- `/docs/design/04-mcp-design.md` - MCP 模块
- `/docs/design/05-scenes-design.md` - Scenes 模块
- `/docs/design/06-projects-design.md` - Projects 模块
- `/docs/design/07-settings-design.md` - Settings 模块

---

## 通用组件路径
- `/src/components/common/` - Toggle, Badge, Button, Input, SearchInput, Dropdown, etc.
- `/src/components/layout/` - Sidebar, MainLayout, ListDetailLayout, PageHeader

---

## SubAgent A: Skills 模块

### 需要创建的文件
1. `src/components/skills/SkillItem.tsx` - Skill 列表项组件
2. `src/pages/SkillsPage.tsx` - Skills 列表页
3. `src/pages/SkillDetailPage.tsx` - Skill 详情页
4. `src/stores/skillsStore.ts` - Skills 状态管理

### SkillItem 规范
```
主列表版本:
  - padding: 14px 16px, radius: 8px, border: 1px #E5E5E5
  - 左侧: Icon 容器 36x36, radius 6px, bg #FAFAFA, icon 18x18 #52525B
  - 中间: Name (13px/500 #18181B) + Description (12px/normal #71717A, max-width 500px, truncate)
  - 右侧: Category Badge + Tags (最多2个) + Toggle

侧边列表版本 (详情页):
  - padding: 12px 14px, radius: 6px
  - Icon 容器 32x32
  - 无 Tags，简化显示
  - Selected: bg #FAFAFA, Name 600 weight
```

### SkillsPage 规范
```
使用 PageHeader:
  - Title: "Skills"
  - Badge: "● 42 enabled" (status variant)
  - Search: 220px
  - Action: "Auto Classify" button (secondary, with Sparkles icon)

Content:
  - padding: 24px 28px, gap: 16px
  - SkillItem 列表

空状态:
  - EmptyState 组件
  - Icon: Sparkles (48x48, #D4D4D8)
  - Title: "No Skills"
  - Description: "Add skills to your collection..."
```

### SkillDetailPage 规范
```
使用 ListDetailLayout (listWidth: 380):

List Panel:
  - Header: "Skills" + count badge + SearchInput (140px)
  - Content: SkillItem 列表 (侧边版本)

Detail Panel:
  - Header: Icon + Name + Description + Toggle
  - Content Sections:
    1. Info: Created / Usage / Last Used
    2. Category Selector + Tags
    3. Instructions (markdown content box)
    4. Configuration (Invocation, Allowed Tools, Context, Scope)
    5. Source Path
    6. Used in Scenes
```

---

## SubAgent B: MCP Servers 模块

### 需要创建的文件
1. `src/components/mcps/McpItem.tsx` - MCP 列表项组件
2. `src/pages/McpServersPage.tsx` - MCP 列表页
3. `src/pages/McpDetailPage.tsx` - MCP 详情页
4. `src/stores/mcpsStore.ts` - MCP 状态管理

### 与 Skills 的差异
- 列表项显示 "5 tools" 而非 Tags
- 无 "Auto Classify" 按钮
- 详情页显示 "Provided Tools" 列表
- 详情页无 "Instructions" section

---

## SubAgent C: Scenes 模块

### 需要创建的文件
1. `src/components/scenes/SceneCard.tsx` - Scene 卡片组件
2. `src/components/scenes/CreateSceneModal.tsx` - 新建 Scene 模态框 (最复杂)
3. `src/pages/ScenesPage.tsx` - Scenes 列表页
4. `src/pages/SceneDetailPage.tsx` - Scene 详情页
5. `src/stores/scenesStore.ts` - Scenes 状态管理

### SceneCard 规范
```
padding: 16px, radius: 8px, border: 1px #E5E5E5
hover: bg #FAFAFA

内容:
  - Icon 容器: 40x40, radius 8px, bg #F4F4F5, icon 20x20 #52525B
  - Name: 14px/500 #18181B
  - Description: 12px/normal #71717A (2行截断)
  - Stats: "Skills 5 · MCPs 3" (11px/normal #A1A1AA)
```

### CreateSceneModal 规范 (三栏布局)
```
Modal: maxWidth 1280px

左栏 (320px):
  - Scene Name Input
  - Description Textarea
  - Selection Summary (Skills count + MCPs count)
  - Create Scene (Primary) + Cancel 按钮

中栏 (fill):
  - Tab: Skills / MCP Servers
  - Filters: Search + Category Dropdown + Tags Dropdown + Select All
  - Checkable List

右栏 (320px):
  - Header: "Selected Items" + "Clear All" (red)
  - Skills Group (collapsible)
  - MCPs Group (collapsible)
```

---

## SubAgent D: Projects 模块

### 需要创建的文件
1. `src/components/projects/ProjectItem.tsx` - Project 列表项组件
2. `src/components/projects/ProjectConfigPanel.tsx` - 配置面板
3. `src/pages/ProjectsPage.tsx` - Projects 页面
4. `src/stores/projectsStore.ts` - Projects 状态管理

### ProjectsPage 规范
```
使用 ListDetailLayout (listWidth: 400):

List Panel:
  - Header: "Projects" + SearchInput + Add 按钮
  - Content: ProjectItem 列表

Detail Panel (查看模式):
  - Header: 项目名 + "Open Folder" 按钮
  - Content:
    - Project Path
    - Active Scene (Scene selector + Change 按钮)
    - Skills/MCPs 配置卡片
    - Action: "Sync Configuration" + "Clear Config"

Detail Panel (新建模式):
  - Header: "New Project Configuration" + Cancel + Create
  - Content:
    - Project Information (Name + Path 输入框 with Browse)
    - Scene Configuration (Scene 下拉)
    - Configuration Status (验证列表)
```

---

## SubAgent E: Settings 模块

### 需要创建的文件
1. `src/pages/SettingsPage.tsx` - Settings 页面
2. `src/stores/settingsStore.ts` - Settings 状态管理

### SettingsPage 规范
```
使用 PageHeader:
  - Title: "Settings"
  - 无 Badge, 无 Search, 无 Actions

Content (居中, max-width 600px):
  Section 间距: 32px

Storage Section:
  - Section Header: "Storage" + description
  - Card:
    - Skills Source Directory (path + Change)
    - MCP Servers Source Directory (path + Change)
    - Claude Code Config Directory (path + Change)
    - Stats: Skills 127 / MCPs 18 / Scenes 8 / Size 2.4 MB

Auto Classify Section:
  - Section Header: "Auto Classify" + description
  - Card:
    - Anthropic API Key (masked display + Configure)
    - Auto-classify Toggle
    - Security hint

About Section:
  - App Icon (48x48) + "Ensemble" + Version
  - Links: GitHub / Documentation / MIT License
```

---

## 执行方式

所有 SubAgent 可以**完全并行执行**，因为各模块独立。

## Mock 数据

每个 Store 应包含初始 mock 数据用于开发和测试。

## 公共 Store 更新

完成后更新 `src/stores/index.ts` 导出所有 stores。
