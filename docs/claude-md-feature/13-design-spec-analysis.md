# CLAUDE.md 功能设计规范分析

> 创建时间: 2026-02-04
> SubAgent: A1 - 设计稿分析
> 设计稿: `/Users/bo/Documents/Development/Ensemble/设计稿/MCP 管理.pen`

---

## 一、全局设计规范

### 1.1 颜色系统

#### 基础颜色
| 用途 | 颜色值 | 说明 |
|------|--------|------|
| 主文字色 | `#18181B` | 标题、正文主色 |
| 次要文字色 | `#71717A` | 描述、路径、次要信息 |
| 占位符文字 | `#A1A1AA` | Input placeholder、disabled |
| 分类文字色 | `#52525B` | 分类项、标签文字 |

#### 背景颜色
| 用途 | 颜色值 | 说明 |
|------|--------|------|
| 页面背景 | `#FFFFFF` | 主背景 |
| 卡片背景 | `#FFFFFF` | 列表项背景 |
| 选中项背景 | `#FAFAFA` | 被选中的列表项 |
| 图标容器背景 | `#F4F4F5` | 图标圆角框背景 |
| 空状态图标背景 | `#F4F4F5` | 空状态页面图标背景 |
| 输入框背景 | `#FAFAFA` | 文件选择区域背景 |

#### 边框颜色
| 用途 | 颜色值 | 说明 |
|------|--------|------|
| 主边框色 | `#E5E5E5` | 卡片边框、分隔线 |
| 分隔线色 | `#E4E4E7` | 侧边栏分隔线 |
| 删除按钮边框 | `#FEE2E2` | Delete 按钮边框 |

#### 状态颜色
| 用途 | 颜色值 | 说明 |
|------|--------|------|
| 删除按钮图标/文字 | `#EF4444` | Delete 按钮 |
| 成功/Global 范围 | `#10B981` | Global scope 指示点 |
| 主色蓝 | `#3B82F6` | 分类图标、链接色 |

#### 类型角标颜色
| 类型 | 背景色 | 说明 |
|------|--------|------|
| GLOBAL | `#10B981` | 绿色，全局配置 |
| PROJECT | `#3B82F6` | 蓝色，项目级配置 |
| LOCAL | `#8B5CF6` | 紫色，本地配置 |

### 1.2 字体规范

#### 字体族
- 主字体: `Inter`
- 代码字体: `Monaco`

#### 字体规格
| 元素 | 字号 | 字重 | 行高 | 备注 |
|------|------|------|------|------|
| 页面标题 | 16px | 600 | - | Header 标题 |
| 卡片标题 | 14px | 600 | - | 文件名标题 |
| 列表项标题 | 13px | 500 | - | 详情页列表项名称 |
| 正文 | 14px | normal | - | 按钮文字、普通正文 |
| 次要正文 | 13px | normal | - | 输入框内容 |
| 描述文字 | 12px | normal | - | 路径、文件大小等 |
| 标签文字 | 12px | 500 | - | 标签内容 |
| 小标签 | 11px | normal/500 | - | 计数、角标文字 |
| Section 标题 | 10px | 600 | - | CATEGORIES 等大写标题 |
| 代码预览 | 12px | normal | 1.6 | Monaco 字体 |

### 1.3 间距规范

#### Padding
| 元素 | Padding | 说明 |
|------|---------|------|
| 页面内容区 | 24px 28px | top-bottom, left-right |
| 弹窗内容区 | 24px | 四周统一 |
| 卡片 | 20px | 列表页卡片 |
| 列表项 | 16px 20px | 详情页列表项 |
| 按钮 | 8px 14px | 标准按钮 |
| 标签 | 5px 10px / 6px 10px | 标签类元素 |

#### Gap
| 元素 | Gap | 说明 |
|------|-----|------|
| 卡片列表 | 12px | 文件列表间距 |
| 表单区块 | 20px | 弹窗内表单区块 |
| 表单项内 | 12px | Label 与 Input 间距 |
| 标签组 | 8px | 标签之间间距 |
| 按钮组 | 12px | 按钮之间间距 |
| 导航项 | 4px | 侧边栏导航项 |

