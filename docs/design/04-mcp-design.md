# MCP Servers 模块设计规范

## 一、模块概览

MCP Servers 模块用于管理已安装的 MCP (Model Context Protocol) 服务器，与 Skills 模块共享大部分 UI 组件和布局模式，但有若干关键差异。

### 页面列表

| Node ID | 页面名称 | 布局类型 |
|---------|----------|----------|
| `hzMDi` | MCP Servers 列表 | 单栏 (Sidebar + Main Content) |
| `h1E7V` | MCP Servers 空状态 | 单栏 (Sidebar + Main Content) |
| `ltFNv` | MCP 详情 | 双栏 (Sidebar + List Panel + Detail Panel) |

---

## 二、与 Skills 模块的对比分析

### 2.1 相同点

| 组件/元素 | 共享规范 |
|-----------|----------|
| Sidebar | 完全相同 (260px宽度，导航、Categories、Tags) |
| 整体布局 | 相同的三种模式 (单栏/双栏/模态框) |
| List Panel | 相同宽度 (380px)，相同的列表项结构 |
| Detail Panel | 相同宽度 (800px)，相同的 Section 间距 (gap: 28px) |
| 空状态 | 相同的居中布局和文案结构 |
| Toggle 组件 | 完全相同的样式和尺寸 |
| Badge 组件 | 完全相同的样式 (Status Badge, Category Badge, Tag) |
| 搜索框 | 相同的样式和 placeholder 格式 |

### 2.2 差异点

| 元素 | Skills | MCP Servers |
|------|--------|-------------|
| Header 右侧按钮 | 搜索框 + "Auto Classify" 按钮 | 仅搜索框 (无 Auto Classify) |
| 列表项额外信息 | 无统计数据 | 显示 Stats (calls, response time) |
| 列表项状态 | 无状态指示 | 有 "Active" 状态 Badge |
| 详情页 Info Row | Created / Usage / Last Used | Tools / Total Calls / Avg Response |
| 详情页 Instructions Section | 有 (显示 SKILL.md 内容) | 无 |
| 详情页 Provided Tools | 无 | 有 (工具列表) |
| 详情页 Configuration Section | 有 (Invocation, Allowed Tools, Context) | 无 |
| 详情页 Source Section | Path + Scope | Config Path + Install Scope |
| 详情页 Source Section 标题 | "Source" | "Source Configuration" |

---

## 三、MCP Servers 列表页 (`hzMDi`)

### 3.1 页面结构

```
Ensemble - MCP Servers (1440 x 900)
├── Sidebar (260px)
│   └── [与 Skills 完全相同]
└── Main Content (1180px)
    ├── Main Header (56px)
    │   ├── Header Left
    │   │   ├── Title "MCP Servers"
    │   │   └── Status Badge (绿色, "18 Connected")
    │   └── Header Right
    │       └── Search (220px)
    └── Content Area (padding: 24px 28px)
        └── Servers Grid (gap: 12px)
            └── Server Item × N
```

### 3.2 Main Header

**与 Skills 的差异：无 "Auto Classify" 按钮**

| 属性 | 值 |
|------|-----|
| 高度 | 56px |
| padding | 0 28px |
| 底部边框 | 1px solid #E5E5E5 |
| 布局 | space_between |

**Header Left**
- Title: "MCP Servers"
  - font-size: 16px
  - font-weight: 600
  - color: #18181B
- Status Badge (Connected 状态)
  - gap: 4px
  - padding: 4px 8px
  - border-radius: 4px
  - background: #DCFCE7
  - 绿点: 6px circle, #DCFCE7
  - 文字: "18 Connected"
    - font-size: 10px
    - font-weight: 600
    - color: #16A34A

**Header Right**
- Search Input
  - width: 220px
  - height: 32px
  - padding: 0 10px
  - border-radius: 6px
  - border: 1px solid #E5E5E5
  - gap: 8px
  - icon: lucide/search, 14px, #A1A1AA
  - placeholder: "Search servers..."
    - font-size: 12px
    - color: #A1A1AA

### 3.3 Server List Item (MCP 特有)

**整体结构**

| 属性 | 值 |
|------|-----|
| width | fill_container |
| padding | 16px 20px |
| border-radius | 8px |
| border | 1px solid #E5E5E5 |
| 布局 | space_between |
| gap | 无 (左右分开) |

**Left Section (gap: 14px)**

