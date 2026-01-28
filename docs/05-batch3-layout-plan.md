# 批次 3: 布局组件开发 - SubAgent 执行规划

## 批次目标
实现应用的整体布局框架，包括 Sidebar 和各种布局模式。

---

## 设计规范参考文档
- `/docs/design/01-page-structure.md` - 布局结构概览
- `/docs/design/02-sidebar-design.md` - Sidebar 完整设计规范

---

## SubAgent 任务分配

### SubAgent A: Sidebar 组件
**文件**: `src/components/layout/Sidebar.tsx`

**设计规范** (来自 02-sidebar-design.md):
```
整体结构:
  - 宽度: 260px
  - 背景: #FFFFFF
  - 右边框: 1px #E5E5E5
  - 高度: fill (100vh)

Sidebar Header (56px):
  - Logo: 24x24, bg #18181B, radius 6px
  - App Name: "Ensemble", 14px/600, tracking -0.3px
  - 边框底部: 1px #E5E5E5
  - padding: 0 16px

Navigation Section:
  - padding: 16px
  - gap: 2px

  Nav Item (Normal):
    - height: 36px, padding: 0 10px, radius: 6px
    - Icon: 16x16, #71717A
    - Text: 13px/normal, #71717A
    - Count: 11px/500, #A1A1AA

  Nav Item (Active):
    - bg: #FFFFFF, border: 1px #E5E5E5
    - Icon: 16x16, #18181B
    - Text: 13px/500, #18181B

Categories Section:
  - Header: "CATEGORIES", 10px/600, #A1A1AA, letter-spacing 0.8px
  - Add Button: 20x20, icon plus 12x12
  - gap: 12px (header to content), 2px (items)

  Category Item:
    - height: 32px, padding: 0 10px, radius: 6px
    - Dot: 8x8 圆形
    - Text: 12px/normal, #71717A
    - Count: 11px/normal, #A1A1AA

  Category Item (Active):
    - bg: #FAFAFA
    - Text: 12px/500, #18181B

Tags Section:
  - Header: 同 Categories
  - Tags 网格: flex wrap, gap 6px
  - Tag Chip: padding 5px 10px, radius 4px, border 1px #E5E5E5
  - "+N" Button: 同样式

Sidebar Footer:
  - position: absolute bottom
  - padding: 16px
  - Settings Button: 32x32, radius 6px, icon 18x18 #71717A

Dividers:
  - 1px #E4E4E7
  - margin: 12px 0 (或根据上下文)
```

**组件接口**:
```typescript
interface SidebarProps {
  activeNav: 'skills' | 'mcp-servers' | 'scenes' | 'projects' | 'settings';
  activeCategory?: string | null;
  activeTags?: string[];
  categories: Category[];
  tags: Tag[];
  counts: {
    skills: number;
    mcpServers: number;
    scenes: number;
    projects: number;
  };
  onNavChange: (nav: string) => void;
  onCategoryChange: (category: string | null) => void;
  onTagToggle: (tag: string) => void;
  onAddCategory: () => void;
  onAddTag: () => void;
  onCategoryContextMenu: (category: Category, position: { x: number; y: number }) => void;
}
```

---

### SubAgent B: MainLayout 组件
**文件**: `src/components/layout/MainLayout.tsx`

**设计规范**:
```
整体布局:
  - display: flex
  - height: 100vh
  - width: 100vw
  - overflow: hidden

结构:
  Sidebar (260px) + Main Content (fill)
```

**组件接口**:
```typescript
// MainLayout.tsx
// 使用 React Router 的 Outlet 渲染子路由
```

---

### SubAgent C: ListDetailLayout 组件
**文件**: `src/components/layout/ListDetailLayout.tsx`

**设计规范**:
```
用于: Skill Detail, MCP Detail, Scene Detail, Projects

结构:
  List Panel (380px 或 400px) + Detail Panel (fill)

List Panel:
  - 宽度: 380px (Skills/MCP/Scenes) 或 400px (Projects)
  - border-right: 1px #E5E5E5
  - 内部结构:
    - List Header (56px): 标题 + Badge + 搜索/操作按钮
    - List Content: padding 12px, gap 4px

Detail Panel:
  - 宽度: fill
  - 内部结构:
    - Detail Header (56px): 内容名称 + 操作按钮
    - Detail Content: padding 28px
```

**组件接口**:
```typescript
interface ListDetailLayoutProps {
  listWidth?: number; // 默认 380
  listHeader: React.ReactNode;
  listContent: React.ReactNode;
  detailHeader?: React.ReactNode;
  detailContent?: React.ReactNode;
  emptyDetail?: React.ReactNode; // 无选中时显示
}
```

---

### SubAgent D: PageHeader 组件
**文件**: `src/components/layout/PageHeader.tsx`

**设计规范**:
```
单栏页面的顶部 Header (Skills 列表、MCP 列表、Scenes 列表等)

高度: 56px
padding: 0 28px
border-bottom: 1px #E5E5E5
display: flex, align-items: center, justify-content: space-between

左侧:
  - 标题: 16px/600, #18181B
  - 可选 Badge (状态徽章)

右侧:
  - 搜索框
  - 操作按钮
```

**组件接口**:
```typescript
interface PageHeaderProps {
  title: string;
  badge?: React.ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  actions?: React.ReactNode;
}
```

---

## 执行方式

SubAgent A (Sidebar) 最复杂，需要单独执行。
SubAgent B, C, D 可以并行执行。

## 输出要求

每个组件必须：
1. 严格按照设计稿尺寸和颜色
2. 使用 Tailwind CSS
3. 使用 lucide-react 图标
4. 支持所有状态变化
5. 导出 TypeScript 类型

完成后更新 `src/components/layout/index.ts`。
