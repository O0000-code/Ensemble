# SubAgent 执行规划文档 - Settings 页面简化

## 任务概述

本任务需要简化 Settings 页面，移除整个 "Storage" Section 和 ImportDialog 组件渲染。

## 工作目录

**重要**：所有修改都在 Git Worktree 中进行：
`/Users/bo/Documents/Development/Ensemble/Ensemble2-settings-simplify/`

## SubAgent 任务分配

### SubAgent 1: 修改 SettingsPage.tsx

**任务文件**: `/Users/bo/Documents/Development/Ensemble/Ensemble2-settings-simplify/src/pages/SettingsPage.tsx`

**执行步骤**:

1. 首先读取整个 SettingsPage.tsx 文件，完整理解其结构
2. 找到 "Storage" Section 的位置（应该是 `<Section title="Storage">...</Section>`）
3. 移除整个 "Storage" Section 的 JSX 代码
4. 检查并移除以下相关的 import 和变量使用（如果有）：
   - `isDetecting` 相关状态
   - `detectExistingConfig` 函数调用
   - `stats` 相关的 destructure
   - 与 Storage 相关的 `handleChangeDir` 调用
5. 保留其他所有代码不变
6. 确保文件能正确编译

**具体删除目标**:
- 删除 `<Section title="Storage">` 开始到对应 `</Section>` 结束的所有内容
- 删除不再使用的 import 或变量

**不要删除**:
- CLAUDE.md Section
- Launch Configuration Section
- About Section
- 任何这些 Section 使用的组件、import 或变量

### SubAgent 2: 修改 MainLayout.tsx

**任务文件**: `/Users/bo/Documents/Development/Ensemble/Ensemble2-settings-simplify/src/components/layout/MainLayout.tsx`

**执行步骤**:

1. 首先读取整个 MainLayout.tsx 文件
2. 找到 `<ImportDialog />` 的渲染位置
3. 移除 `<ImportDialog />` 组件的 JSX（包括注释）
4. 移除 `import { ImportDialog } from '../common/ImportDialog';` 语句
5. 确保文件能正确编译

**具体删除目标**:
```tsx
// 删除这个 import
import { ImportDialog } from '../common/ImportDialog';

// 删除这个渲染
{/* Import Dialog for first-time config import */}
<ImportDialog />
```

**不要删除**:
- 其他任何 import
- 其他任何组件渲染
- ImportDialog.tsx 文件本身（文件保留，只是不渲染）

## 验证要求

修改完成后，每个 SubAgent 需要验证：
1. 文件语法正确，无 TypeScript 错误
2. 没有意外删除其他代码
3. 删除的代码完全匹配目标

## 输出要求

每个 SubAgent 完成后需要报告：
1. 删除了哪些具体代码块
2. 是否有相关的 import 或变量也被清理
3. 最终文件状态确认