### 1.4 圆角规范

| 元素 | 圆角值 | 说明 |
|------|--------|------|
| 弹窗 | 16px | Modal 容器 |
| 卡片 | 8px | 文件卡片、配置框 |
| 按钮 | 6px | 标准按钮 |
| 图标容器 | 8px | 图标背景框 |
| 标签 | 4px / 14px | 方标签 / 圆标签 |
| 角标 | 8px | Icon Overlay (16px/2) |
| Toggle 开关 | 11px | 22px 高度的一半 |

---

## 二、页面一：列表页 (Ensemble - CLAUDE.md Files)

### 2.1 页面结构

```
整体布局: 1440 x 900
├── Sidebar: 260px 宽
│   ├── Sidebar Header: 56px 高
│   ├── Sidebar Content: flex-1
│   │   ├── Nav Section
│   │   └── Bottom Section (Settings)
├── Main Content: fill_container
│   ├── Main Header: 56px 高
│   │   ├── Title: "CLAUDE.md Files"
│   │   └── Actions: [Scan System] [Import]
│   └── Content Area
│       └── Files Grid: 纵向排列
```

### 2.2 Header 区域

#### 左侧标题
- 文字: "CLAUDE.md Files"
- 字号: 16px
- 字重: 600
- 颜色: `#18181B`

#### 右侧按钮组

**Scan System 按钮（次要按钮）**
- 背景: 透明
- 边框: 1px solid `#E5E5E5`
- 圆角: 6px
- Padding: 8px 14px
- Gap: 8px
- 图标: `scan` (lucide), 16x16, `#18181B`
- 文字: "Scan System", 14px, normal, `#18181B`

**Import 按钮（主按钮）**
- 背景: `#18181B`
- 圆角: 6px
- Padding: 8px 14px
- Gap: 8px
- 图标: `plus` (lucide), 16x16, `#FFFFFF`
- 文字: "Import", 14px, 500, `#FFFFFF`

### 2.3 文件列表项 (fileItem)

#### 整体结构
- 宽度: fill_container
- 圆角: 8px
- 边框: 1px solid `#E5E5E5`
- Padding: 20px
- Gap: 16px
- 对齐: alignItems: center

#### 文件图标容器 (fileIcon)
- 尺寸: 48 x 48
- 背景: `#F4F4F5`
- 圆角: 8px
- 内容: 居中对齐
- 图标: `file-text` (lucide), 24x24, `#71717A`

#### 文件信息区 (fileInfo)
- 宽度: fill_container
- 布局: vertical
- Gap: 4px

##### 标题行 (fileTitle)
- Gap: 8px
- 对齐: center

**文件名**
- 字号: 14px
- 字重: 600
- 颜色: `#18181B`

**类型角标 (Badge)**
- 圆角: 4px
- Padding: 2px 8px
- 字号: 10px
- 字重: 600
- 文字色: `#FFFFFF`

| 类型 | 背景色 | 文字 |
|------|--------|------|
| GLOBAL | `#10B981` | "GLOBAL" |
| PROJECT | `#3B82F6` | "PROJECT" |
| LOCAL | `#8B5CF6` | "LOCAL" |

##### 路径行 (filePath)
- 字号: 12px
- 字重: normal
- 颜色: `#71717A`

##### 统计信息行 (fileStats)
- Gap: 16px
- 对齐: center
- 文字: 12px, normal, `#71717A`
- 内容示例: "2.4 KB", "Modified 2 days ago"

#### 操作按钮 (fileActions)

**查看按钮 (viewButton)**
- 尺寸: 32 x 32
- 边框: 1px solid `#E5E5E5`
- 圆角: 6px
- 内容: 居中
- 图标: `eye` (lucide), 16x16, `#71717A`

---

