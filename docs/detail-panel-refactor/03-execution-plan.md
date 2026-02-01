# Detail Panel 滑入效果重构 - 执行规划文档

## 1. 执行概览

### 1.1 执行顺序
```
Phase 1: 基础设施
  ├── 创建 Git Worktree
  └── 创建 SlidePanel 通用组件

Phase 2: 模块重构（可并行）
  ├── 重构 Skills 模块
  ├── 重构 MCP Servers 模块
  ├── 重构 Scenes 模块
  └── 重构 Projects 模块

Phase 3: 路由清理
  └── 更新 App.tsx 路由配置

Phase 4: 验证
  └── 运行测试与视觉对比
```

### 1.2 文件修改清单

#### 新建文件
- `src/components/layout/SlidePanel.tsx` - 滑动面板通用组件

#### 修改文件
- `src/App.tsx` - 移除 Detail 页面路由
- `src/pages/SkillsPage.tsx` - 合并 Detail 功能
- `src/pages/McpServersPage.tsx` - 合并 Detail 功能
- `src/pages/ScenesPage.tsx` - 合并 Detail 功能
- `src/pages/ProjectsPage.tsx` - 统一使用滑动面板模式
- `src/components/skills/SkillItem.tsx` - 统一样式（可选）
- `src/components/mcps/McpItem.tsx` - 统一样式（可选）
- `src/components/scenes/SceneItem.tsx` - 统一样式（可选）
- `src/components/projects/ProjectItem.tsx` - 统一样式（可选）

#### 删除文件（重构后可选删除）
- `src/pages/SkillDetailPage.tsx`
- `src/pages/McpDetailPage.tsx`
- `src/pages/SceneDetailPage.tsx`

---

## 2. SlidePanel 组件设计

### 2.1 组件规格

```typescript
// src/components/layout/SlidePanel.tsx

export interface SlidePanelProps {
  /** 是否显示面板 */
  isOpen: boolean;
  /** 面板宽度，默认 800px */
  width?: number;
  /** 面板头部内容 */
  header?: React.ReactNode;
  /** 面板主体内容 */
  children: React.ReactNode;
  /** 关闭回调 */
  onClose: () => void;
  /** 动画时长，默认 250ms */
  duration?: number;
  /** 是否显示关闭按钮，默认 true */
  showCloseButton?: boolean;
  /** 额外的 className */
  className?: string;
}
```

### 2.2 动画实现方案

使用 CSS transition 实现滑动效果：

```css
/* 面板容器 */
.slide-panel {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  background: #FFFFFF;
  border-left: 1px solid #E5E5E5;
  transform: translateX(100%);
  transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-panel.open {
  transform: translateX(0);
}
```

### 2.3 主内容区收缩方案

主内容区域需要同步收缩：

```css
/* 主内容区域 */
.main-content {
  transition: margin-right 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

.main-content.panel-open {
  margin-right: 800px; /* 或使用 CSS 变量 */
}
```

### 2.4 完整组件代码