1. **Icon Wrap**
   - width: 40px
   - height: 40px
   - border-radius: 8px
   - background: #FAFAFA
   - 内部图标: 20px, #52525B
   - 常用图标: database, folder-open, github, message-square, code

2. **Info (gap: 4px, vertical)**
   - Name
     - font-size: 14px
     - font-weight: 500
     - color: #18181B
   - Description
     - font-size: 12px
     - font-weight: 400
     - color: #71717A

**Right Section (gap: 16px)**

1. **Stats (gap: 20px)** - MCP 特有
   - Stat Item (gap: 6px)
     - icon: 12px, #A1A1AA (lucide/zap 或 lucide/timer)
     - text: 11px, #71717A
     - 示例: "2.4k calls", "45ms avg"

2. **Status Badge** - MCP 特有
   - padding: 4px 10px
   - border-radius: 4px
   - background: #DCFCE7
   - text: "Active"
     - font-size: 10px
     - font-weight: 600
     - color: #16A34A

3. **Toggle**
   - width: 40px
   - height: 22px
   - border-radius: 11px
   - background (on): #18181B
   - Knob: 18px circle, white, border-radius: 9px

### 3.4 Server List Item vs Skill List Item 对比

| 属性 | Skill Item | Server Item |
|------|------------|-------------|
| padding | 14px 16px | 16px 20px |
| Icon 尺寸 | 36px | 40px |
| Icon 内图标 | 18px | 20px |
| Toggle 尺寸 | 40×22px | 40×22px (相同) |
| 额外内容 | Tags (Category + Tags) | Stats + Status Badge |
| gap (主容器) | 14px | 无 (space_between) |

---

## 四、MCP Servers 空状态 (`h1E7V`)

### 4.1 页面结构

与 Skills 空状态完全相同的布局模式。

### 4.2 空状态组件

**Empty State Container**
- 居中显示 (justify-content: center)
- gap: 20px (vertical)

**Graphic Group**
- width: 56px
- height: 24px
- 包含:
  - 左圆点: 12px circle, stroke: #D4D4D8 (1.5px)
  - 右圆点: 12px circle, fill: #D4D4D8
  - 连接线: 24px horizontal line, stroke: #D4D4D8 (1.5px)

**Text Group (gap: 6px)**
- Title: "No MCP servers"
  - font-size: 14px
  - font-weight: 500
  - color: #A1A1AA
  - letter-spacing: -0.2px
- Description: "Add servers to extend capabilities"
  - font-size: 13px
  - font-weight: 400
  - color: #D4D4D8
  - text-align: center

### 4.3 与 Skills 空状态对比

| 元素 | Skills 空状态 | MCP 空状态 |
|------|---------------|------------|
| 标题 | "No Skills" | "No MCP servers" |
| 描述 | (需确认) | "Add servers to extend capabilities" |
| Sidebar Categories | "No categories" | "No categories" |
| Sidebar Tags | "No tags" | "No tags" |

---

## 五、MCP 详情页 (`ltFNv`)

### 5.1 页面结构

```
Ensemble - MCP Detail (1440 x 900)
├── Sidebar (260px)
│   └── [与 Skills 完全相同]
└── Main Content (1180px)
    ├── List Panel (380px)
    │   ├── List Header (56px)
    │   │   ├── Left: Title + Badge
    │   │   └── Right: Search (140px)
    │   └── List Content (padding: 12px, gap: 4px)
    │       └── Server Item × N
    └── Detail Panel (800px)
        ├── Detail Header (56px)
        └── Detail Content (padding: 28px, gap: 28px)
            ├── Info Section
            ├── Tools Section [MCP 特有]
            ├── Source Section
            └── Scenes Section
```

### 5.2 List Panel

**List Header**

| 属性 | 值 |
|------|-----|
| 高度 | 56px |
| padding | 0 20px |
| 底部边框 | 1px solid #E5E5E5 |
| 布局 | space_between |

**Left (gap: 12px)**
- Title: "MCP Servers"
  - font-size: 16px
  - font-weight: 600
  - color: #18181B
- Badge (Connected 状态)
  - 与列表页相同样式

**Search (140px)**
- height: 32px
- padding: 0 10px
- border-radius: 6px
- border: 1px solid #E5E5E5
- gap: 6px
- icon: lucide/search, 14px, #A1A1AA
- placeholder: "Search servers..."

**List Item (简化版)**

