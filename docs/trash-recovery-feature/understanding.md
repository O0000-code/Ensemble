# Trash Recovery Feature - 理解文档

## 一、任务背景

### 1.1 任务目标
在 Ensemble 应用的设置页面中添加"删除恢复"功能，让用户能够恢复被删除（移动到 trash 文件夹）的 Skills、MCPs 和 Claude.md 文件。

### 1.2 核心约束
1. **样式一致性**：弹框样式必须参考现有的 ImportSkillsModal 等导入弹框，保持完全一致的设计风格
2. **功能完整性**：不能影响任何现有功能和样式
3. **设计质量**：必须达到极高的设计质量水平，与现有 APP 完全一致

---

## 二、现有系统分析

### 2.1 Trash 回收站当前实现

#### 物理文件回收站
| 资源类型 | Trash 路径 | 删除命令 |
|---------|-----------|---------|
| Skills | `~/.ensemble/trash/skills/` | `delete_skill` |
| MCPs | `~/.ensemble/trash/mcps/` | `delete_mcp` |
| CLAUDE.md | `~/.ensemble/trash/claude-md/` | `delete_claude_md` |

#### 数据库软删除
| 资源类型 | 存储位置 | 删除命令 |
|---------|---------|---------|
| Scenes | `data.json` 中的 `trashed_scenes` 数组 | `delete_scene` |
| Projects | `data.json` 中的 `trashed_projects` 数组 | `delete_project` |

#### 删除时的处理
- 物理文件移动到 trash 目录时，如果同名文件已存在，会添加时间戳后缀 (格式: `{name}_{YYYYMMDD_HHMMSS}`)
- 同时从 `data.json` 中移除相关元数据
- **当前没有恢复功能的 UI 或 Rust 命令**

### 2.2 导入弹框设计规范

通过分析 `ImportSkillsModal.tsx`，确定了以下设计规范：

#### 整体尺寸
- 宽度：520px
- 高度：580px
- 圆角：16px (`rounded-[16px]`)
- 背景：白色 (`bg-white`)
- 阴影：`shadow-[0_25px_50px_rgba(0,0,0,0.1)]`

#### 遮罩层
- 固定定位：`fixed inset-0 z-50`
- 背景色：`bg-black/40`

#### 三段式布局

**Header (80px)**
```
- 高度：h-20
- 内边距：px-6
- 底部边框：border-b border-[#E5E5E5]
- 左侧：标题 (18px, font-semibold, #18181B) + 副标题 (13px, font-normal, #71717A)
- 右侧：关闭按钮 (32x32, 圆角 6px, X 图标 18x18, #A1A1AA)
```

**Tab 栏 (可选)**
```
- 布局：justify-between
- 左侧 Tabs：
  - 内边距：py-3 px-4
  - 图标：14x14
  - 文字：13px
  - 激活态：font-semibold, #18181B, 2px 底部指示器
  - 非激活态：font-normal, #71717A
  - Badge：rounded-[10px], px-2 py-0.5, 11px, #F4F4F5 背景
- 右侧：计数 + All 复选框
```

**Body (flex-1, overflow-y-auto)**
```
- 内边距：py-4 px-6
- 列表项间距：gap-0.5
- 列表项：
  - 内边距：py-2.5 px-3
  - 圆角：rounded-[6px]
  - 悬停：hover:bg-[#FAFAFA]
  - 复选框：16x16, 圆角 4px
  - 名称：13px, font-medium, #18181B
  - 描述/路径：11px, font-normal, #A1A1AA
```

**Footer**
```
- 高度：py-4 px-6
- 顶部边框：border-t border-[#E5E5E5]
- 左侧：Info 按钮 (28x28, 圆角 6px)
- 右侧：
  - Cancel 按钮：h-[36px] px-4, 圆角 6px, 边框, 13px, #71717A
  - 主按钮：h-[36px] px-5, 圆角 6px, bg-[#18181B], 13px, 白色
```

### 2.3 设置页面结构

文件：`src/pages/SettingsPage.tsx`

#### 当前 Sections
1. **Storage** - 存储配置
2. **CLAUDE.md** - CLAUDE.md 配置
3. **Launch Configuration** - 启动配置
4. **About** - 关于信息

#### 内部组件
- `SectionHeader` - 区块标题
- `Card` - 卡片容器
- `Row` - 行布局
- `ActionButton` - 文字按钮
- `CustomSelect` - 自定义下拉框

---

## 三、功能设计

### 3.1 恢复弹框设计 (`TrashRecoveryModal`)

#### 基本信息
- 弹框标题：**"Recover Deleted Items"**
- 副标题：动态显示 **"Found X items in trash"**
- 宽度：520px
- 高度：580px

#### Tab 设计
三个 Tab，用于切换不同类型的已删除项目：
1. **Skills** - 图标 `Wand2`，显示已删除的 Skills
2. **MCPs** - 图标 `Server`，显示已删除的 MCPs
3. **CLAUDE.md** - 图标 `FileText`，显示已删除的 CLAUDE.md 文件

#### 列表项设计
每个列表项显示：
- 复选框（用于多选恢复）
- 名称
- 删除时间（格式化为 "Deleted X days ago" 或具体日期）
- 原始路径（可选，作为次要信息）