## 三、页面二：空状态页 (Ensemble - CLAUDE.md Empty)

### 3.1 页面结构

与列表页相同的 Header，内容区不同。

### 3.2 空状态内容 (Empty Content)

- 布局: vertical
- Gap: 24px
- 对齐: center (水平和垂直)

#### 空状态图标容器
- 尺寸: 80 x 80
- 背景: `#F4F4F5`
- 圆角: 20px
- 内容: 居中
- 图标: `file-text` (lucide), 40x40, `#A1A1AA`

#### 文字区域
- Gap: 8px
- 对齐: center

**标题**
- 内容: "No CLAUDE.md files yet"
- 字号: 16px
- 字重: 600
- 颜色: `#18181B`

**描述**
- 内容: "Import your first CLAUDE.md file or scan your system to get started"
- 字号: 14px
- 字重: normal
- 颜色: `#71717A`
- 行高: 1.5
- 对齐: center

#### 操作按钮区
- Gap: 12px
- 对齐: center
- 按钮样式同 Header 中的按钮

---

## 四、页面三：导入弹窗 (Import CLAUDE.md)

### 4.1 弹窗结构

```
整体: 1440 x 900 (遮罩层)
├── 遮罩背景: #00000066 (40% 透明度黑色)
└── Modal Dialog: 540 x 480
    ├── Modal Header: 56px 高
    ├── Modal Content: flex-1
    │   ├── Display Name 区域
    │   ├── Import Method 区域 (Radio 选择)
    │   └── Selected File 区域
    └── Modal Footer: 64px 高
```

### 4.2 弹窗容器 (Modal Dialog)

- 尺寸: 540 x 480
- 位置: x=450, y=210 (居中)
- 背景: `#FFFFFF`
- 圆角: 16px
- 布局: vertical

### 4.3 弹窗头部 (Modal Header)

- 高度: 56px
- 边框底部: 1px solid `#E5E5E5`
- Padding: 0 24px
- 对齐: space_between, center

**标题**
- 内容: "Import CLAUDE.md"
- 字号: 16px
- 字重: 600
- 颜色: `#18181B`

**关闭按钮**
- 尺寸: 32 x 32
- 圆角: 6px
- 图标: `x` (lucide), 18x18, `#71717A`

### 4.4 弹窗内容 (Modal Content)

- 布局: vertical
- Gap: 20px
- Padding: 24px

#### 表单顺序（从上到下）：
1. Display Name 区域
2. Import Method 区域
3. Selected File 区域

#### Import Method 区域

**区块标题**
- 内容: "Import Method"
- 字号: 14px
- 字重: 600
- 颜色: `#18181B`

**选项卡片 (fileOption / pathOption)**
- 圆角: 8px
- Padding: 16px
- Gap: 12px
- 对齐: center

**选中状态**
- 边框: 1.5px solid `#18181B`

**未选中状态**
- 边框: 1px solid `#E5E5E5`

**Radio 按钮**
- 尺寸: 16 x 16
- 圆角: 8px (圆形)
- 选中时: 边框 1.5px solid `#18181B`，内部圆点 8x8 `#18181B`
- 未选中时: 边框 1px solid `#E5E5E5`

**选项内容**
- 标题: 13px, 500, `#18181B`
- 描述: 12px, normal, `#71717A`

**选项文案**
| 选项 | 标题 | 描述 |
|------|------|------|
| Select File | "Select File" | "Browse and select a CLAUDE.md file from your system" |
| Enter Path | "Enter Path" | "Type the full path to the CLAUDE.md file" |

#### Selected File 区域

**区块标题**
- 内容: "Selected File"
- 字号: 14px
- 字重: 600
- 颜色: `#18181B`

**文件浏览区 (fileBrowser)**
- 尺寸: fill_container x 120px
- 背景: `#FAFAFA`
- 边框: 1px solid `#E5E5E5`
- 圆角: 8px
- 布局: vertical
- Gap: 12px
- Padding: 16px
- 对齐: center