| 属性 | 值 |
|------|-----|
| padding | 12px 14px |
| border-radius | 6px |
| gap | 12px |
| 选中背景 | #FAFAFA |

- Icon: 32px, border-radius: 6px, #FAFAFA/#F4F4F5
  - 内图标: 16px, #18181B (选中时) / #52525B
- Info (gap: 2px)
  - Name: 13px, 600, #18181B
  - Description: 11px, 400, #71717A
- Toggle: 36×20px (比列表页小)
  - Knob: 16px

### 5.3 Detail Header

| 属性 | 值 |
|------|-----|
| 高度 | 56px |
| padding | 0 28px |
| 底部边框 | 1px solid #E5E5E5 |
| 布局 | space_between |

**Left (gap: 12px)**
- Icon
  - width: 36px
  - height: 36px
  - border-radius: 8px
  - background: #F4F4F5
  - 内图标: 20px
- Title Wrap (gap: 2px)
  - Name: 14px, 600, #18181B
  - Description: 12px, 400, #71717A

**Right (gap: 8px)**
- Edit Button
  - height: 32px
  - padding: 0 12px
  - border-radius: 6px
  - border: 1px solid #E5E5E5
  - gap: 6px
  - icon: lucide/pencil, 14px
  - text: "Edit", 13px, 500
- Toggle
  - width: 44px
  - height: 24px
  - border-radius: 12px

### 5.4 Detail Content Sections

**Info Section (gap: 16px)**

与 Skill 详情相似，但字段不同：

| 字段 | Skill | MCP |
|------|-------|-----|
| 第一列 | Created | Tools |
| 第二列 | Usage | Total Calls |
| 第三列 | Last Used | Avg Response |
| Category | 有 | 有 (相同) |
| Tags | 有 | 有 (相同) |

**Info Row (gap: 32px)**

每个 Info Item:
- gap: 4px (vertical)
- Label
  - font-size: 11px
  - font-weight: 500
  - color: #71717A
- Value
  - font-size: 13px
  - font-weight: 500
  - color: #18181B

MCP 特有值示例:
- Tools: "4 available"
- Total Calls: "1,847"
- Avg Response: "12ms"

### 5.5 Provided Tools Section (MCP 特有)

**Section Header**
- Title: "Provided Tools"
  - font-size: 14px
  - font-weight: 600
  - color: #18181B

**Tools Box**
- width: fill_container
- border-radius: 8px
- border: 1px solid #E5E5E5
- layout: vertical

**Tool Item**
- padding: 12px 14px
- gap: 12px
- border-bottom: 1px solid #E5E5E5 (最后一项无)

**Tool Item 内容:**

1. **Icon Wrap**
   - width: 32px
   - height: 32px
   - border-radius: 6px
   - background: #F4F4F5
   - icon: 14px, #52525B
   - 常用图标: file-text, pencil, folder-search, search

2. **Info (gap: 2px, vertical, fill_container)**
   - Tool Name
     - font-size: 13px
     - font-weight: 500
     - color: #18181B
     - 示例: "read_file", "write_file", "list_directory", "search_files"
   - Tool Description
     - font-size: 11px
     - font-weight: 400
     - color: #71717A
     - 示例: "Read the contents of a file at the specified path"

### 5.6 Source Configuration Section (MCP 特有命名)

**Section Header**
- Title: "Source Configuration" (Skills 为 "Source")
  - font-size: 14px
  - font-weight: 600
  - color: #18181B

**Source Box**
- padding: 16px
- border-radius: 8px
- border: 1px solid #E5E5E5
- gap: 12px (vertical)

**Source Item**
- layout: horizontal
- gap: 10px

1. **Config Path**
   - Label: "Config Path"
     - font-size: 12px
     - font-weight: 500
     - color: #71717A
   - Value: "~/.config/conductor/mcps/filesystem-mcp.json"
     - font-size: 12px
     - font-weight: 400
     - color: #18181B

2. **Install Scope**
   - Label: "Install Scope"
   - Value: Scope Badge
     - text: "User"
     - font-size: 10px
     - font-weight: 600
     - color: #4F46E5
     - background: #EEF2FF
     - padding: 4px 8px
     - border-radius: 4px

### 5.7 Scenes Section

与 Skill 详情完全相同。

**Section Header**
- Title: "Used in Scenes"
  - font-size: 14px
  - font-weight: 600
  - color: #18181B