#### Footer
- 左侧：Info 按钮
- 右侧：Cancel + **"Recover Selected"** 按钮

### 3.2 设置页面入口设计

在 **Storage** section 中添加新的 Row：

```
┌─────────────────────────────────────────────────────────┐
│ Trash                                                   │
│ Recover deleted Skills, MCPs, and CLAUDE.md files      │
│                                              [Manage]   │
└─────────────────────────────────────────────────────────┘
```

- Label：**Trash**
- 描述：**Recover deleted Skills, MCPs, and CLAUDE.md files**
- 按钮：**Manage** (次要按钮样式，点击打开 TrashRecoveryModal)

### 3.3 Rust 后端命令设计

#### 新增命令

**1. `list_trashed_items`**
```rust
#[tauri::command]
pub fn list_trashed_items(ensemble_dir: String) -> Result<TrashedItems, String>

struct TrashedItems {
    skills: Vec<TrashedSkill>,
    mcps: Vec<TrashedMcp>,
    claude_md_files: Vec<TrashedClaudeMd>,
}

struct TrashedSkill {
    id: String,           // 目录名（可能包含时间戳）
    name: String,         // 原始名称
    path: String,         // trash 中的完整路径
    deleted_at: String,   // 从目录名或文件时间戳推断
    description: String,  // 从 SKILL.md 读取
}

struct TrashedMcp {
    id: String,           // 文件名（可能包含时间戳）
    name: String,         // 原始名称
    path: String,         // trash 中的完整路径
    deleted_at: String,
    description: String,  // 从 JSON 读取
}

struct TrashedClaudeMd {
    id: String,           // 目录名
    name: String,         // 原始名称（从 info.json 读取）
    path: String,         // trash 中的完整路径
    deleted_at: String,
}
```

**2. `restore_skill`**
```rust
#[tauri::command]
pub fn restore_skill(trash_path: String, ensemble_dir: String) -> Result<(), String>
```
- 将 skill 从 trash 移回 `~/.ensemble/skills/`
- 如果存在同名 skill，返回错误

**3. `restore_mcp`**
```rust
#[tauri::command]
pub fn restore_mcp(trash_path: String, ensemble_dir: String) -> Result<(), String>
```
- 将 MCP 配置从 trash 移回 `~/.ensemble/mcps/`
- 如果存在同名 MCP，返回错误

**4. `restore_claude_md`**
```rust
#[tauri::command]
pub fn restore_claude_md(trash_path: String) -> Result<(), String>
```
- 将 CLAUDE.md 从 trash 移回 `~/.ensemble/claude-md/`
- 恢复到 `data.json` 中的 `claude_md_files` 数组

---

## 四、文件清单

### 4.1 需要新建的文件

| 文件路径 | 说明 |
|---------|------|
| `src/components/modals/TrashRecoveryModal.tsx` | 恢复弹框组件 |
| `src/stores/trashStore.ts` | 回收站状态管理 |
| `src/types/trash.ts` | 回收站相关类型定义 |
| `src-tauri/src/commands/trash.rs` | 回收站 Rust 命令 |

### 4.2 需要修改的文件

| 文件路径 | 修改内容 |
|---------|---------|
| `src/pages/SettingsPage.tsx` | 添加 Trash Row 和弹框入口 |
| `src/components/modals/index.ts` | 导出 TrashRecoveryModal |
| `src/stores/index.ts` | 导出 trashStore |
| `src/types/index.ts` | 导出 trash 类型 |
| `src-tauri/src/commands/mod.rs` | 声明 trash 模块 |
| `src-tauri/src/lib.rs` | 注册 trash 命令 |

---

## 五、颜色和样式速查表

### 颜色
| 用途 | 颜色值 |
|------|--------|
| 主文字 | #18181B |
| 次要文字 | #71717A |
| 辅助文字 | #A1A1AA |
| 边框 | #E5E5E5 |
| 复选框边框 | #D4D4D8 |
| 悬停背景 | #FAFAFA |
| Tab 徽章背景 | #F4F4F5 |
| 主按钮背景 | #18181B |
| 主按钮悬停 | #27272A |
| 遮罩层 | rgba(0,0,0,0.4) |

### 字体
| 元素 | 字号 | 字重 |
|------|------|------|
| 弹框标题 | 18px | 600 |
| 弹框副标题 | 13px | 400 |
| Tab 文字 | 13px | 400/600 |
| Tab Badge | 11px | 500 |
| 列表项名称 | 13px | 500 |
| 列表项描述 | 11px | 400 |
| 按钮文字 | 13px | 500 |

### 圆角
| 元素 | 圆角值 |
|------|--------|
| 弹框 | 16px |
| 按钮 | 6px |
| 复选框 | 4px |
| Tab Badge | 10px |
| 列表项 | 6px |

---

## 六、依赖关系

```
TrashRecoveryModal
├── 依赖 trashStore（状态管理）
├── 依赖 trash 类型（类型定义）
└── 调用 Rust 命令
    ├── list_trashed_items
    ├── restore_skill
    ├── restore_mcp
    └── restore_claude_md

SettingsPage
├── 导入 TrashRecoveryModal
└── 管理弹框打开/关闭状态
```
