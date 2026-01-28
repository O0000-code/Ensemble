# Projects 模块设计规范

## 一、模块概览

### 1.1 页面清单

| Node ID | 页面名称 | 布局类型 | 描述 |
|---------|----------|----------|------|
| `y0Mt4` | Projects 列表 | 双栏布局 | 项目列表 + 配置详情 |
| `F1YbB` | Projects 空状态 | 双栏布局 | 空列表 + 空详情 |
| `cdnEv` | 新建 Project | 双栏布局 | 项目列表 + 新建表单 |

### 1.2 布局特点

Projects 模块采用 **双栏布局**，与其他模块的主要区别：

- **List Panel 宽度**: 400px（比 Skills/MCP/Scenes 的 380px 宽 20px）
- **Detail Panel**: fill_container（约 780px）
- **整体结构**: Sidebar (260px) + List Panel (400px) + Detail Panel (fill)

---

## 二、Projects 列表页 (y0Mt4)

### 2.1 List Panel

#### List Header
- **高度**: 56px
- **内边距**: `padding: 0 20px`
- **底部边框**: `border-bottom: 1px solid #E5E5E5`
- **布局**: `justify-content: space-between; align-items: center`

| 元素 | 样式 |
|------|------|
| 标题 "Projects" | font-size: 16px, font-weight: 600, color: #18181B |
| 搜索框 | width: 160px, height: 32px, border-radius: 6px, border: 1px solid #E5E5E5 |
| 搜索图标 | lucide/search, 14x14, color: #A1A1AA |
| 搜索占位符 | font-size: 12px, color: #A1A1AA |

**注意**: 在新建项目状态下，搜索框被替换为 Add 按钮：
- **Add 按钮**: 32x32px, border-radius: 6px, fill: #18181B
- **图标**: lucide/plus, 16x16, color: #FFFFFF

#### List Content
- **内边距**: `padding: 12px`
- **列表项间距**: `gap: 4px`
- **布局**: `flex-direction: column`

#### Project Item（列表项）

```
布局结构:
┌─────────────────────────────────────────────────┐
│ [Project Name]                    [Scene Badge] │
│ [Project Path]                                  │
└─────────────────────────────────────────────────┘
```

**容器样式**:
- **内边距**: `padding: 12px 14px`
- **圆角**: `border-radius: 6px`
- **布局**: `justify-content: space-between; align-items: center`
- **宽度**: `fill_container`

**状态样式**:
| 状态 | 背景色 |
|------|--------|
| 默认 | transparent |
| 选中 | #FAFAFA |

**左侧内容 (projectLeft)**:
- **布局**: `flex-direction: column; gap: 2px`

| 元素 | 样式 |
|------|------|
| 项目名称 | font-size: 13px, font-weight: 500, color: #18181B |
| 项目路径 | font-size: 11px, font-weight: normal, color: #71717A |

**右侧 Scene Badge**:
- **内边距**: `padding: 3px 8px`
- **圆角**: `border-radius: 3px`

| 状态 | 背景色 | 文字样式 |
|------|--------|----------|
| 已关联场景（选中项） | #F4F4F5 | font-size: 10px, font-weight: 500, color: #18181B |
| 已关联场景（未选中） | #FAFAFA | font-size: 10px, font-weight: 500, color: #71717A |
| 无场景 | #FAFAFA | font-size: 10px, font-weight: normal, color: #A1A1AA |

---

### 2.2 Detail Panel（查看模式）

#### Detail Header
- **高度**: 56px
- **内边距**: `padding: 0 28px`
- **底部边框**: `border-bottom: 1px solid #E5E5E5`
- **布局**: `justify-content: space-between; align-items: center`

| 元素 | 样式 |
|------|------|
| 标题 "Project Configuration" | font-size: 16px, font-weight: 600, color: #18181B |

**Open Folder 按钮**:
- **高度**: 32px
- **内边距**: `padding: 0 12px`
- **圆角**: `border-radius: 6px`
- **边框**: `border: 1px solid #E5E5E5`
- **图标**: lucide/folder-open, 14x14, color: #71717A
- **文字**: font-size: 12px, font-weight: 500, color: #71717A
- **图标与文字间距**: `gap: 6px`

