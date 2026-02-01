# SubAgent 执行规范文档

## 1. 工作目录

**重要**：所有操作必须在 Git Worktree 目录下进行：
```
/Users/bo/Documents/Development/Ensemble/Ensemble2-detail-panel-refactor
```

**不要**在原始目录操作：
```
/Users/bo/Documents/Development/Ensemble/Ensemble2  # 不要使用这个目录
```

---

## 2. 通用重构模式

每个模块的重构遵循相同的模式，请严格按照以下步骤执行：

### 2.1 状态管理变更

**添加本地状态**（在组件函数内部开头）：
```typescript
// 选中项目 ID 状态
const [selectedId, setSelectedId] = useState<string | null>(null);
```

**获取选中项目数据**：
```typescript
// 根据 selectedId 获取选中的项目
const selectedItem = useMemo(
  () => items.find((item) => item.id === selectedId) || null,
  [items, selectedId]
);
```

### 2.2 点击处理变更

**原代码**：
```typescript
const handleItemClick = (id: string) => {
  navigate(`/xxx/${id}`);
};
```

**新代码**：
```typescript
const handleItemClick = (id: string) => {
  setSelectedId(id);
};

const handleCloseDetail = () => {
  setSelectedId(null);
};
```

### 2.3 布局结构变更

**原布局**（单列表）：
```tsx
<div className="flex h-full flex-col">
  <PageHeader ... />
  <div className="flex-1 overflow-y-auto">
    {/* 列表内容 */}
  </div>
</div>
```

**新布局**（带滑动面板）：
```tsx
<div className="relative flex h-full flex-col overflow-hidden">
  <PageHeader ... />

  {/* 主内容区 - 带收缩动画 */}
  <div
    className={`
      flex-1 overflow-y-auto px-7 py-6
      transition-[margin-right] duration-250 ease-[cubic-bezier(0.4,0,0.2,1)]
      ${selectedId ? 'mr-[800px]' : ''}
    `}
  >
    {/* 列表内容 */}
  </div>

  {/* 滑动详情面板 */}
  <SlidePanel
    isOpen={!!selectedId}
    onClose={handleCloseDetail}
    width={800}
    header={/* Detail Header 内容 */}
    headerRight={/* Header 右侧按钮 */}
  >
    {/* Detail Content 内容 */}
  </SlidePanel>
</div>
```

### 2.4 关键样式类

```css
/* 主容器需要 relative 和 overflow-hidden */
.main-container {
  position: relative;
  overflow: hidden;
}

/* 主内容区收缩动画 */
.main-content {
  transition: margin-right 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* 面板打开时 */
.main-content.panel-open {
  margin-right: 800px;
}
```

---

## 3. 各模块具体规格

### 3.1 Skills 模块

**文件路径**：`src/pages/SkillsPage.tsx`

**需要从 SkillDetailPage.tsx 提取的内容**：
1. `formatDate` 函数
2. `formatRelativeTime` 函数
3. `categoryColors` 对象
4. `InfoItem` 组件
5. `ConfigItem` 组件
6. `SceneChip` 组件
7. Detail Header JSX（包含图标、标题、描述、Edit 按钮、Toggle）
8. Detail Content JSX（Info、Category & Tags、Instructions、Configuration、Source、Used in Scenes）

**导入需要添加**：
```typescript
import { SlidePanel } from '@/components/layout';
import { Pencil, ChevronDown, X, Plus, Copy, FolderOpen } from 'lucide-react';
```

**选中态变量**：`selectedSkillId`

### 3.2 MCP Servers 模块

**文件路径**：`src/pages/McpServersPage.tsx`

**需要从 McpDetailPage.tsx 提取的内容**：
1. `iconMap` 和 `getIcon` 函数
2. `getMcpIcon` 函数
3. `getToolIcon` 函数
4. `ToolItem` 组件
5. `mockScenes` 数据
6. Detail Header JSX
7. Detail Content JSX（Info、Category & Tags、Provided Tools、Source Configuration、Used in Scenes）

