# CLAUDE.md 页面设计稿对齐 - SubAgent 执行规划

> 创建时间: 2026-02-04
> 状态: 执行中

---

## 一、设计稿信息

**设计稿路径**: `/Users/bo/Documents/Development/Ensemble/设计稿/MCP 管理.pen`

**相关页面节点**:
| 页面 | 节点 ID | 说明 |
|------|---------|------|
| 列表页 | P3AWE | CLAUDE.md 主列表页 |
| 空状态页 | 6zwvB | 无文件时的空状态 |
| 详情页 | 26KVC | 带详情面板的列表页 |

---

## 二、设计规格摘要

### 2.1 列表页 (P3AWE)

**页面布局**:
- Sidebar: 260px
- Main Content: fill

**Header**:
- 高度: 56px
- padding: 0 28px
- 标题: "CLAUDE.md Files", 16px, 600, #18181B
- 搜索框: 220px, height 32px, cornerRadius 6px, border #E5E5E5
- Scan System 按钮: icon=radar, height 32px, padding 0 12px, border #E5E5E5
- Import 按钮: icon=download, height 32px, padding 0 12px, border #E5E5E5

**文件卡片**:
- cornerRadius: 8px
- padding: 16px 20px
- gap: 14px
- border: 1px #E5E5E5
- fill: #FFFFFF
- 结构: Icon Container (40x40) | Info (name + path) | Tags | Actions (28x28)