#### Detail Content
- **内边距**: `padding: 28px`
- **Section 间距**: `gap: 28px`
- **布局**: `flex-direction: column`

---

### 2.3 Project Info Section

```
布局结构:
┌─────────────────────────────────────────────────┐
│ [Folder Icon 48x48]  [Project Name - Large]     │
│                      [Project Path - Large]     │
└─────────────────────────────────────────────────┘
```

**Project Icon**:
- **容器**: 48x48px, border-radius: 10px, fill: #FAFAFA
- **图标**: lucide/folder, 24x24, color: #52525B
- **居中对齐**: `justify-content: center; align-items: center`

**项目信息文字**:
- **容器布局**: `flex-direction: column; gap: 4px`
- **行布局**: `gap: 16px; align-items: center`

| 元素 | 样式 |
|------|------|
| 项目名称 | font-size: 18px, font-weight: 600, color: #18181B |
| 项目路径 | font-size: 13px, font-weight: normal, color: #71717A |

---

### 2.4 Assigned Scene Section

**Section 标签**:
- **文字**: "ASSIGNED SCENE"
- **样式**: font-size: 10px, font-weight: 600, color: #A1A1AA, letter-spacing: 0.8px
- **与内容间距**: `gap: 12px`

#### Scene Selector 组件

```
布局结构:
┌─────────────────────────────────────────────────────────┐
│ [Scene Name]                          [Change ▼]        │
│ [12 Skills · 3 MCPs]                                    │
└─────────────────────────────────────────────────────────┘
```

**容器样式**:
- **内边距**: `padding: 16px 18px`
- **圆角**: `border-radius: 8px`
- **边框**: `border: 1px solid #E5E5E5`
- **布局**: `justify-content: space-between; align-items: center`
- **宽度**: `fill_container`

**左侧内容**:
- **布局**: `flex-direction: column; gap: 4px`

| 元素 | 样式 |
|------|------|
| Scene 名称 | font-size: 14px, font-weight: 500, color: #18181B |
| 统计信息 | font-size: 12px, font-weight: normal, color: #71717A |

**Change 按钮**:
- **内边距**: `padding: 6px 12px`
- **圆角**: `border-radius: 5px`
- **边框**: `border: 1px solid #E5E5E5`
- **文字**: font-size: 11px, font-weight: 500, color: #71717A
- **图标**: lucide/chevron-down, 12x12, color: #71717A
- **图标与文字间距**: `gap: 6px`

---

### 2.5 Configuration Status Section

**Section 标签**:
- **文字**: "CONFIGURATION STATUS"
- **样式**: font-size: 10px, font-weight: 600, color: #A1A1AA, letter-spacing: 0.8px
- **与内容间距**: `gap: 12px`

#### Config Cards 容器
- **布局**: `flex-direction: row; gap: 16px`
- **宽度**: `fill_container`

#### Config Card（Skills / MCP Servers）

```
布局结构:
┌─────────────────────────────────────┐
│ Skills                    [Synced]  │
│ .claude/skills/                     │
│ 12 symlinks active                  │
└─────────────────────────────────────┘
```

**容器样式**:
- **内边距**: `padding: 16px 18px`
- **圆角**: `border-radius: 8px`
- **边框**: `border: 1px solid #E5E5E5`
- **宽度**: `fill_container`
- **内部间距**: `gap: 12px`

**Header 行**:
- **布局**: `justify-content: space-between; align-items: center`

| 元素 | 样式 |
|------|------|
| 标题 (Skills / MCP Servers) | font-size: 13px, font-weight: 500, color: #18181B |

**Synced 状态徽章**:
- **内边距**: `padding: 3px 8px`
- **圆角**: `border-radius: 3px`
- **背景**: #DCFCE7 (绿色浅底)
- **文字**: font-size: 10px, font-weight: 600, color: #16A34A

**Meta 信息**:
- **布局**: `flex-direction: column; gap: 4px`

