# 第三批 SubAgent 执行规划

> 创建时间: 2026-02-04
> 批次: 第三批（并行执行）
> 目的: 前端组件实现

---

## 一、执行概述

本批次包含 3 个 SubAgent，可并行执行。

| SubAgent | 编号 | 任务 | 模型 | 输出 |
|----------|------|------|------|------|
| 列表页实现 | C1 | ClaudeMdPage + ClaudeMdCard | Opus 4.5 | src/pages/ClaudeMdPage.tsx |
| 详情面板实现 | C2 | ClaudeMdDetailPanel | Opus 4.5 | src/components/claude-md/ClaudeMdDetailPanel.tsx |
| 导入弹窗实现 | C3 | ImportClaudeMdModal | Opus 4.5 | src/components/modals/ImportClaudeMdModal.tsx |

---

## 二、共同必读文档

所有 SubAgent 必须先阅读以下文档：

1. `/Users/bo/Documents/Development/Ensemble/Ensemble2-claude-md-feature/docs/claude-md-feature/13-design-spec-analysis.md` - **设计规范分析（最重要！包含所有 UI 规范）**
2. `/Users/bo/Documents/Development/Ensemble/Ensemble2-claude-md-feature/docs/claude-md-feature/14-code-structure-analysis.md` - 代码结构分析
3. `/Users/bo/Documents/Development/Ensemble/Ensemble2-claude-md-feature/docs/claude-md-feature/11-implementation-master-plan.md` - 总体执行计划

---

## 三、SubAgent C1: ClaudeMdPage（列表页）

### 3.1 任务目标

实现 CLAUDE.md 列表页，包含：
- 空状态页（无文件时显示）
- 列表页（有文件时显示）
- ClaudeMdCard 组件
- ClaudeMdBadge 组件

### 3.2 必读代码文件

1. `src/pages/SkillsPage.tsx` - 列表页模式参考
2. `src/pages/McpServersPage.tsx` - 另一个列表页参考
3. `src/components/skills/SkillListItem.tsx` - 卡片组件参考
4. `src/components/common/Badge.tsx` - Badge 组件参考
5. `src/stores/claudeMdStore.ts` - Store 使用方式

### 3.3 工作内容

1. **创建 `src/pages/ClaudeMdPage.tsx`**
   - Header: "CLAUDE.md Files" + "Scan System" + "Import" 按钮
   - 空状态: 当 files.length === 0
   - 文件列表: 使用 ClaudeMdCard 组件
   - 支持详情面板滑出动画（参考 SkillsPage）

2. **创建 `src/components/claude-md/ClaudeMdCard.tsx`**
   - 文件图标（48x48, 背景 #F4F4F5, 圆角 8px）
   - 文件名 + 类型 Badge
   - 文件路径
   - 统计信息（文件大小, 修改时间）
   - 标签列表
   - 操作按钮（查看）