**上传图标**
- 图标: `upload` (lucide), 32x32, `#71717A`

**上传文字**
- 主文字: "Click to browse or drag and drop"
- 字号: 13px, normal, `#71717A`

**提示文字**
- 内容: "CLAUDE.md files only"
- 字号: 11px, normal, `#A1A1AA`

#### Display Name 区域

**区块标题**
- 内容: "Display Name"
- 字号: 14px
- 字重: 600
- 颜色: `#18181B`

**输入框 (nameInput)**
- 高度: 36px
- 边框: 1px solid `#E5E5E5`
- 圆角: 6px
- Padding: 8px 12px

**Placeholder**
- 内容: "Enter a name for this CLAUDE.md"
- 字号: 13px
- 颜色: `#A1A1AA`

### 4.5 弹窗底部 (Modal Footer)

- 高度: 64px
- 边框顶部: 1px solid `#E5E5E5`
- Gap: 12px
- Padding: 0 24px
- 对齐: end, center

**Cancel 按钮**
- 边框: 1px solid `#E5E5E5`
- 圆角: 6px
- Padding: 8px 16px
- 文字: "Cancel", 14px, normal, `#18181B`

**Import 按钮**
- 背景: `#18181B`
- 圆角: 6px
- Padding: 8px 16px
- 文字: "Import", 14px, 500, `#FFFFFF`

---

## 五、页面四：详情页 (CLAUDE.md Detail)

### 5.1 页面结构

```
整体: 1440 x 900
├── Sidebar: 260px
├── Main Content: 1180px
│   ├── List Panel: 380px
│   │   ├── List Header: 56px
│   │   └── List Content: 文件列表
│   └── Detail Panel: 800px
│       ├── Detail Header: 56px
│       └── Detail Content
│           ├── Info Section
│           ├── Preview Section
│           ├── Configuration Section
│           ├── Source Section
│           └── Scenes Section
```

### 5.2 列表面板 (List Panel)

- 宽度: 380px
- 边框右: 1px solid `#E5E5E5`
- 布局: vertical

#### List Header
- 高度: 56px
- 边框底: 1px solid `#E5E5E5`
- Padding: 0 20px
- 对齐: space_between, center

**标题**
- "All Files", 14px, 600, `#18181B`

**计数**
- "3", 14px, normal, `#71717A`

#### List Item（列表项）

**选中状态**
- 背景: `#FAFAFA`
- 边框: 1px solid `#E5E5E5`
- 圆角: 8px
- Padding: 16px 20px
- Gap: 12px

**未选中状态**
- 背景: 透明
- 边框: 1px solid `#E5E5E5`
- 圆角: 8px
- Padding: 16px 20px
- Gap: 12px

**列表项图标**
- 尺寸: 40 x 40
- 背景: `#F4F4F5` / `#FAFAFA`
- 圆角: 8px
- 图标: `file-text`, 16x16, `#71717A`

**列表项信息**
- 名称: 13px, 500 (选中) / normal (未选中), `#18181B`
- 路径: 11px, normal, `#71717A`

### 5.3 详情面板 (Detail Panel)

- 宽度: 800px
- 布局: vertical

#### Detail Header

- 高度: 56px
- 边框底: 1px solid `#E5E5E5`
- Padding: 0 28px
- 对齐: space_between, center

**左侧内容**
- Gap: 12px
- 对齐: center

**文件图标**
- 尺寸: 36 x 36
- 背景: `#F4F4F5`
- 圆角: 8px
- 图标: `file-text`, 20x20, `#71717A`

**标题区域**
- Gap: 2px
- 布局: vertical
- 标题: 15px, 600, `#18181B`
- 路径: 12px, normal, `#71717A`

**右侧按钮组**
- Gap: 8px

**Edit 按钮**
- 高度: 32px
- 边框: 1px solid `#E5E5E5`
- 圆角: 6px
- Padding: 0 12px
- Gap: 6px
- 图标: `edit`, 14x14, `#18181B`
- 文字: "Edit", 13px, normal, `#18181B`