**Scenes Grid**
- layout: horizontal
- gap: 8px
- wrap: true

**Scene Chip**
- padding: 8px 14px
- border-radius: 6px
- border: 1px solid #E5E5E5
- gap: 8px
- icon: lucide/layers, 14px, #52525B
- text
  - font-size: 12px
  - font-weight: 500
  - color: #18181B

---

## 六、MCP 特有组件汇总

### 6.1 Status Badge (Active)

```css
.status-badge-active {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 4px;
  background: #DCFCE7;
}

.status-badge-active .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #16A34A;
}

.status-badge-active .text {
  font-size: 10px;
  font-weight: 600;
  color: #16A34A;
}
```

### 6.2 Stats Item

```css
.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat-item .icon {
  width: 12px;
  height: 12px;
  color: #A1A1AA;
}

.stat-item .text {
  font-size: 11px;
  font-weight: 400;
  color: #71717A;
}
```

### 6.3 Tool Item

```css
.tool-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 1px solid #E5E5E5;
}

.tool-item:last-child {
  border-bottom: none;
}

.tool-item .icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #F4F4F5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tool-item .icon {
  width: 14px;
  height: 14px;
  color: #52525B;
}

.tool-item .info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.tool-item .name {
  font-size: 13px;
  font-weight: 500;
  color: #18181B;
}

.tool-item .description {
  font-size: 11px;
  font-weight: 400;
  color: #71717A;
}
```

### 6.4 Install Scope Badge

```css
.scope-badge-user {
  padding: 4px 8px;
  border-radius: 4px;
  background: #EEF2FF;
  font-size: 10px;
  font-weight: 600;
  color: #4F46E5;
}
```

---

## 七、可复用组件清单

### 7.1 完全复用 (与 Skills 相同)

- Sidebar
- SearchInput
- Toggle
- Category Badge
- Tag
- Add Tag Button
- Category Selector
- Scenes Grid / Scene Chip
- Empty State Container

### 7.2 需差异化的组件

| 组件 | 差异点 |
|------|--------|
| ListItem (列表页) | MCP 多了 Stats + Status Badge |
| ListItem (List Panel) | 基本相同，可复用 |
| DetailHeader | Icon 位置和按钮不同 |
| InfoSection | 字段名称和含义不同 |
| ToolsSection | MCP 特有 |
| SourceSection | 字段和标题不同 |

### 7.3 建议的组件抽象

```typescript
// 通用列表项基础结构
interface BaseListItem {
  icon: string;
  iconSize: 'sm' | 'md' | 'lg'; // 32px / 36px / 40px
  name: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}

// Skill 列表项
interface SkillListItem extends BaseListItem {
  category: string;
  tags: string[];
}

// MCP 列表项
interface McpListItem extends BaseListItem {
  stats: {
    calls: string;
    responseTime: string;
  };
  status: 'active' | 'inactive';
}
```

---

## 八、颜色规范汇总

### 状态颜色

| 状态 | 背景 | 文字 |
|------|------|------|
| Active/Connected (绿) | #DCFCE7 | #16A34A |
| User Scope (紫) | #EEF2FF | #4F46E5 |
| Personal Scope (橙) | #FEF3C7 | #D97706 |
| Claude Badge (紫) | #EEF2FF | #4F46E5 |

### 中性色

| 用途 | 色值 |
|------|------|
| 主文字 | #18181B |
| 次要文字 | #71717A |
| 占位符/图标 | #A1A1AA |
| 最浅文字 | #D4D4D8 |
| 边框 | #E5E5E5 |
| 分割线 | #E4E4E7 |
| 浅灰背景 | #FAFAFA |
| 图标背景 | #F4F4F5 |

---

## 九、关键尺寸速查

| 组件 | 尺寸 |
|------|------|
| List Panel | 380px |
| Detail Panel | 800px (fill) |
| Header 高度 | 56px |
| Content padding | 28px |
| List Content padding | 12px |
| Section gap | 28px |
| Item gap (列表页) | 12px |
| Item gap (List Panel) | 4px |
| Search (列表页) | 220px |
| Search (List Panel) | 140px |
| Icon (列表页) | 40px |
| Icon (List Panel) | 32px |
| Icon (Detail Header) | 36px |
| Toggle (列表页) | 40×22px |
| Toggle (List Panel) | 36×20px |
| Toggle (Detail Header) | 44×24px |
