# 自动分类功能重构 - 验证指南

## 修改摘要

本次重构将自动分类功能从 Anthropic API 直接调用改为使用 Claude CLI，并为 Skills、MCPs、CLAUDE.md 三个模块都添加了自动分类功能。

### 核心变更

1. **后端 (Rust)**
   - `src-tauri/src/commands/classify.rs`: 完全重写，使用 Claude CLI 代替 Anthropic API
   - `ClassifyResult` 结构体添加了 `suggested_icon` 字段
   - `auto_classify` 函数移除了 `api_key` 参数，添加了 `available_icons` 参数

2. **前端类型**
   - `src/types/index.ts`: 添加了 `ClassifyItem` 和 `ClassifyResult` 类型导出
   - `src/components/common/IconPicker.tsx`: 导出了 `ICON_NAMES` 常量

3. **Skills 模块**
   - `src/stores/skillsStore.ts`: 更新 `autoClassify` 方法，移除 API Key 检查和过滤逻辑

4. **MCPs 模块（新增）**
   - `src/stores/mcpsStore.ts`: 添加了 `autoClassify` 方法和 `isClassifying` 状态
   - `src/pages/McpServersPage.tsx`: 添加了 "Auto Classify" 按钮

5. **CLAUDE.md 模块（新增）**
   - `src/stores/claudeMdStore.ts`: 添加了 `autoClassify` 方法和 `isAutoClassifying` 状态
   - `src/pages/ClaudeMdPage.tsx`: 添加了 "Auto Classify" 按钮

## 验证清单

### 1. Skills 页面
- [ ] 打开 Skills 页面
- [ ] 点击 "Auto Classify" 按钮
- [ ] 验证按钮显示 "Classifying..." 和旋转图标
- [ ] 验证分类完成后所有 Skills 都有 Category、Tags 和 Icon
- [ ] 验证新的分类和标签被正确创建（如果需要）

### 2. MCP Servers 页面
- [ ] 打开 MCP Servers 页面
- [ ] 验证 "Auto Classify" 按钮存在（在 "Import" 按钮左侧）
- [ ] 点击 "Auto Classify" 按钮
- [ ] 验证按钮显示 "Classifying..." 和旋转图标
- [ ] 验证分类完成后所有 MCPs 都有 Category、Tags 和 Icon

### 3. CLAUDE.md 页面
- [ ] 打开 CLAUDE.md 页面
- [ ] 验证 "Auto Classify" 按钮存在（在 "Scan System" 按钮左侧）
- [ ] 点击 "Auto Classify" 按钮
- [ ] 验证按钮显示 "Classifying..." 和旋转图标
- [ ] 验证分类完成后所有 CLAUDE.md 文件都有 Category、Tags 和 Icon

### 4. 错误处理
- [ ] 如果没有项目需要分类，应显示友好错误提示
- [ ] 如果 Claude CLI 不可用，应显示友好错误提示

### 5. UI 一致性
- [ ] Skills 页面按钮样式与现有一致
- [ ] MCP Servers 页面按钮布局正确（两个按钮并排）
- [ ] CLAUDE.md 页面按钮样式与其他按钮一致

### 6. 现有功能
- [ ] 导入功能正常
- [ ] 手动分类/标签修改正常
- [ ] 图标选择器正常
- [ ] 其他所有现有功能不受影响

## 分类质量检查

分类结果应该：
1. **Category**: 准确反映项目的主要功能领域
2. **Tags**: 2-5 个相关标签，具体且有描述性
3. **Icon**: 与项目功能匹配的 Lucide 图标

## 已知限制

1. 需要已安装 Claude CLI（`claude` 命令可用）
2. 分类大量项目时可能需要较长时间
3. `validate_api_key` 函数已标记为弃用但保留用于向后兼容

## Git Worktree 信息

- **分支名**: `feature/auto-classify-refactor`
- **工作目录**: `/Users/bo/Documents/Development/Ensemble/Ensemble2-auto-classify-refactor`

## 合并步骤（验证通过后）

```bash
# 1. 切换到主仓库
cd /Users/bo/Documents/Development/Ensemble/Ensemble2

# 2. 合并分支
git merge feature/auto-classify-refactor

# 3. 删除 worktree
git worktree remove ../Ensemble2-auto-classify-refactor

# 4. 删除分支（可选）
git branch -d feature/auto-classify-refactor
```