3. **创建 `src/components/claude-md/ClaudeMdBadge.tsx`**
   - 三种类型：GLOBAL(绿 #10B981), PROJECT(蓝 #3B82F6), LOCAL(紫 #8B5CF6)
   - 圆角 4px, Padding 2px 8px
   - 文字 10px, 600, 白色

### 3.4 设计规范（从 13-design-spec-analysis.md）

**Header 区域:**
- 高度: 56px
- 边框底: 1px solid #E5E5E5
- Padding: 0 28px

**Scan System 按钮（次要）:**
- 背景: 透明
- 边框: 1px solid #E5E5E5
- 圆角: 6px
- Padding: 8px 14px
- 图标: scan (lucide), 16x16
- 文字: 14px, normal, #18181B

**Import 按钮（主要）:**
- 背景: #18181B
- 圆角: 6px
- Padding: 8px 14px
- 图标: plus (lucide), 16x16, 白色
- 文字: 14px, 500, 白色

**文件卡片:**
- 宽度: fill_container
- 圆角: 8px
- 边框: 1px solid #E5E5E5
- Padding: 20px
- Gap: 16px
- 背景: 白色（选中时 #FAFAFA）

**空状态:**
- 图标容器: 80x80, 背景 #F4F4F5, 圆角 20px
- 图标: file-text, 40x40, #A1A1AA
- 标题: 16px, 600, #18181B
- 描述: 14px, normal, #71717A

### 3.5 项目路径

`/Users/bo/Documents/Development/Ensemble/Ensemble2-claude-md-feature/`

### 3.6 创建文件夹

先创建目录: `mkdir -p src/components/claude-md`

---

## 四、SubAgent C2: ClaudeMdDetailPanel（详情面板）

### 4.1 任务目标

实现 CLAUDE.md 详情面板组件。

### 4.2 必读代码文件

1. `src/components/skills/SkillDetailPanel.tsx` - 详情面板参考
2. `src/components/mcps/McpDetailPanel.tsx` - 另一个详情面板参考
3. `src/components/layout/SlidePanel.tsx` - 滑动面板组件
4. `src/stores/claudeMdStore.ts` - Store 使用方式

### 4.3 工作内容

**创建 `src/components/claude-md/ClaudeMdDetailPanel.tsx`**

包含以下区域：

1. **Info Section**
   - Type, File Size, Modified（三列布局）
   - Category 选择器
   - Tags 列表（可添加/删除）

2. **Preview Section**
   - 代码预览框
   - 背景: #FAFAFA, 边框: 1px solid #E5E5E5, 圆角: 8px
   - 字体: Monaco, 12px, 行高 1.6

3. **Configuration Section**
   - "Set as Global" 开关
   - 描述: "Use this as ~/.claude/CLAUDE.md"
   - Toggle: 40x22, 圆角 11px, 背景 #18181B(开) / #E5E5E5(关)

4. **Source Section**
   - Type: User Configuration
   - Location: 文件路径

5. **Used in Scenes Section**
   - Scene 标签列表

### 4.4 设计规范

**Section 标题:**
- 14px, 600, #18181B

**Info Row:**
- Gap: 32px
- Label: 11px, 500, #71717A
- Value: 13px, normal, #18181B

**Configuration Box:**
- 边框: 1px solid #E5E5E5
- 圆角: 8px
- Row Padding: 16px
- Row 之间有 border-bottom

**Toggle 开关:**
- 宽度: 40px, 高度: 22px
- 圆角: 11px
- 开启: 背景 #18181B, knob 在右
- 关闭: 背景 #E5E5E5, knob 在左
- Knob: 18x18, 白色, 圆形

### 4.5 项目路径

`/Users/bo/Documents/Development/Ensemble/Ensemble2-claude-md-feature/`

---

## 五、SubAgent C3: ImportClaudeMdModal（导入弹窗）

### 5.1 任务目标

实现 CLAUDE.md 导入弹窗。

### 5.2 必读代码文件

1. `src/components/modals/ImportSkillsModal.tsx` - 导入弹窗参考
2. `src/components/modals/ImportMcpModal.tsx` - 另一个导入弹窗参考
3. `src/stores/claudeMdStore.ts` - Store 使用方式

### 5.3 工作内容

**创建 `src/components/modals/ImportClaudeMdModal.tsx`**

弹窗结构：
1. **Modal Header**（56px）
   - 标题: "Import CLAUDE.md"
   - 关闭按钮

2. **Modal Body**（flex-1）
   - Display Name 区域（输入框）
   - Import Method 区域（Radio 选择: Select File / Enter Path）
   - Selected File 区域（拖拽上传区域）

3. **Modal Footer**（60px）
   - Cancel 按钮
   - Import 按钮

### 5.4 设计规范

**Modal 容器:**
- 尺寸: 540 x 580
- 背景: #FFFFFF
- 圆角: 16px
- 遮罩: #00000066

**Modal Header:**
- 高度: 56px
- 边框底: 1px solid #E5E5E5
- Padding: 0 24px
- 标题: 16px, 600, #18181B
- 关闭按钮: 32x32, 图标 x (18x18, #71717A)

**表单区域 (Modal Body):**
- Padding: 24px
- Gap: 20px

**Display Name:**
- Label: 14px, 600, #18181B
- Input: 高度 36px, 边框 1px solid #E5E5E5, 圆角 6px
- Placeholder: 13px, #A1A1AA

**Import Method (Radio):**
- 选项卡片: 圆角 8px, Padding 16px
- 选中: 边框 1.5px solid #18181B
- 未选中: 边框 1px solid #E5E5E5
- Radio 圆点: 16x16, 选中时内部 8x8 黑色圆点

**Selected File 区域:**
- 高度: 120px
- 背景: #FAFAFA
- 边框: 1px solid #E5E5E5
- 圆角: 8px
- 图标: upload, 32x32, #71717A
- 主文字: 13px, #71717A
- 提示: 11px, #A1A1AA

**Modal Footer:**
- 高度: 60px
- 边框顶: 1px solid #E5E5E5
- Gap: 12px
- Cancel: 边框 1px solid #E5E5E5, 文字 #18181B
- Import: 背景 #18181B, 文字 白色

### 5.5 项目路径

`/Users/bo/Documents/Development/Ensemble/Ensemble2-claude-md-feature/`

---

## 六、执行检查清单

### SubAgent C1 检查项
- [ ] 读取了设计规范分析文档
- [ ] 创建了 claude-md 组件目录
- [ ] 实现了 ClaudeMdPage.tsx
- [ ] 实现了 ClaudeMdCard.tsx
- [ ] 实现了 ClaudeMdBadge.tsx
- [ ] 空状态 UI 与设计稿一致
- [ ] 列表 UI 与设计稿一致

### SubAgent C2 检查项
- [ ] 读取了设计规范分析文档
- [ ] 实现了 ClaudeMdDetailPanel.tsx
- [ ] Info Section UI 正确
- [ ] Preview Section UI 正确
- [ ] Configuration Section UI 正确
- [ ] Source Section UI 正确
- [ ] Used in Scenes Section UI 正确

### SubAgent C3 检查项
- [ ] 读取了设计规范分析文档
- [ ] 实现了 ImportClaudeMdModal.tsx
- [ ] Modal Header UI 正确
- [ ] Display Name 区域 UI 正确
- [ ] Import Method 区域 UI 正确
- [ ] Selected File 区域 UI 正确
- [ ] Modal Footer UI 正确

---

*文档版本: 1.0*
*创建时间: 2026-02-04*