**导入需要添加**：
```typescript
import { SlidePanel } from '@/components/layout';
import { Pencil, Layers, Wrench, Globe, FileText, Code, MessageSquare, FolderOpen } from 'lucide-react';
```

**选中态变量**：`selectedMcpId`

### 3.3 Scenes 模块

**文件路径**：`src/pages/ScenesPage.tsx`

**需要从 SceneDetailPage.tsx 提取的内容**：
1. `sceneIconMap`、`skillIconMap`、`mcpIconMap` 和相关函数
2. `IncludedItem` 组件
3. `ProjectChip` 组件
4. `mockProjects` 数据
5. `formatDate` 函数
6. Detail 的 Skills/MCPs 列表逻辑（`includedSkills`、`includedMcps`、`usingProjects`）
7. Detail Header JSX（包含 Edit 和 Delete 按钮）
8. Detail Content JSX（Info、Included Skills、Included MCP Servers、Used by Projects）

**导入需要添加**：
```typescript
import { SlidePanel } from '@/components/layout';
import { Pencil, Trash2, Folder, AlertTriangle, Code, Server, BarChart, Cloud, FileText, BookOpen, Smartphone, Database, Globe, Zap, FileCode } from 'lucide-react';
```

**选中态变量**：`selectedSceneId`

**特殊处理**：
- 需要保留 `CreateSceneModal` 的功能
- 删除场景时需要检查是否被项目使用

### 3.4 Projects 模块

**文件路径**：`src/pages/ProjectsPage.tsx`

**特殊情况**：Projects 已经有内置的 Detail 模式，但使用 `ListDetailLayout`。需要：

1. **移除对 `ListDetailLayout` 的使用**
2. **统一使用 `SlidePanel` 滑动模式**
3. **保留三种状态**：
   - 空状态（无项目）
   - 列表状态（有项目，未选中）
   - 详情状态（选中项目或创建中）

**重构后的状态逻辑**：
```typescript
// 空状态
if (projects.length === 0 && !isCreating) {
  return <EmptyState />;
}

// 列表状态 + 可选的详情面板
return (
  <div className="relative flex h-full flex-col overflow-hidden">
    <PageHeader ... />

    <div className={`flex-1 overflow-y-auto ... ${(selectedProjectId || isCreating) ? 'mr-[填充宽度]' : ''}`}>
      {/* 项目列表 */}
    </div>

    <SlidePanel
      isOpen={!!selectedProjectId || isCreating}
      onClose={handleCloseDetail}
      ...
    >
      {/* ProjectConfigPanel */}
    </SlidePanel>
  </div>
);
```

**注意**：Projects 的 Detail Panel 宽度使用 `fill`（填充剩余空间），而非固定 800px。计算方式：`width = 总宽度 - Sidebar(260px) - ListPanel(400px) = 780px` 左右。可以使用 `calc(100vw - 260px - 400px)` 或固定值 `780px`。

---

## 4. 列表项样式更新

根据设计稿修改，Detail 模式下的列表项样式需要统一。当 Detail Panel 打开时，列表项使用以下样式：

### 4.1 选中态样式

