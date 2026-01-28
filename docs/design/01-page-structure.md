# Ensemble 设计稿页面结构索引

## 一、设计稿概览

- **设计稿路径**：`/Users/bo/Downloads/MCP 管理.pen`
- **总页面/组件数**：19 个
- **设计尺寸**：1440 x 900 (标准桌面应用尺寸)
- **整体风格**：白色背景，极简高级质感，克制的色彩使用

### 布局模式

设计稿包含三种主要布局模式：

1. **单栏布局** (Sidebar 260px + Main Content fill)
   - Skills 列表页、MCP Servers 列表页、Scenes 列表页
   - 空状态页面
   - Settings 页面

2. **双栏布局** (Sidebar 260px + List Panel 380-400px + Detail Panel fill)
   - Skill 详情页、MCP 详情页、Scene 详情页
   - Projects 列表页、新建 Project 页

3. **模态框布局**
   - 新建 Scene 模态框 (三栏选择界面)

---

## 二、页面索引表

| Node ID | 页面名称 | 尺寸 (W x H) | 布局类型 | 主要区域 |
|---------|----------|--------------|----------|----------|
| `rPgYw` | Skills 列表 | 1440 x 900 | 单栏 | Sidebar + Main Content (Skills Grid) |
| `DqVji` | Skills 空状态 | 1440 x 900 | 单栏 | Sidebar + Empty State |
| `xzUxa` | Skills 按分类筛选 | 1440 x 900 | 单栏 | Sidebar + Filtered List (Skills + MCPs) |
| `vjc0x` | Skills 按标签筛选 | 1440 x 900 | 单栏 | Sidebar + Filtered List (Skills + MCPs) |
| `nNy4r` | Skill 详情 | 1440 x 900 | 双栏 | Sidebar + List Panel (380px) + Detail Panel |
| `hzMDi` | MCP Servers 列表 | 1440 x 900 | 单栏 | Sidebar + Main Content (Servers Grid) |
| `h1E7V` | MCP Servers 空状态 | 1440 x 900 | 单栏 | Sidebar + Empty State |
| `ltFNv` | MCP 详情 | 1440 x 900 | 双栏 | Sidebar + List Panel (380px) + Detail Panel |
| `M7mYr` | Scenes 列表 | 1440 x 900 | 单栏 | Sidebar + Main Content (Scenes Grid) |
| `v7TIk` | Scenes 空状态 | 1440 x 900 | 单栏 | Sidebar + Empty State |
| `LlxKB` | Scene 详情 | 1440 x 900 | 双栏 | Sidebar + List Panel (380px) + Detail Panel |
| `Ek3cB` | 新建 Scene 模态框 | 1440 x 900 | 模态框 | Modal Overlay + 3-Column Dialog |
| `y0Mt4` | Projects 列表 | 1440 x 900 | 双栏 | Sidebar + List Panel (400px) + Detail Panel |
| `F1YbB` | Projects 空状态 | 1440 x 900 | 双栏 | Sidebar + List Panel (Empty) + Detail Panel (Empty) |
| `cdnEv` | 新建 Project | 1440 x 900 | 双栏 | Sidebar + List Panel (400px) + Detail Panel |
| `qSzzi` | Settings | 1440 x 900 | 单栏 | Sidebar + Main Content (600px width) |
| `weNqA` | 分类下拉 | 200 x auto | 组件 | Dropdown with Category List |
| `moMFu` | 标签下拉 | 220 x auto | 组件 | Dropdown with Search + Tag List |
| `v4ije` | 分类右键菜单 | 140 x auto | 组件 | Context Menu (Rename/Delete) |

---

## 三、各页面详细描述

### 3.1 Skills 模块

#### Skills 列表 (`rPgYw`)
- **布局**：Sidebar (260px) + Main Content (fill)
- **主要组件**：
  - Sidebar: Logo + 导航菜单 + Categories + Tags + Footer
  - Main Header: 页面标题 "Skills" + 计数Badge + 搜索框 + Auto Classify 按钮
  - Content Area: Skills 列表 (每项含 Toggle、Icon、Name、Description、Category Badge、Tags)
- **交互状态**：默认列表展示，无选中项

#### Skills 空状态 (`DqVji`)
- **布局**：同列表页
- **特殊处理**：
  - Sidebar Categories 显示 "No categories"
  - Sidebar Tags 显示 "No tags"
  - Content Area 居中显示空状态提示 "No Skills" + 引导文案

#### Skills 按分类筛选 (`xzUxa`)
- **布局**：同列表页
- **特殊处理**：
  - Main Header 标题变为分类名称 (如 "Development")
  - Content Area 分为两个 Section: "Skills (4)" 和 "MCP Servers (2)"
  - 每个 Section 有独立标题和列表

#### Skills 按标签筛选 (`vjc0x`)
- **布局**：同按分类筛选
- **特殊处理**：
  - Main Header 标题变为标签名称 (如 "React")
  - 同样分为 Skills Section 和 MCP Servers Section

