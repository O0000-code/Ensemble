# 任务理解文档：Category/Tag 空状态修复与实现

## 1. 任务背景

Ensemble 是一个 macOS 桌面应用，用于管理 Claude Code 的 Skill 和 MCP。当前应用的侧边栏包含 Categories 和 Tags 筛选功能，用户可以点击它们来筛选 Skills 和 MCPs 列表。

## 2. Bug 描述

**现象**：在 Skills 页面的侧边栏中，点击那些没有关联任何 Skill 或 MCP 的 Category 或 Tag 时，页面没有任何变化/响应。

**期望行为**：
- 点击任何 Category 或 Tag（无论是否有关联内容）都应该切换到对应的筛选视图
- 如果该 Category 或 Tag 下没有任何 Skill 或 MCP，则显示空状态页面

## 3. 设计稿位置

- **设计文件**：`/Users/bo/Downloads/MCP 管理.pen`
- **Category 空状态**：`Ensemble - Skills (Filtered by Category, Empty)` - 节点 ID: `ytMhv`
- **Tag 空状态**：`Ensemble - Skills (Filtered by Tag, Empty)` - 节点 ID: `ZIFP8`

## 4. 空状态设计规范

### 4.1 Category 空状态

**页面结构**：
- Header 保持不变，显示当前选中的 Category 名称
- Header 右侧的绿色启用状态标签（Status Badge）应**隐藏**
- 内容区域显示居中的空状态组件

**空状态组件 - 图标**：
- 堆叠卡片设计（3层圆角矩形 + 2条内容暗示线）
- 最后层：36×22px，圆角4px，stroke #E4E4E7
- 中间层：36×22px，圆角4px，stroke #D4D4D8，白色填充
- 最前层：36×22px，圆角4px，stroke #A1A1AA，白色填充
- 内容线1：16px宽，stroke #D4D4D8，1.5px，round cap
- 内容线2：10px宽，stroke #E4E4E7，1.5px，round cap

**空状态组件 - 文字**：
- 标题："No items in this category"
  - 字体：Inter, 14px, weight 500, letter-spacing -0.2px
  - 颜色：#A1A1AA
- 描述："Try selecting a different category or add items to this one"
  - 字体：Inter, 13px, weight normal
  - 颜色：#D4D4D8
  - 文字居中对齐

### 4.2 Tag 空状态

**页面结构**：
- Header 保持不变，显示当前选中的 Tag 名称
- Header 右侧的绿色启用状态标签（Status Badge）应**隐藏**
- 内容区域显示居中的空状态组件

**空状态组件 - 图标**：
- 经典标签形态（3层带小孔的标签形状）
- 最后层：30×16px，圆角 [8,4,4,8]，stroke #E4E4E7，小孔 4×4px 填充 #E4E4E7
- 中间层：30×16px，圆角 [8,4,4,8]，stroke #D4D4D8，白色填充，小孔 4×4px 填充 #D4D4D8
- 最前层：30×16px，圆角 [8,4,4,8]，stroke #A1A1AA，白色填充，小孔 4×4px 填充 #A1A1AA

**空状态组件 - 文字**：
- 标题："No items with this tag"
  - 字体：Inter, 14px, weight 500, letter-spacing -0.2px
  - 颜色：#A1A1AA
- 描述："Try selecting a different tag or add this tag to some items"
  - 字体：Inter, 13px, weight normal
  - 颜色：#D4D4D8
  - 文字居中对齐

### 4.3 布局规范

- 图标与文字组之间：20px
- 标题与描述之间：6px
- 内容区域使用 flexbox 垂直水平居中

## 5. 实现要点

### 5.1 修复点击事件
确保侧边栏中所有 Category 和 Tag 的点击事件都能正常触发页面切换，无论它们是否有关联的 Skill/MCP

### 5.2 条件渲染逻辑
```typescript
if (selectedCategory && filteredSkills.length === 0 && filteredMCPs.length === 0) {
  // 渲染 Category 空状态
}

if (selectedTag && filteredSkills.length === 0 && filteredMCPs.length === 0) {
  // 渲染 Tag 空状态
}
```

### 5.3 隐藏启用状态标签
当显示空状态时，Header 中的绿色 "X enabled" 标签应该隐藏

## 6. 参考现有空状态

- `Ensemble - Skills (Empty)` - 节点 ID: `DqVji`
- `Ensemble - MCP Servers (Empty)` - 节点 ID: `ltFNv`
- `Ensemble - Scenes (Empty)` - 节点 ID: `LlxKB`

## 7. 约束条件

**必须确保**：
- 当前的修改不影响任何现有的功能和样式
- 所有 UI 细节（颜色、字体、间距、圆角）与设计稿 1:1 匹配
- 代码结构清晰，类型完整
- 无 console 错误和警告

## 8. 技术栈提醒

- 前端：React 18 + TypeScript 5 + Tailwind CSS 4
- 状态管理：Zustand
- 图标：Lucide Icons
- 后端：Tauri 2.x (Rust)
