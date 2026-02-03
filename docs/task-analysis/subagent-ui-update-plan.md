# SubAgent UI 更新执行规划

## 任务概述

根据设计稿更新 3 个 UI 需求，达到与设计稿 1:1 的效果。

## 依赖关系分析

```
需求1（导入弹框）─┐
                 ├─→ 并行执行（互不依赖）
需求2（列表项）──┤
                 │
需求3（Scene弹框）┘
```

三个需求相互独立，可以并行执行。

## 设计规格摘要

### 需求1：导入弹框 Tab 设计（节点 YFGFz、aSCOs）

**Modal 尺寸**：520×580px，圆角 16px

**Tab Row 布局**：
- 整行 `justifyContent: space-between`
- 左侧 Tabs：Local Tab + Plugins Tab
- 右侧选择区：分隔线 + 计数 + 分隔线 + All Checkbox

**Tab 样式**：
- 激活态：图标/文字颜色 #18181B，字重 600，底部 2px 指示线
- 非激活态：图标/文字颜色 #71717A，字重 normal，无指示线
- 图标：hard-drive（Local）、puzzle（Plugins），14×14px
- 计数徽章：背景 #F4F4F5，圆角 10px，padding 2px 8px

**Local Tab 列表项**：
- 结构：Checkbox + Info（名称 + 路径）
- 名称：13px/500 #18181B
- 路径：11px/normal #A1A1AA
- padding：10px 12px，gap：12px，圆角 6px

**Plugins Tab 列表项**：
- 结构：Checkbox + Info（名称行 + 描述）
- 名称行：名称 + Marketplace标识（store图标 9×9 + 文字）
- 描述：12px/normal #71717A
- padding：12px，gap：12px，圆角 6px

### 需求2：列表项插件来源标识（节点 V4Mrq）

**来自插件的列表项**：
- 左侧蓝色指示条：3×40px，颜色 #3B82F6，圆角 2px
- 图标容器：40×40px，背景 #FAFAFA，圆角 8px
- 插件角标：16×16px，背景 #3B82F6，圆角 8px，白色 2px 边框，位置 x:28 y:-4
- 角标内 puzzle 图标：8×8px，白色
- 信息区 gap：4px
- 描述行：描述 + "via {pluginName}"（11px #A1A1AA）
- 整体 padding：16px 20px，gap：14px，圆角 8px，边框 1px #E5E5E5

**本地列表项**：
- 无左侧蓝色指示条
- 无图标角标
- 其他样式保持不变

**注意**：设计稿有 Toggle 开关，但代码已移除开关，此处不需要实现开关。

### 需求3：Scene 创建弹框禁用项（节点 vicII）

**正常项**：
- Checkbox：20×20px，边框 2px #D4D4D4
- 图标：18×18px，颜色 #52525B
- 名称：13px/500 #18181B
- 描述：12px/normal #71717A
- 标签文字：#52525B
- padding：14px 16px，gap：14px，圆角 8px

**禁用项**：
- 整体 opacity：0.5
- Checkbox：20×20px，填充 #E5E5E5（无边框）
- 图标：颜色 #A1A1AA
- 名称行：名称 + Info 图标容器（16×16px，背景 #F4F4F5，圆角 8px）
- Info 图标：10×10px，颜色 #A1A1AA
- 名称：#A1A1AA
- 描述：#D4D4D8
- 标签文字：#D4D4D8

**Tooltip（hover Info 图标时）**：
- Info 图标容器背景变为 #18181B，图标变白色
- Tooltip 容器：背景 #18181B，圆角 6px，padding 8px 12px
- 标题："Already globally enabled"，12px/500 白色
- 说明：11px/normal #A1A1AA，固定宽度 220px

## SubAgent 执行规范

每个 SubAgent 必须：
1. 先读取本文档获取设计规格
2. 读取目标文件的当前代码
3. 严格按照设计规格修改代码
4. 确保样式与设计稿 1:1 匹配

## 执行计划

### Phase 1：并行执行三个需求

**SubAgent A - 需求1：导入弹框**
- 文件：ImportSkillsModal.tsx、ImportMcpModal.tsx
- 任务：更新 Tab 设计和列表项样式

**SubAgent B - 需求2：列表项**
- 文件：SkillListItem.tsx、McpListItem.tsx
- 任务：添加插件来源标识（蓝色指示条 + 角标 + via 文字）

**SubAgent C - 需求3：Scene 弹框**
- 文件：CreateSceneModal.tsx
- 任务：更新禁用项样式和 Tooltip

### Phase 2：验证

运行应用验证 UI 效果。