**Delete 按钮**
- 高度: 32px
- 边框: 1px solid `#FEE2E2`
- 圆角: 6px
- Padding: 0 12px
- Gap: 6px
- 图标: `trash-2`, 14x14, `#EF4444`
- 文字: "Delete", 13px, normal, `#EF4444`

**Close 按钮**
- 尺寸: 32 x 32
- 边框: 1px solid `#E5E5E5`
- 圆角: 6px
- 图标: `x`, 14x14, `#71717A`

#### Detail Content

- Padding: 12px 28px 28px 28px
- Gap: 28px
- 布局: vertical

#### Info Section

**信息行 (infoRow)**
- Gap: 32px
- 宽度: fill_container

**信息项 (infoItem)**
- Gap: 4px
- 布局: vertical
- Label: 11px, 500, `#71717A`
- Value: 13px, normal, `#18181B`

| Label | 示例值 |
|-------|--------|
| Type | User Configuration |
| File Size | 2.4 KB |
| Modified | 2 days ago |

**Category 选择器**
- 边框: 1px solid `#E5E5E5`
- 圆角: 6px
- Padding: 6px 10px
- Gap: 8px
- 颜色圆点: 8x8, 圆角4, `#3B82F6`
- 文字: 13px, normal, `#18181B`
- 下拉图标: `chevron-down`, 14x14, `#71717A`

**Tags 区域**
- Gap: 8px

**可删除标签**
- 边框: 1px solid `#E5E5E5`
- 圆角: 6px
- Padding: 6px 10px
- Gap: 6px
- 文字: 12px, 500, `#18181B`
- X 图标: 12x12, `#A1A1AA`

**添加标签按钮**
- 边框: 1px solid `#E5E5E5`
- 圆角: 6px
- Padding: 6px 10px
- Gap: 4px
- + 图标: 12x12, `#A1A1AA`
- 文字: "Add", 12px, 500, `#A1A1AA`

#### Preview Section

**Section 标题**
- "Preview", 14px, 600, `#18181B`

**预览框**
- 背景: `#FAFAFA`
- 边框: 1px solid `#E5E5E5`
- 圆角: 8px
- Padding: 16px
- Gap: 12px

**代码内容**
- 字体: Monaco
- 字号: 12px
- 行高: 1.6
- 颜色: `#18181B`

#### Configuration Section

**Section 标题**
- "Configuration", 14px, 600, `#18181B`

**配置框**
- 边框: 1px solid `#E5E5E5`
- 圆角: 8px
- 布局: vertical

**Scope 行**
- 边框底: 1px solid `#E5E5E5`
- Padding: 12px 14px
- Gap: 10px
- 对齐: center

**Label**
- "Scope", 13px, normal, `#71717A`

**Dropdown**
- 边框: 1px solid `#E5E5E5`
- 圆角: 6px
- Padding: 6px 10px
- Gap: 8px
- 范围圆点: 8x8, 圆角4, `#10B981` (Global)
- 文字: "Global", 13px, normal, `#18181B`
- 下拉图标: `chevron-down`, 14x14, `#71717A`

**Distribution Path 行**
- Padding: 12px 14px
- Gap: 10px
- 对齐: center
- Label: "Distribution Path", 13px, normal, `#71717A`
- Value: "./.claude/CLAUDE.md", 13px, normal, `#18181B`

#### Source Section

**Section 标题**
- "Source", 14px, 600, `#18181B`

**Source Box**
- 边框: 1px solid `#E5E5E5`
- 圆角: 8px
- Padding: 16px
- Gap: 12px

**Source 项**
- Gap: 10px
- Label: 13px, normal, `#71717A`
- Value: 13px, normal, `#18181B`

| Label | 示例值 |
|-------|--------|
| Type | User Configuration |
| Location | ~/.claude/CLAUDE.md |

#### Scenes Section

**Section 标题**
- "Used in Scenes", 14px, 600, `#18181B`