#### Skill 详情 (`nNy4r`)
- **布局**：Sidebar (260px) + List Panel (380px) + Detail Panel (800px)
- **List Panel 组件**：
  - List Header: 标题 "Skills" + 计数Badge + 搜索框
  - List Content: Skill 列表项 (选中状态高亮)
- **Detail Panel 组件**：
  - Detail Header: Skill 名称 + Toggle
  - Detail Content:
    - 基本信息区: Created/Last Used/Usage Count
    - Category + Tags
    - Instructions (Markdown 内容)
    - Configuration: Invocation/Allowed Tools/Default/Scope
    - Source Path
    - Used in Scenes

---

### 3.2 MCP Servers 模块

#### MCP Servers 列表 (`hzMDi`)
- **布局**：Sidebar (260px) + Main Content (fill)
- **主要组件**：
  - Main Header: 页面标题 "MCP Servers" + 计数Badge + 搜索框
  - Content Area: Server 列表 (每项含 Toggle、Icon、Name、Description、Tools Count、Category Badge、Tags)

#### MCP Servers 空状态 (`h1E7V`)
- **布局**：同列表页
- **特殊处理**：Content Area 居中显示 "No MCP servers" + 引导文案

#### MCP 详情 (`ltFNv`)
- **布局**：Sidebar (260px) + List Panel (380px) + Detail Panel (800px)
- **Detail Panel 特有组件**：
  - Provided Tools 列表 (Tool Name + Description)
  - Source Configuration (Config Path + Edit 按钮)
  - Used in Scenes

---

### 3.3 Scenes 模块

#### Scenes 列表 (`M7mYr`)
- **布局**：Sidebar (260px) + Main Content (fill)
- **主要组件**：
  - Main Header: 页面标题 "Scenes" + 搜索框 + "New Scene" 按钮
  - Content Area: Scene 卡片网格 (Icon + Name + Description + Skills/MCPs Count)

#### Scenes 空状态 (`v7TIk`)
- **布局**：同列表页
- **特殊处理**：Content Area 居中显示 "No scenes" + 引导文案

#### Scene 详情 (`LlxKB`)
- **布局**：Sidebar (260px) + List Panel (380px) + Detail Panel (800px)
- **List Panel 组件**：
  - List Header: 标题 "Scenes" + 搜索框 + "New Scene" 按钮
  - Scene 列表项 (选中状态)
- **Detail Panel 组件**：
  - Detail Header: Scene 名称 + Edit/Delete 按钮
  - Detail Content:
    - 基本信息: Created/Skills Count/MCPs Count/Projects Count
    - Included Skills 列表
    - Included MCP Servers 列表
    - Used by Projects 列表

#### 新建 Scene 模态框 (`Ek3cB`)
- **布局**：Modal Overlay (半透明黑色背景) + Modal Dialog (1280 x 820, 圆角 16px)
- **Modal 内部布局**：
  - Modal Header: 标题 "Create New Scene" + Close 按钮
  - Modal Body (三栏):
    - 左栏 (Basic Information): Scene Name + Description + Selection Summary
    - 中栏 (Skills/MCP Servers 选择): Tabs + 搜索 + 列表
    - 右栏 (Selected Items): 已选择的 Skills 和 MCPs 列表
- **Footer**: Create Scene 按钮 + Cancel 按钮

---

### 3.4 Projects 模块

#### Projects 列表 (`y0Mt4`)
- **布局**：Sidebar (260px) + List Panel (400px) + Detail Panel (fill)
- **List Panel 组件**：
  - List Header: 标题 "Projects" + 搜索框 + Add 按钮
  - Project 列表项 (Path + Scene Badge + Last Synced)
- **Detail Panel 组件**：
  - Detail Header: Project 名称 + Open Folder 按钮
  - Detail Content:
    - Project Path
    - Scene 选择器 (Change 按钮)
    - Last Synced Status
    - Skills/MCPs 配置预览
    - Action Buttons: Sync Configuration + Open Config

#### Projects 空状态 (`F1YbB`)
- **布局**：同列表页
- **特殊处理**：
  - List Panel 居中显示 "No projects"
  - Detail Panel 居中显示 "Select a project"

#### 新建 Project (`cdnEv`)
- **布局**：同列表页
- **特殊处理**：
  - List Panel 最后一项为 "New Project" 输入状态
  - Detail Panel 标题变为 "New Project Configuration"
  - 显示配置验证状态 (Project name/path/Scene 是否完成)

---

### 3.5 Settings 模块

#### Settings (`qSzzi`)
- **布局**：Sidebar (260px) + Main Content (600px fixed width)
- **Content Sections**：
  1. **Storage Section**:
     - Skills Source Directory (路径 + Change 按钮)
     - MCP Servers Source Directory (路径 + Change 按钮)
     - Claude Code Config Directory (路径 + Change 按钮)
     - Storage 统计 (Skills/MCPs/Scenes 数量 + Total Size)
  2. **Auto Classify Section**:
     - Anthropic API Key 输入框 + Configure 按钮
     - Auto classify new items Toggle
  3. **About Section**:
     - App Logo + Version
     - Links: GitHub/Documentation/MIT License

