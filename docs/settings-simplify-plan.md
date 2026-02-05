# Settings 页面简化执行规划

## 1. 任务理解

### 1.1 用户最终需求
用户决定**完全移除 Settings 页面的 "Storage" 部分**，理由是：
- Claude Code 配置目录固定为 `~/.claude`，不会改变
- Skills/MCPs 的导入现在都在各自页面通过导入按钮完成，不需要 Settings 中的 "Detect & Import"

### 1.2 需要移除的内容
1. **Settings 页面 "Storage" Section** - 整个部分，包括：
   - Skills Source Directory
   - MCP Servers Source Directory
   - Claude Code Config Directory
   - Stats 显示 (Skills 0 • MCPs 0 • Scenes 0 • Size 0 MB)
   - Sync Configurations / "Detect & Import" 按钮

2. **ImportDialog 组件** - 点击 "Detect & Import" 后弹出的弹框

### 1.3 需要保留的内容（不动后端）
- `settingsStore.ts` 中的所有状态和方法
- 后端 Rust 代码中的所有命令
- `ImportDialog.tsx` 文件本身（但不渲染）
- `importStore.ts` 中的所有功能（Skills/MCPs 页面仍在使用）

## 2. 影响分析

### 2.1 前端文件变更

| 文件 | 变更类型 | 变更内容 |
|-----|---------|---------|
| `src/pages/SettingsPage.tsx` | 修改 | 移除 "Storage" Section (约 97 行代码) |
| `src/components/layout/MainLayout.tsx` | 修改 | 移除 `<ImportDialog />` 渲染 |

### 2.2 不需要变更的文件

| 文件 | 原因 |
|-----|------|
| `src/stores/settingsStore.ts` | 保留所有状态，使用默认值 |
| `src/stores/importStore.ts` | Skills/MCPs 页面仍使用导入功能 |
| `src/components/common/ImportDialog.tsx` | 保留文件，只是不再渲染 |
| `src-tauri/src/*` | 不修改任何后端代码 |

### 2.3 功能影响评估

| 功能 | 影响 | 说明 |
|-----|------|------|
| Skills 列表加载 | ✅ 无影响 | 使用默认值 `~/.ensemble/skills` |
| MCPs 列表加载 | ✅ 无影响 | 使用默认值 `~/.ensemble/mcps` |
| 配置检测 | ✅ 无影响 | 使用默认值 `~/.claude` |
| Skills 页面导入 | ✅ 无影响 | ImportSkillsModal 独立使用 |
| MCPs 页面导入 | ✅ 无影响 | ImportMcpModal 独立使用 |
| 首次启动导入提示 | ⚠️ 移除 | ImportDialog 不再渲染 |

## 3. 具体实施步骤

### 3.1 创建 Git Worktree
```bash
git worktree add ../Ensemble2-settings-simplify settings-simplify -b feature/settings-simplify
```

### 3.2 修改 SettingsPage.tsx

**文件位置**: `src/pages/SettingsPage.tsx`

**需要移除的代码块**（根据代码分析）：
1. 移除 "Storage" Section 的 JSX（从 `<Section title="Storage">` 到对应的 `</Section>`）
2. 保留其他 Section：CLAUDE.md、Launch Configuration、About

**需要移除的导入和状态**：
1. 移除 `stats` 相关的 destructure（如果有）
2. 移除 `detectExistingConfig` 相关的 import 和调用
3. 移除 `handleChangeDir` 函数中与 Storage 相关的逻辑（如果不再需要）

### 3.3 修改 MainLayout.tsx

**文件位置**: `src/components/layout/MainLayout.tsx`

**需要移除的代码**：
1. 移除 `<ImportDialog />` 组件的渲染
2. 移除相关的 import 语句

## 4. 验证清单

### 4.1 编译验证
- [ ] `npm run tauri dev` 无编译错误
- [ ] 无 TypeScript 类型错误
- [ ] 无 console 错误

### 4.2 功能验证
- [ ] Settings 页面正常显示（无 Storage Section）
- [ ] CLAUDE.md Section 正常工作
- [ ] Launch Configuration Section 正常工作
- [ ] About Section 正常显示
- [ ] Skills 页面导入功能正常
- [ ] MCPs 页面导入功能正常
- [ ] Skills 列表正常加载
- [ ] MCPs 列表正常加载

### 4.3 视觉验证
- [ ] Settings 页面布局正常
- [ ] 无多余空白或错位

## 5. 回滚方案

如果出现问题，使用 Git Worktree 可以快速回滚：
```bash
# 删除 worktree
git worktree remove ../Ensemble2-settings-simplify

# 删除分支（如果需要）
git branch -D feature/settings-simplify
```

## 6. 代码变更预览

### 6.1 SettingsPage.tsx 变更

移除整个 Storage Section，大约从第 245 行到第 342 行的代码：

```tsx
// 移除以下内容：
<Section title="Storage">
  <Row>
    {/* Skills Source Directory */}
  </Row>
  <Row>
    {/* MCP Servers Source Directory */}
  </Row>
  <Row>
    {/* Claude Code Config Directory */}
  </Row>
  <Row>
    {/* Stats 显示 */}
  </Row>
  <Row noBorder>
    {/* Sync Configurations / Detect & Import */}
  </Row>
</Section>
```

### 6.2 MainLayout.tsx 变更

移除 ImportDialog 渲染：

```tsx
// 移除以下内容：
import { ImportDialog } from '../common/ImportDialog';

// 在 JSX 中移除：
{/* Import Dialog for first-time config import */}
<ImportDialog />
```

## 7. 执行顺序

1. 创建 Git Worktree 和新分支
2. 读取并分析 SettingsPage.tsx 当前代码
3. 修改 SettingsPage.tsx，移除 Storage Section
4. 读取并分析 MainLayout.tsx 当前代码
5. 修改 MainLayout.tsx，移除 ImportDialog 渲染
6. 运行 `npm run tauri dev` 验证
7. 等待用户手动验证
8. 合并到 main 分支