**Scene Chips**
- Gap: 8px

**单个 Chip**
- 边框: 1px solid `#E5E5E5`
- 圆角: 6px
- Padding: 8px 14px
- Gap: 8px
- 图标: `layers`, 14x14, `#71717A`
- 文字: 13px, normal, `#18181B`

---

## 六、页面五：Settings 页面 (CLAUDE.md 设置区域)

### 6.1 Settings 页面结构

Settings 页面遵循现有设计模式，CLAUDE.md 相关设置需要添加到现有 Settings 页面中。

### 6.2 Distribution Path 设置

在 Settings 页面中添加 CLAUDE.md 配置区块：

**Section 标题**
- "CLAUDE.md", 14px, 600, `#18181B`

**配置框**
- 边框: 1px solid `#E5E5E5`
- 圆角: 8px

**Distribution Path 设置项**
- Padding: 12px 20px
- 对齐: space_between, center

**左侧**
- 布局: vertical
- Gap: 4px
- Label: "Distribution Path", 13px, 500, `#18181B`
- Description: "Choose where to place CLAUDE.md in project folders", 12px, normal, `#71717A`

**右侧 Dropdown**
- 边框: 1px solid `#E5E5E5`
- 圆角: 6px
- Padding: 8px 12px
- Gap: 8px
- 当前值: "./.claude/CLAUDE.md", 13px, normal, `#18181B`
- 下拉图标: `chevron-down`, 14x14, `#71717A`

**可选值**
1. `./.claude/CLAUDE.md` (默认)
2. `./CLAUDE.md`
3. `./CLAUDE.local.md`

---

## 七、组件规范

### 7.1 Toggle 开关组件

**整体容器**
- 宽度: 40px
- 高度: 22px
- 圆角: 11px (高度的一半)
- Padding: 2px

**开启状态**
- 背景: `#18181B`
- Knob 位置: 右侧 (justifyContent: end)

**关闭状态**
- 背景: `#E5E5E5`
- Knob 位置: 左侧 (justifyContent: start)

**Knob (滑块)**
- 尺寸: 18 x 18
- 背景: `#FFFFFF`
- 圆角: 9px (圆形)

### 7.2 Icon Overlay (角标系统)

基于设计稿中的 "Version 3: Subtle Icon Overlay" 设计。

**Icon Container**
- 尺寸: 40 x 40
- 布局: none (absolute positioning)

**主图标容器 (Icon Wrap)**
- 位置: x=0, y=0
- 尺寸: 40 x 40
- 背景: `#FAFAFA`
- 圆角: 8px
- 内容: 居中
- 图标: 20x20

**角标 (Plugin Overlay)**
- 位置: x=28, y=-4 (相对于容器右上角)
- 尺寸: 16 x 16
- 圆角: 8px (圆形)
- 边框: 2px solid `#FFFFFF`
- 内容: 居中
- 图标: 8x8, `#FFFFFF`

**角标类型颜色**
| 类型 | 背景色 | 图标 |
|------|--------|------|
| Global | `#7C3AED` (紫色) | `globe` |
| Project | `#0EA5E9` (青色) | `folder` |
| Local | `#F59E0B` (橙色) | `user` |

> **注意**: 设计稿中实际使用的角标背景色可能与任务说明中的有所不同。
> 设计稿中 Plugin Overlay 使用 `#3B82F6` (蓝色)，但根据任务要求：
> - Global: `#7C3AED`
> - Project: `#0EA5E9`
> - Local: `#F59E0B`

### 7.3 类型角标 Badge

**Badge 容器**
- 圆角: 4px
- Padding: 2px 8px

**Badge 文字**
- 字号: 10px
- 字重: 600
- 颜色: `#FFFFFF`

**类型样式**
| 类型 | 背景色 | 文字 |
|------|--------|------|
| GLOBAL | `#10B981` | "GLOBAL" |
| PROJECT | `#3B82F6` | "PROJECT" |
| LOCAL | `#8B5CF6` | "LOCAL" |