**Icon Container** (40x40):
- layout: none (用于角标定位)
- 内含 Icon Wrap (40x40, bg #FAFAFA, cornerRadius 8px)
- 角标 Badge 定位于右上角

**Badge 角标规格**:
- 尺寸: 16x16
- cornerRadius: 8px (圆形)
- 边框: 2px 白色
- 位置: 相对于 Icon Container, x=28, y=-4
- 颜色:
  - Global: #7C3AED (紫色) + globe 图标
  - Project: #0EA5E9 (青色) + folder 图标
  - Local: #F59E0B (橙色) + user 图标

**Info 区域**:
- gap: 3px (vertical)
- Name: 14px, 500, #18181B
- Path: 12px, normal, #A1A1AA

**Tags 区域**:
- gap: 6px
- Category badge: bg #FAFAFA, cornerRadius 6px, padding 4px 8px
- Tag badge: 同上

### 2.2 空状态页 (6zwvB)

**Sidebar**:
- 显示 Categories 和 Tags 分区
- 与其他页面保持一致

**Header**:
- 只显示 "Scan System" 按钮，无 Import 按钮

**空状态内容**:
- 图标: file-text, 44x36 frame
- 文字: "No CLAUDE.md files"
- 副文字: "Import files to add your system to get started"
- 无按钮 (按钮在 header)

### 2.3 详情页 (26KVC)

**布局**:
- List Panel: 380px
- Detail Panel: fill (800px)

**List Panel**:
- Header: "All Files", height 56px, border-bottom
- 列表项: 简化版卡片，padding 16px 20px, gap 12px
- 列表项结构: Icon (40x40) | Info (name + path) | Actions

**Detail Panel**:
- Header: height 56px, padding 0 28px
  - 左侧: file icon (36x36) + title + subtitle
  - 右侧: close button (32x32)
- Content: padding 12px 28px 28px 28px, gap 28px

**Detail 内容区块**:
1. **Info Section** (gap 16px):
   - Info Row: File Size + Modified (gap 32px)
   - Category item: label + dropdown
   - Tags item: label + tags

2. **Preview Section** (gap 12px):
   - Title: "Preview", 14px, 600
   - Preview box: bg #FAFAFA, padding 16px, cornerRadius 8px

3. **Configuration Section** (gap 12px):
   - Title: "Configuration", 14px, 600
   - Config box: Set as Global toggle

4. **Source Section** (gap 12px):
   - Title: "Source", 14px, 600
   - Source box: Type + Location

5. **Used in Scenes Section** (gap 12px):
   - Title: "Used in Scenes", 14px, 600
   - Scenes grid: scene badges

---

## 三、SubAgent 任务

### SubAgent H1: 修复 ClaudeMdPage 列表页

**任务**: 修复 CLAUDE.md 列表页以匹配设计稿 P3AWE

**工作目录**: `/Users/bo/Documents/Development/Ensemble/Ensemble2-claude-md-feature`

**必须先阅读的文件**:
1. 本规划文档
2. `/Users/bo/Documents/Development/Ensemble/Ensemble2-claude-md-feature/src/pages/ClaudeMdPage.tsx`
3. `/Users/bo/Documents/Development/Ensemble/Ensemble2-claude-md-feature/src/components/claude-md/ClaudeMdCard.tsx`

**必须使用 Pencil MCP 工具获取设计稿详细信息**:
```
mcp__pencil__get_screenshot({ filePath: "/Users/bo/Documents/Development/Ensemble/设计稿/MCP 管理.pen", nodeId: "P3AWE" })
mcp__pencil__batch_get({ filePath: "/Users/bo/Documents/Development/Ensemble/设计稿/MCP 管理.pen", nodeIds: ["P3AWE"], readDepth: 6 })
```

**修复要点**:
1. Header 按钮使用正确的图标: radar (Scan System), download (Import)
2. 文件卡片结构: Icon Container (40x40, layout none) + Info + Tags + Actions
3. Badge 角标系统: 16x16 圆形, 2px 白色边框, 位于 Icon Container 右上角
4. 卡片样式: cornerRadius 8px, padding 16 20, gap 14, border #E5E5E5

### SubAgent H2: 修复空状态页

**任务**: 修复 CLAUDE.md 空状态页以匹配设计稿 6zwvB

**工作目录**: `/Users/bo/Documents/Development/Ensemble/Ensemble2-claude-md-feature`

**必须先阅读的文件**:
1. 本规划文档
2. `/Users/bo/Documents/Development/Ensemble/Ensemble2-claude-md-feature/src/pages/ClaudeMdPage.tsx`

**必须使用 Pencil MCP 工具获取设计稿详细信息**:
```
mcp__pencil__get_screenshot({ filePath: "/Users/bo/Documents/Development/Ensemble/设计稿/MCP 管理.pen", nodeId: "6zwvB" })
```

**修复要点**:
1. 空状态 header 只显示 "Scan System" 按钮，无 Import 按钮
2. 空状态图标使用 file-text
3. 空状态文字: "No CLAUDE.md files" + "Import files or scan your system to get started"
4. 空状态区域无按钮 (与当前实现不同)

### SubAgent H3: 修复详情面板

**任务**: 修复 CLAUDE.md 详情面板以匹配设计稿 26KVC

**工作目录**: `/Users/bo/Documents/Development/Ensemble/Ensemble2-claude-md-feature`

**必须先阅读的文件**:
1. 本规划文档
2. `/Users/bo/Documents/Development/Ensemble/Ensemble2-claude-md-feature/src/components/claude-md/ClaudeMdDetailPanel.tsx`

**必须使用 Pencil MCP 工具获取设计稿详细信息**:
```
mcp__pencil__get_screenshot({ filePath: "/Users/bo/Documents/Development/Ensemble/设计稿/MCP 管理.pen", nodeId: "26KVC" })
mcp__pencil__batch_get({ filePath: "/Users/bo/Documents/Development/Ensemble/设计稿/MCP 管理.pen", nodeIds: ["26KVC"], readDepth: 8 })
```

**修复要点**:
1. 详情面板布局: List Panel (380px) + Detail Panel (fill)
2. Detail Header: file icon (36x36) + title/subtitle + close button
3. Content sections: Info, Preview, Configuration, Source, Used in Scenes
4. 各 section 样式严格按照设计稿

---

## 四、输出要求

1. 所有修改必须能正常编译 (`npm run build`)
2. 视觉效果与设计稿 1:1 匹配
3. 不破坏现有功能
4. 修改完成后使用 `mcp__pencil__get_screenshot` 对比验证