```tsx
<div
  className={`
    flex items-center gap-3.5
    rounded-lg border border-[#E5E5E5]
    px-5 py-4
    cursor-pointer
    transition-colors
    ${selected ? 'bg-[#FAFAFA]' : 'hover:bg-[#FAFAFA]'}
  `}
>
  {/* Icon Container */}
  <div className={`
    flex h-10 w-10 items-center justify-center rounded-lg
    ${selected ? 'bg-[#F4F4F5]' : 'bg-[#FAFAFA]'}
  `}>
    <Icon className={`h-5 w-5 ${selected ? 'text-[#18181B]' : 'text-[#52525B]'}`} />
  </div>

  {/* Info */}
  <div className="flex flex-col gap-1">
    <span className={`text-sm text-[#18181B] ${selected ? 'font-semibold' : 'font-medium'}`}>
      {item.name}
    </span>
    <span className="text-xs text-[#71717A]">{item.description}</span>
  </div>
</div>
```

---

## 5. 验证检查清单

完成重构后，请验证以下内容：

### 5.1 功能验证
- [ ] 点击列表项，Detail Panel 从右侧滑入
- [ ] 切换选中项，Detail 内容更新（无重复动画）
- [ ] 点击关闭按钮，Detail Panel 滑出
- [ ] 搜索功能正常工作
- [ ] Toggle 开关正常工作
- [ ] Icon Picker 正常工作

### 5.2 样式验证
- [ ] 选中项有 `#FAFAFA` 背景色
- [ ] 动画流畅（250ms duration）
- [ ] 主内容区正确收缩
- [ ] Detail Panel 宽度正确

### 5.3 代码质量
- [ ] 无 TypeScript 错误
- [ ] 无未使用的导入
- [ ] 组件结构清晰

---

## 6. 导入语句模板

### Skills 模块
```typescript
import React, { useState, useMemo, useRef } from 'react';
import {
  Sparkles,
  Loader2,
  Code,
  Github,
  BookOpen,
  Smartphone,
  Palette,
  Server,
  Database,
  FileCode,
  GitPullRequest,
  TestTube,
  Layers,
  Wand2,
  Pencil,
  ChevronDown,
  X,
  Plus,
  Copy,
  FolderOpen,
} from 'lucide-react';
import { PageHeader, SlidePanel } from '@/components/layout';
import { Badge, Button, EmptyState, IconPicker, ICON_MAP, Toggle } from '@/components/common';
import SkillItem from '@/components/skills/SkillItem';
import { useSkillsStore } from '@/stores/skillsStore';
import type { Skill } from '@/types';
```

### MCP Servers 模块
```typescript
import React, { useState, useMemo, useRef } from 'react';
import {
  Server,
  Database,
  Code,
  MessageSquare,
  Globe,
  FileText,
  Pencil,
  Layers,
  Wrench,
  FolderOpen,
} from 'lucide-react';
import { PageHeader, SlidePanel } from '@/components/layout';
import { Badge, EmptyState, IconPicker, ICON_MAP, Toggle, SearchInput } from '@/components/common';
import { McpItem } from '@/components/mcps/McpItem';
import { useMcpsStore } from '@/stores/mcpsStore';
import type { McpServer, Tool } from '@/types';
```

### Scenes 模块
```typescript
import React, { useState, useMemo, useRef } from 'react';
import {
  Plus,
  Layers,
  Pencil,
  Trash2,
  Folder,
  AlertTriangle,
  Code,
  Server,
  BarChart,
  Cloud,
  FileText,
  BookOpen,
  Smartphone,
  Database,
  Globe,
  Zap,
  FileCode,
  Sparkles,
} from 'lucide-react';
import { PageHeader, SlidePanel } from '@/components/layout';
import { Button, Badge, EmptyState, IconPicker } from '@/components/common';
import { SceneCard } from '@/components/scenes/SceneCard';
import { CreateSceneModal } from '@/components/scenes/CreateSceneModal';
import { useScenesStore } from '@/stores/scenesStore';
import { useSkillsStore } from '@/stores/skillsStore';
import { useMcpsStore } from '@/stores/mcpsStore';
import type { Scene, Skill, McpServer } from '@/types';
```

### Projects 模块
```typescript
import React, { useMemo, useState } from 'react';
import { Plus, Folder, ArrowLeft } from 'lucide-react';
import { PageHeader, SlidePanel } from '@/components/layout';
import { SearchInput, Button, EmptyState, IconPicker } from '@/components/common';
import { ProjectItem, NewProjectItem, ProjectConfigPanel, ProjectCard } from '@/components/projects';
import { useProjectsStore } from '@/stores/projectsStore';
import { useScenesStore } from '@/stores/scenesStore';
import type { Scene } from '@/types';
```