### 7.4 Radio 选择器

**Radio 容器**
- 尺寸: 16 x 16
- 圆角: 8px (圆形)

**选中状态**
- 边框: 1.5px solid `#18181B`
- 内部圆点: 8 x 8, `#18181B`, 圆角4

**未选中状态**
- 边框: 1px solid `#E5E5E5`
- 无内部圆点

### 7.5 Dropdown 选择器

**容器**
- 边框: 1px solid `#E5E5E5`
- 圆角: 6px
- Padding: 6px 10px 或 8px 12px
- Gap: 8px

**内容**
- 可选: 颜色圆点 (8x8, 圆角4)
- 当前值文字: 13px, normal, `#18181B`
- 下拉图标: `chevron-down`, 14x14, `#71717A`

---

## 八、图标使用

所有图标使用 **Lucide** 图标库。

### 8.1 常用图标

| 用途 | 图标名称 | 尺寸 |
|------|----------|------|
| 文件 | `file-text` | 16/20/24/40 |
| 扫描 | `scan` | 16 |
| 添加 | `plus` | 12/16 |
| 关闭 | `x` | 12/14/18 |
| 编辑 | `edit` | 14 |
| 删除 | `trash-2` | 14 |
| 查看 | `eye` | 16 |
| 上传 | `upload` | 32 |
| Scene | `layers` | 14/16/18 |
| 文件夹 | `folder` | 8/16 |
| 全球 | `globe` | 8 |
| 用户 | `user` | 8 |
| 下拉箭头 | `chevron-down` | 14 |
| 设置 | `settings` | 18 |
| 服务器 | `server` | 18 |
| 代码 | `code-2` | 18 |

### 8.2 导航图标

| 导航项 | 图标 | 尺寸 |
|--------|------|------|
| Skills | `code-2` / `sparkles` | 16/18 |
| MCP Servers | `server` / `plug` | 16/18 |
| CLAUDE.md | `file-text` | 16/18 |
| Scenes | `layers` | 16/18 |
| Projects | `folder` | 16/18 |
| Settings | `settings` | 16/18 |

---

## 九、交互状态

### 9.1 按钮 Hover 状态

**主按钮 (Primary)**
- 默认: 背景 `#18181B`
- Hover: 背景 `#27272A` (略浅)

**次要按钮 (Secondary)**
- 默认: 背景透明, 边框 `#E5E5E5`
- Hover: 背景 `#F4F4F5`

**危险按钮 (Delete)**
- 默认: 边框 `#FEE2E2`, 文字 `#EF4444`
- Hover: 背景 `#FEE2E2`

### 9.2 列表项选中状态

**未选中**
- 背景: 透明
- 边框: 1px solid `#E5E5E5`

**选中**
- 背景: `#FAFAFA`
- 边框: 1px solid `#E5E5E5`

**Hover**
- 背景: `#F4F4F5`

### 9.3 导航项状态

**未选中**
- 背景: 透明
- 图标/文字: `#71717A`
- 字重: normal

**选中**
- 背景: `#F4F4F5`
- 图标/文字: `#18181B`
- 字重: 500

---

## 十、响应式注意事项

设计稿基于 1440 x 900 尺寸设计，实际实现时需要考虑：

1. **Sidebar**: 固定 260px 宽度
2. **List Panel**: 固定 380px 宽度
3. **Detail Panel**: 自适应宽度 (fill_container)
4. **Modal**: 固定 540px 宽度，垂直居中

---

## 十一、检查清单

- [x] 读取了所有 5 个页面节点
- [x] 提取了完整的布局规范
- [x] 提取了完整的颜色规范
- [x] 提取了完整的字体规范
- [x] 特别记录了角标系统细节
- [x] 特别记录了 Toggle 开关细节
- [x] 输出文档格式规范

---

*文档版本: 1.0*
*创建时间: 2026-02-04*
*SubAgent: A1*