| 元素 | 样式 |
|------|------|
| 路径 | font-size: 12px, font-weight: normal, color: #71717A |
| 统计 | font-size: 11px, font-weight: normal, color: #A1A1AA |

---

### 2.6 Action Section

**布局**: `flex-direction: row; gap: 10px`

#### Sync Configuration 按钮 (Primary)
- **高度**: 36px
- **内边距**: `padding: 0 16px`
- **圆角**: `border-radius: 6px`
- **背景**: #18181B
- **图标**: lucide/refresh-cw, 14x14, color: #FFFFFF
- **文字**: font-size: 12px, font-weight: 500, color: #FFFFFF
- **图标与文字间距**: `gap: 6px`

#### Clear Config 按钮 (Secondary)
- **高度**: 36px
- **内边距**: `padding: 0 16px`
- **圆角**: `border-radius: 6px`
- **边框**: `border: 1px solid #E5E5E5`
- **背景**: transparent
- **图标**: lucide/trash-2, 14x14, color: #71717A
- **文字**: font-size: 12px, font-weight: 500, color: #71717A
- **图标与文字间距**: `gap: 6px`

---

## 三、Projects 空状态 (F1YbB)

### 3.1 List Panel 空状态

**Empty State 组件**:
- **居中显示**: `justify-content: center; align-items: center`
- **内部间距**: `gap: 14px`
- **布局**: `flex-direction: column`

**图形元素**:
- **Folder 图标**: 32x24px, stroke: #D4D4D8, stroke-width: 1.5px

**文字组**:
- **布局**: `flex-direction: column; gap: 4px; align-items: center`

| 元素 | 样式 |
|------|------|
| 主标题 "No projects" | font-size: 13px, font-weight: 500, color: #A1A1AA, letter-spacing: -0.2px |
| 副标题 "Open a folder to start" | font-size: 12px, font-weight: normal, color: #D4D4D8, text-align: center |

### 3.2 Detail Panel 空状态

**Header**:
- **标题**: "No Project Selected"
- **样式**: font-size: 16px, font-weight: 600, color: #18181B

**Empty State 组件**:
- **居中显示**: `justify-content: center; align-items: center`
- **内部间距**: `gap: 14px`
- **布局**: `flex-direction: column`

**图形元素**:
- **Arrow 图标**: 24x16px, stroke: #D4D4D8, stroke-width: 1.5px, cap: round, join: round

**文字组**:
- **布局**: `flex-direction: column; gap: 4px; align-items: center`

| 元素 | 样式 |
|------|------|
| 主标题 "Select a project" | font-size: 13px, font-weight: 500, color: #A1A1AA, letter-spacing: -0.2px |

---

## 四、新建 Project (cdnEv)

### 4.1 List Panel

#### List Header（新建模式）
- 搜索框被替换为 **Add 按钮**
- **Add 按钮**: 32x32px, border-radius: 6px, fill: #18181B
- **图标**: lucide/plus, 16x16, color: #FFFFFF

#### New Project Item（输入状态）

```
布局结构:
┌─────────────────────────────────────────────────┐
│ [New Project]                    [folder-plus]  │
│ [Click to configure path...]                    │
└─────────────────────────────────────────────────┘
```

**容器样式**:
- **内边距**: `padding: 12px 14px`
- **圆角**: `border-radius: 6px`
- **背景**: #FAFAFA
- **边框**: `border: 2px solid #18181B`（高亮选中状态）
- **布局**: `justify-content: space-between; align-items: center`

**左侧内容**:
- **布局**: `flex-direction: column; gap: 2px`

| 元素 | 样式 |
|------|------|
| 项目名称 "New Project" | font-size: 13px, font-weight: 500, color: #18181B |
| 提示文字 "Click to configure path..." | font-size: 11px, font-weight: normal, color: #71717A |

**右侧图标**:
- **图标**: lucide/folder-plus, 18x18, color: #71717A

---

### 4.2 Detail Panel（编辑模式）

#### Detail Header
- **标题**: "New Project Configuration"
- **样式**: font-size: 16px, font-weight: 600, color: #18181B

**Action 按钮组**:
- **布局**: `flex-direction: row; gap: 8px`