```tsx
import React from 'react';
import { X } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';

// Helper to start window dragging
const startDrag = async (e: React.MouseEvent) => {
  if (e.button !== 0) return;
  try {
    await getCurrentWindow().startDragging();
  } catch (err) {
    // Ignore errors in browser mode
  }
};

export interface SlidePanelProps {
  isOpen: boolean;
  width?: number;
  header?: React.ReactNode;
  children: React.ReactNode;
  onClose: () => void;
  duration?: number;
  showCloseButton?: boolean;
  className?: string;
}

export function SlidePanel({
  isOpen,
  width = 800,
  header,
  children,
  onClose,
  duration = 250,
  showCloseButton = true,
  className = '',
}: SlidePanelProps) {
  return (
    <div
      className={`
        absolute top-0 right-0 h-full
        bg-white border-l border-[#E5E5E5]
        flex flex-col
        transition-transform
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        ${className}
      `}
      style={{
        width: `${width}px`,
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Header */}
      {header && (
        <div
          className="flex h-14 flex-shrink-0 items-center justify-between border-b border-[#E5E5E5] px-7"
          onMouseDown={startDrag}
        >
          <div className="pointer-events-none flex w-full items-center justify-between [&_button]:pointer-events-auto [&_input]:pointer-events-auto">
            {header}
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="ml-2 flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E5E5] text-[#71717A] transition-colors hover:bg-[#FAFAFA] hover:text-[#18181B]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-7">
        {children}
      </div>
    </div>
  );
}

export default SlidePanel;
```

---

## 3. 模块重构方案

### 3.1 通用重构模式

每个模块的重构遵循相同模式：

1. **添加本地状态**：
   ```typescript
   const [selectedId, setSelectedId] = useState<string | null>(null);
   ```

2. **移除路由导航**：
   ```typescript
   // 原代码
   const handleItemClick = (id: string) => {
     navigate(`/xxx/${id}`);
   };

   // 新代码
   const handleItemClick = (id: string) => {
     setSelectedId(id);
   };
   ```

3. **添加 SlidePanel**：
   ```tsx
   <SlidePanel
     isOpen={!!selectedId}
     onClose={() => setSelectedId(null)}
     header={/* detailHeader 内容 */}
   >
     {/* detailContent 内容 */}
   </SlidePanel>
   ```

4. **主内容区收缩**：
   ```tsx
   <div
     className={`flex-1 overflow-y-auto transition-[margin] duration-250 ${selectedId ? 'mr-[800px]' : ''}`}
   >
     {/* 列表内容 */}
   </div>
   ```

### 3.2 Skills 模块重构

#### 文件：`src/pages/SkillsPage.tsx`

**改动要点**：
1. 从 `SkillDetailPage.tsx` 提取 `detailHeader` 和 `detailContent` 的代码
2. 添加 `selectedSkillId` 状态
3. 添加 `SlidePanel` 组件
4. 修改 `handleSkillClick` 为设置状态而非导航
5. 添加主内容区收缩动画

**需要提取的内容**（来自 SkillDetailPage.tsx）：
- `formatDate` 函数
- `formatRelativeTime` 函数
- `InfoItem` 组件
- `ConfigItem` 组件
- `SceneChip` 组件
- `categoryColors` 映射
- `detailHeader` JSX
- `detailContent` JSX

### 3.3 MCP Servers 模块重构

#### 文件：`src/pages/McpServersPage.tsx`

**改动要点**：
1. 从 `McpDetailPage.tsx` 提取 Detail 内容
2. 添加 `selectedMcpId` 状态
3. 添加 `SlidePanel` 组件

**需要提取的内容**（来自 McpDetailPage.tsx）：
- `iconMap` 和 `getMcpIcon` 函数
- `getToolIcon` 函数
- `ToolItem` 组件
- `mockScenes` 数据
- `detailHeader` JSX
- `detailContent` JSX

### 3.4 Scenes 模块重构

#### 文件：`src/pages/ScenesPage.tsx`

**改动要点**：
1. 从 `SceneDetailPage.tsx` 提取 Detail 内容
2. 添加 `selectedSceneId` 状态
3. 添加 `SlidePanel` 组件

**需要提取的内容**（来自 SceneDetailPage.tsx）：
- `sceneIconMap`、`skillIconMap`、`mcpIconMap` 和相关函数
- `IncludedItem` 组件
- `ProjectChip` 组件
- `mockProjects` 数据
- `formatDate` 函数
- Detail 的 Skills/MCPs 列表逻辑
- `detailHeader` JSX
- `detailContent` JSX

### 3.5 Projects 模块重构

#### 文件：`src/pages/ProjectsPage.tsx`

**改动要点**：
Projects 模块已经有内置的 Detail 模式，但使用的是 `ListDetailLayout` 固定布局。需要：

1. 移除 `ListDetailLayout` 的使用
2. 统一使用 `SlidePanel` 滑动模式
3. 调整列表布局为收缩模式

**特殊处理**：
- Projects 的 List Panel 宽度是 400px（而非其他模块的 380px）
- 需要保留"创建新项目"的功能流程

---

## 4. 路由配置更新

### 文件：`src/App.tsx`

**修改前**：
```tsx
<Route path="skills" element={<SkillsPage />} />
<Route path="skills/:skillId" element={<SkillDetailPage />} />
<Route path="mcp-servers" element={<McpServersPage />} />
<Route path="mcp-servers/:id" element={<McpDetailPage />} />
<Route path="scenes" element={<ScenesPage />} />
<Route path="scenes/:id" element={<SceneDetailPage />} />
<Route path="projects" element={<ProjectsPage />} />
<Route path="projects/:id" element={<ProjectsPage />} />
```

**修改后**：
```tsx
<Route path="skills" element={<SkillsPage />} />
<Route path="mcp-servers" element={<McpServersPage />} />
<Route path="scenes" element={<ScenesPage />} />
<Route path="projects" element={<ProjectsPage />} />
```

**同时移除导入**：
```tsx
// 移除这些导入
import SkillDetailPage from './pages/SkillDetailPage';
import McpDetailPage from './pages/McpDetailPage';
import SceneDetailPage from './pages/SceneDetailPage';
```

---

## 5. 列表项样式统一（可选）

根据设计稿修改，Detail 模式下的列表项样式需要与主页面一致。这意味着：

### 5.1 样式规格

```typescript
// 统一的列表项样式
const listItemStyles = {
  container: {
    cornerRadius: '8px',        // 之前是 6px
    padding: '16px 20px',       // 之前是 12px 14px
    border: '1px solid #E5E5E5',
    gap: '14px',                // 之前是 12px
  },
  iconWrap: {
    size: '40px',               // 之前是 32-36px
    cornerRadius: '8px',        // 之前是 6px
    iconSize: '20px',           // 之前是 16px
  },
  text: {
    titleSize: '14px',          // 之前是 13px
    descSize: '12px',           // 之前是 11px
    infoGap: '4px',             // 之前是 2px
  },
  listGap: '12px',              // 之前是 4px
};
```

### 5.2 处理策略

**选项 A**：复用现有的 full variant
- 在 Detail 模式下也使用 full variant 的样式
- 需要隐藏某些不需要的元素（如 tags）

**选项 B**：创建新的 detail variant
- 新增 `variant="detail"` 选项
- 样式与 full 基本一致，但根据需要调整

**建议采用选项 A**，因为设计稿已经将样式统一了。

---

## 6. 动效细节设计

### 6.1 滑入动画时序

```
T+0ms:   用户点击列表项
T+0ms:   selectedId 状态更新
T+0ms:   Main Content 开始收缩 (margin-right 0 → 800px)
T+0ms:   SlidePanel 开始滑入 (translateX 100% → 0)
T+250ms: 动画完成
```

### 6.2 切换选中项

```
T+0ms:   用户点击另一个列表项
T+0ms:   selectedId 更新为新 ID
T+0ms:   Detail 内容立即切换（无动画）
         - SlidePanel 保持打开状态
         - 列表项选中态切换
```

### 6.3 关闭动画时序

```
T+0ms:   用户点击关闭按钮
T+0ms:   selectedId 设为 null
T+0ms:   Main Content 开始展开 (margin-right 800px → 0)
T+0ms:   SlidePanel 开始滑出 (translateX 0 → 100%)
T+250ms: 动画完成
```

### 6.4 列表项选中态变化

```css
/* 未选中 */
.list-item {
  background: transparent;
}
.list-item .icon-wrap {
  background: #FAFAFA;
}
.list-item .title {
  font-weight: 500;
}
.list-item .icon {
  color: #52525B;
}

/* 选中 */
.list-item.selected {
  background: #FAFAFA;
}
.list-item.selected .icon-wrap {
  background: #F4F4F5;
}
.list-item.selected .title {
  font-weight: 600;
}
.list-item.selected .icon {
  color: #18181B;
}
```

---

## 7. SubAgent 执行规划

### 7.1 Phase 1 - 基础设施（顺序执行）

**SubAgent 1: 创建 Git Worktree**
- 目标：创建隔离的工作分支
- 命令：
  ```bash
  cd /Users/bo/Documents/Development/Ensemble/Ensemble2
  git worktree add ../Ensemble2-detail-panel-refactor feature/detail-panel-refactor
  ```

**SubAgent 2: 创建 SlidePanel 组件**
- 目标：创建 `src/components/layout/SlidePanel.tsx`
- 依赖：SubAgent 1 完成
- 输入：本文档 Section 2 的组件规格
- 输出：完整的 SlidePanel 组件文件

### 7.2 Phase 2 - 模块重构（可并行）

**SubAgent 3-6: 四个模块重构**
- 可并行执行
- 每个 SubAgent 负责一个模块
- 依赖：SubAgent 2 完成（SlidePanel 组件已创建）

每个 SubAgent 的具体任务：

1. 阅读原 Detail 页面代码
2. 提取需要的内容到主页面
3. 添加 selectedId 状态
4. 添加 SlidePanel 组件
5. 修改点击处理为状态更新
6. 添加主内容区收缩动画

### 7.3 Phase 3 - 路由清理

**SubAgent 7: 更新路由配置**
- 依赖：SubAgent 3-6 全部完成
- 任务：修改 `src/App.tsx`

### 7.4 Phase 4 - 验证

**SubAgent 8: 测试验证**
- 依赖：SubAgent 7 完成
- 任务：
  1. 运行 `npm run tauri dev`
  2. 测试四个模块的滑动效果
  3. 验证功能完整性
  4. 截图对比设计稿

---

## 8. 风险与注意事项

### 8.1 潜在风险

1. **动画性能**：大量 DOM 元素可能导致动画卡顿
   - 缓解：使用 `transform` 而非 `width` 实现动画

2. **状态同步**：侧边栏导航可能影响选中状态
   - 缓解：导航时清除 selectedId

3. **响应式布局**：窗口尺寸变化时的处理
   - 缓解：使用 CSS calc 和相对单位

### 8.2 测试检查点

- [ ] Skills 模块滑动正常
- [ ] MCP Servers 模块滑动正常
- [ ] Scenes 模块滑动正常
- [ ] Projects 模块滑动正常
- [ ] 选中态样式正确
- [ ] Toggle 开关正常工作
- [ ] Icon Picker 正常工作
- [ ] 搜索筛选正常
- [ ] CreateSceneModal 正常弹出
- [ ] 窗口拖动正常
- [ ] 无 console 错误

---

## 9. 附录

### 9.1 颜色参考

| 名称 | 色值 | 用途 |
|------|------|------|
| 背景白 | #FFFFFF | 页面背景、面板背景 |
| 选中背景 | #FAFAFA | 选中项背景、图标容器 |
| 图标背景 | #F4F4F5 | 选中项图标容器 |
| 边框 | #E5E5E5 | 所有边框 |
| 主文字 | #18181B | 标题、名称 |
| 图标 | #52525B | 图标颜色 |
| 次要文字 | #71717A | 描述、标签 |

### 9.2 尺寸参考

| 名称 | 尺寸 |
|------|------|
| Sidebar 宽度 | 260px |
| Detail Panel 宽度 | 800px (Projects: fill) |
| List Panel 宽度（收缩后） | 380px (Projects: 400px) |
| Header 高度 | 56px |
| 动画时长 | 250ms |
| 缓动函数 | cubic-bezier(0.4, 0, 0.2, 1) |