---

### 3.6 通用组件

#### 分类下拉 (`weNqA`)
- **尺寸**：200px 宽
- **样式**：白色背景，圆角 8px，阴影效果
- **内容**：
  - Category 列表项 (Dot 颜色标识 + 名称)
  - 选中项显示 checkmark

#### 标签下拉 (`moMFu`)
- **尺寸**：220px 宽
- **样式**：同分类下拉
- **内容**：
  - 顶部搜索框 "Search tags..."
  - Tag 列表项 (Checkbox + 名称 + Count)
  - 支持多选

#### 分类右键菜单 (`v4ije`)
- **尺寸**：140px 宽
- **样式**：白色背景，圆角 6px，小阴影
- **内容**：
  - Rename (铅笔图标)
  - Delete (红色，垃圾桶图标)

---

## 四、组件复用关系

### 4.1 Sidebar 组件
所有页面共用相同的 Sidebar 结构：
- **Sidebar Header**: Logo + App Name "Ensemble"
- **Sidebar Content**:
  - Navigation Menu (Skills/MCP Servers/Scenes/Projects)
  - Categories Section (可折叠)
  - Tags Section (可折叠)
- **Sidebar Footer**: Settings 图标按钮

**Node ID 映射**（各页面的 Sidebar ID）：
| 页面 | Sidebar ID | Sidebar Header ID | Sidebar Content ID |
|------|------------|-------------------|-------------------|
| Skills 列表 | `24yeY` | `mbC95` | `2SfJn` |
| MCP Servers 列表 | `5oNvf` | `TsPmw` | `U6kHT` |
| Scenes 列表 | `eHYGk` | `1ZKnw` | `Tcoj8` |
| Projects 列表 | `NwcoX` | `IBaZ2` | `7pNfN` |
| Settings | `QCuAq` | `ycIbj` | `w40JO` |

### 4.2 List Panel 组件
Skills/MCP/Scenes/Projects 详情页共用类似的 List Panel 结构：
- **List Header**: 标题 + 搜索框 + (可选) Action 按钮
- **List Content**: 列表项容器 (gap: 4px, padding: 12px)

### 4.3 Detail Panel 组件
详情页共用类似的 Detail Panel 结构：
- **Detail Header**: 名称 + Action 按钮组
- **Detail Content**: 分 Section 展示详细信息 (gap: 28px, padding: 28px)

### 4.4 空状态组件
所有空状态页面使用相同的模式：
- 居中显示图标
- 主标题 (如 "No Skills")
- 副标题引导文案

### 4.5 列表项组件
Skills 和 MCP Servers 列表项结构类似：
- Toggle 开关
- Icon (圆形/方形)
- Name + Description
- Category Badge
- Tags (最多显示若干个)

---

## 五、关键尺寸规范

### 布局尺寸
| 组件 | 宽度 | 高度 |
|------|------|------|
| Sidebar | 260px | fill_container |
| List Panel (Skill/MCP/Scene Detail) | 380px | fill_container |
| List Panel (Projects) | 400px | fill_container |
| Detail Panel | fill_container | fill_container |
| Modal Dialog | 1280px | 820px |
| Settings Content | 600px | fill_container |

### Header 高度
| 组件 | 高度 |
|------|------|
| Sidebar Header | 56px |
| Main Header | 56px |
| List Header | 56px |
| Detail Header | 56px |
| Modal Header | 64px |

### 间距规范
| 位置 | Padding |
|------|---------|
| Main Content Area | 24px 28px |
| Detail Content | 28px |
| List Content | 12px |
| Sidebar Content | 16px 16px 8px 16px |

---

## 六、验证清单

- [x] Skills 列表 (rPgYw) - 已确认
- [x] Skills 空状态 (DqVji) - 已确认
- [x] Skills 按分类筛选 (xzUxa) - 已确认
- [x] Skills 按标签筛选 (vjc0x) - 已确认
- [x] Skill 详情 (nNy4r) - 已确认
- [x] MCP Servers 列表 (hzMDi) - 已确认
- [x] MCP Servers 空状态 (h1E7V) - 已确认
- [x] MCP 详情 (ltFNv) - 已确认
- [x] Scenes 列表 (M7mYr) - 已确认
- [x] Scenes 空状态 (v7TIk) - 已确认
- [x] Scene 详情 (LlxKB) - 已确认
- [x] 新建 Scene 模态框 (Ek3cB) - 已确认
- [x] Projects 列表 (y0Mt4) - 已确认
- [x] Projects 空状态 (F1YbB) - 已确认
- [x] 新建 Project (cdnEv) - 已确认
- [x] Settings (qSzzi) - 已确认
- [x] 分类下拉 (weNqA) - 已确认
- [x] 标签下拉 (moMFu) - 已确认
- [x] 分类右键菜单 (v4ije) - 已确认

**所有 19 个页面/组件的 Node ID 与项目文档一致，已全部验证通过。**