| 按钮 | 高度 | 内边距 | 圆角 | 背景 | 边框 | 文字样式 |
|------|------|--------|------|------|------|----------|
| Cancel | 32px | 0 14px | 6px | transparent | 1px solid #E5E5E5 | 12px, 500, #71717A |
| Create Project | 32px | 0 14px | 6px | #18181B | none | 12px, 500, #FFFFFF |

---

### 4.3 Project Information Section

**Section 标题**:
- **文字**: "Project Information"
- **样式**: font-size: 14px, font-weight: 600, color: #18181B
- **与内容间距**: `gap: 16px`

#### Name Field

**布局**: `flex-direction: column; gap: 6px`

**Label**:
- **文字**: "Project Name"
- **样式**: font-size: 12px, font-weight: 500, color: #52525B

**Input**:
- **高度**: 40px
- **内边距**: `padding: 0 12px`
- **圆角**: `border-radius: 6px`
- **边框**: `border: 1px solid #E5E5E5`
- **文字**: font-size: 13px, font-weight: normal, color: #18181B
- **宽度**: `fill_container`

#### Path Field

**布局**: `flex-direction: column; gap: 6px`

**Label**:
- **文字**: "Project Path"
- **样式**: font-size: 12px, font-weight: 500, color: #52525B

**Input with Browse Button**:
- **高度**: 40px
- **内边距**: `padding: 0 12px`
- **圆角**: `border-radius: 6px`
- **边框**: `border: 1px solid #E5E5E5`
- **布局**: `justify-content: space-between; align-items: center`
- **文字**: font-size: 13px, font-weight: normal, color: #18181B

**Browse 按钮（内嵌）**:
- **内边距**: `padding: 4px 8px`
- **圆角**: `border-radius: 4px`
- **背景**: #FAFAFA
- **图标**: lucide/folder-open, 12x12, color: #52525B
- **文字**: font-size: 11px, font-weight: 500, color: #52525B
- **图标与文字间距**: `gap: 4px`

---

### 4.4 Scene Configuration Section

**Section 标题**:
- **文字**: "Scene Configuration"
- **样式**: font-size: 14px, font-weight: 600, color: #18181B

**描述文字**:
- **文字**: "Select which scene to use for this project"
- **样式**: font-size: 12px, font-weight: normal, color: #71717A

**与 Select 间距**: `gap: 12px`

#### Scene Select 下拉框

```
布局结构:
┌─────────────────────────────────────────────────┐
│ [layers] Web Development                    [▼] │
└─────────────────────────────────────────────────┘
```

**容器样式**:
- **高度**: 44px
- **内边距**: `padding: 0 14px`
- **圆角**: `border-radius: 6px`
- **边框**: `border: 1px solid #E5E5E5`
- **布局**: `justify-content: space-between; align-items: center`
- **宽度**: `fill_container`

**左侧内容**:
- **布局**: `flex-direction: row; gap: 10px; align-items: center`
- **图标**: lucide/layers, 16x16, color: #52525B
- **文字**: font-size: 13px, font-weight: 500, color: #18181B

**右侧 Chevron**:
- **图标**: lucide/chevron-down, 16x16, color: #71717A

---

### 4.5 Configuration Status Section（验证状态）

**Section 标题**:
- **文字**: "Configuration Status"
- **样式**: font-size: 14px, font-weight: 600, color: #18181B
- **与内容间距**: `gap: 12px`

#### Status List
- **布局**: `flex-direction: column; gap: 8px`

#### Status Item（验证项）

```
布局结构:
┌─────────────────────────────────────────────────┐
│ [✓] Project name configured                     │
└─────────────────────────────────────────────────┘
```

**容器样式**:
- **布局**: `flex-direction: row; gap: 10px; align-items: center`

**Status Icon**:
- **容器**: 20x20px, border-radius: 10px (圆形)
- **居中对齐**: `justify-content: center; align-items: center`

