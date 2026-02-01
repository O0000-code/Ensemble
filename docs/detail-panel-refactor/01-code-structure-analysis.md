# Detail Panel Refactor - Code Structure Analysis Report

## 1. 路由结构

**文件路径**: `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/App.tsx`

### 路由定义

```
Route Structure:
├── / (MainLayout)
│   ├── / → redirect to /skills
│   ├── /skills → SkillsPage (列表页)
│   ├── /skills/:skillId → SkillDetailPage (详情页 - 需要重构)
│   ├── /mcp-servers → McpServersPage (列表页)
│   ├── /mcp-servers/:id → McpDetailPage (详情页 - 需要重构)
│   ├── /scenes → ScenesPage (列表页)
│   ├── /scenes/:id → SceneDetailPage (详情页 - 需要重构)
│   ├── /projects → ProjectsPage (列表页)
│   ├── /projects/:id → ProjectsPage (详情页 - 需要重构)
│   ├── /category/:categoryId → CategoryPage
│   ├── /tag/:tagId → TagPage
│   └── /settings → SettingsPage
```

### 关键观察

1. **Skills、MCP、Scenes** 使用独立的 List 和 Detail 页面组件，通过路由切换
2. **Projects** 在单一组件内处理列表和详情视图
3. 所有路由嵌套在 `MainLayout` 下，提供 Sidebar

## 2. Detail 页面组件

### 2.1 SkillDetailPage
**路径**: `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/pages/SkillDetailPage.tsx`

**职责**:
- 使用 `ListDetailLayout` 实现双栏布局 (380px 列表 + 剩余详情)
- 左侧显示技能列表（带搜索和紧凑样式项目）
- 右侧显示选中技能详情
- 通过 `useEffect` 同步 URL 参数和 store 选择状态

**导航模式**:
```javascript
const handleSkillClick = (id: string) => {
  selectSkill(id);
  navigate(`/skills/${encodeURIComponent(id)}`);
};
```

### 2.2 McpDetailPage
**路径**: `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/pages/McpDetailPage.tsx`

**职责**:
- 双栏布局 (380px 列表 + 详情)
- 左侧 MCP 服务器列表带搜索
- 右侧显示选中 MCP 详情（工具数量、调用次数、响应时间等）

### 2.3 SceneDetailPage
**路径**: `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/pages/SceneDetailPage.tsx`

**职责**:
- 双栏布局 (380px 列表 + 详情)
- 左侧场景列表带搜索和创建按钮
- 右侧显示选中场景详情（技能数、MCP 数、关联项目等）
- 处理场景创建和删除

### 2.4 ProjectsPage
**路径**: `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/pages/ProjectsPage.tsx`

**职责**:
- 独特的三状态布局系统：
  - **空状态**: 双栏 (Sidebar + 居中空消息)
  - **列表状态**: 双栏 (Sidebar + ProjectCard 网格)
  - **详情/创建状态**: 三栏使用 `ListDetailLayout` (400px 列表 + 详情面板)

## 3. 主列表页面组件

### 3.1 SkillsPage
**路径**: `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/pages/SkillsPage.tsx`

**职责**:
- 单栏布局，使用 `PageHeader`
- 显示全宽 `SkillItem` 卡片 (full variant)
- 包含 "Auto Classify" 操作按钮

### 3.2 McpServersPage
**路径**: `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/pages/McpServersPage.tsx`

**职责**:
- 单栏布局，使用 `PageHeader`
- 显示 `McpItem` (full variant)

### 3.3 ScenesPage
**路径**: `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/pages/ScenesPage.tsx`

**职责**:
- 单栏布局，使用 `PageHeader`
- 显示 `SceneCard`
- 包含 "New Scene" 操作按钮

## 4. 布局组件

### 4.1 MainLayout
**路径**: `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/components/layout/MainLayout.tsx`

**结构**:
```
MainLayout
├── Browser Preview Mode Banner (if not Tauri)
├── Sidebar (260px)
│   ├── Header (Traffic lights + Collapse button)
│   ├── Navigation (Skills, MCP Servers, Scenes, Projects)
│   ├── Categories Section
│   ├── Tags Section
│   └── Footer (Settings button)
└── Main Content (<Outlet />) ← 页面组件渲染位置
```

### 4.2 ListDetailLayout
**路径**: `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/components/layout/ListDetailLayout.tsx`

**职责**:
- Detail 页面的双栏布局
- List Panel (默认 380px，可配置) 带 header (56px) 和可滚动内容
- Detail Panel (填充剩余) 带可选 header 和可滚动内容

**Props**:
- `listWidth`: 列表面板宽度 (默认 380px, Projects 用 400px)
- `listHeader`: 列表面板头部内容
- `listContent`: 可滚动列表内容
- `detailHeader`: 详情面板头部内容
- `detailContent`: 详情面板内容
- `emptyDetail`: 未选中时显示的内容

## 5. 列表项组件

### 5.1 SkillItem
**路径**: `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/components/skills/SkillItem.tsx`

**变体**:
- **full**: 用于 SkillsPage 列表（较大，带分类徽章和标签）
- **compact**: 用于 SkillDetailPage 侧边面板（较小，无徽章）

### 5.2 McpItem / McpItemCompact
**路径**: `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/components/mcps/McpItem.tsx`

### 5.3 SceneCard / SceneItem
**路径**:
- `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/components/scenes/SceneCard.tsx`
- `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/components/scenes/SceneItem.tsx`

### 5.4 ProjectCard / ProjectItem
**路径**:
- `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/components/projects/ProjectCard.tsx`
- `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/components/projects/ProjectItem.tsx`

## 6. 组件依赖图

```
App.tsx
└── MainLayout
    ├── Sidebar
    └── <Outlet> (Page Components)
        │
        ├── SkillsPage
        │   ├── PageHeader
        │   └── SkillItem (full)
        │
        ├── SkillDetailPage
        │   ├── ListDetailLayout
        │   └── SkillItem (compact)
        │
        ├── McpServersPage
        │   ├── PageHeader
        │   └── McpItem
        │
        ├── McpDetailPage
        │   ├── ListDetailLayout
        │   └── McpItemCompact
        │
        ├── ScenesPage
        │   ├── PageHeader
        │   └── SceneCard
        │
        ├── SceneDetailPage
        │   ├── ListDetailLayout
        │   └── SceneItem
        │
        └── ProjectsPage
            ├── PageHeader (空/列表状态)
            ├── ListDetailLayout (详情状态)
            ├── ProjectCard (列表状态)
            └── ProjectItem (详情状态)
```

## 7. 当前导航流程总结

| 来源页面 | 操作 | 目标路由 | 方法 |
|---------|------|---------|------|
| SkillsPage | 点击技能 | /skills/:skillId | `navigate()` |
| McpServersPage | 点击 MCP | /mcp-servers/:id | `navigate()` |
| ScenesPage | 点击场景 | /scenes/:id | `navigate()` |
| ProjectsPage | 点击项目 | 内部状态变化 | `selectProject()` |

## 8. 需要重构的关键点

1. **移除路由跳转**：Detail 页面不再通过路由切换，而是在当前页面内滑入
2. **合并 List 和 Detail 组件**：将 SkillDetailPage 的 Detail Panel 内容合并到 SkillsPage 中
3. **添加滑动动画**：Detail Panel 从右侧滑入，Main Content 相应收缩
4. **保留列表可见性**：展开 Detail Panel 后，列表仍需可见可操作
5. **选中态同步**：列表中被选中的项目需要有明显的选中态样式