| 状态 | 背景色 | 图标 | 图标颜色 |
|------|--------|------|----------|
| 成功 (Valid) | #DCFCE7 | lucide/check | #16A34A |
| 失败 (Invalid) | #FEE2E2 | lucide/x | #DC2626 |
| 待验证 | #F4F4F5 | lucide/minus | #A1A1AA |

**Status Text**:
- **样式**: font-size: 12px, font-weight: normal, color: #52525B

**验证项列表**:
1. "Project name configured"
2. "Project path is valid"
3. "Scene selected"

---

## 五、颜色规范汇总

### 5.1 文字颜色
| 用途 | 颜色 |
|------|------|
| 主标题 | #18181B |
| 次要文字 | #71717A |
| 辅助文字 | #A1A1AA |
| 占位符 | #D4D4D8 |
| 表单标签 | #52525B |

### 5.2 背景颜色
| 用途 | 颜色 |
|------|------|
| 页面背景 | #FFFFFF |
| 选中状态 | #FAFAFA |
| 徽章背景 | #F4F4F5 |
| 主按钮背景 | #18181B |

### 5.3 边框颜色
| 用途 | 颜色 |
|------|------|
| 默认边框 | #E5E5E5 |
| 分割线 | #E4E4E7 |
| 选中边框 | #18181B |

### 5.4 状态颜色
| 状态 | 背景色 | 文字颜色 |
|------|--------|----------|
| 成功/已同步 | #DCFCE7 | #16A34A |
| 错误 | #FEE2E2 | #DC2626 |
| 待处理 | #F4F4F5 | #A1A1AA |

---

## 六、图标规范

### 6.1 使用的 Lucide 图标

| 图标名 | 尺寸 | 用途 |
|--------|------|------|
| folder | 24x24 | 项目图标（大） |
| folder-open | 14x14 / 12x12 | 打开文件夹按钮 / Browse 按钮 |
| folder-plus | 18x18 | 新建项目提示 |
| search | 14x14 | 搜索框图标 |
| plus | 16x16 | 添加按钮 |
| refresh-cw | 14x14 | 同步按钮 |
| trash-2 | 14x14 | 清除按钮 |
| chevron-down | 12x12 / 16x16 | 下拉指示器 |
| layers | 16x16 | Scene 图标 |
| check | 12x12 | 验证成功 |
| x | 12x12 | 验证失败 |
| settings | 18x18 | 设置按钮 |

---

## 七、交互状态

### 7.1 Project Item 状态
| 状态 | 背景 | 边框 |
|------|------|------|
| 默认 | transparent | none |
| 悬停 | #FAFAFA | none |
| 选中 | #FAFAFA | none |
| 新建编辑中 | #FAFAFA | 2px solid #18181B |

### 7.2 按钮状态
| 按钮类型 | 默认 | 悬停 | 禁用 |
|----------|------|------|------|
| Primary | bg: #18181B | bg: #27272A | opacity: 0.5 |
| Secondary | border: #E5E5E5 | bg: #FAFAFA | opacity: 0.5 |

### 7.3 输入框状态
| 状态 | 边框 |
|------|------|
| 默认 | 1px solid #E5E5E5 |
| 聚焦 | 1px solid #18181B |
| 错误 | 1px solid #DC2626 |

---

## 八、响应式考虑

Projects 模块在 1440px 宽度下的固定布局：
- Sidebar: 260px (固定)
- List Panel: 400px (固定)
- Detail Panel: 780px (fill_container)

**最小支持宽度**: 1280px
**最大支持宽度**: 无限制（Detail Panel 自适应扩展）

---

## 九、组件复用关系

### 9.1 与其他模块共用的组件
- Sidebar（完全复用）
- List Header 结构（标题 + 操作区）
- Detail Header 结构（标题 + 按钮组）
- Empty State 组件（图标 + 文字组）
- Badge 组件（Scene Badge）
- Button 组件（Primary/Secondary）
- Input 组件

### 9.2 Projects 特有组件
- Scene Selector（带 Change 按钮的选择器）
- Config Card（Skills/MCP 配置状态卡片）
- Status Item（验证状态项）
- Path Input with Browse（带浏览按钮的路径输入框）
- New Project Item（新建项目列表项）
