# 代码质量检查 - 修改计划

## 一、调查结果汇总

### 1. Console 语句 (120 处)
| 分类 | 数量 | 处理方式 |
|-----|------|---------|
| console.log (调试) | 18 | 可安全移除 17 处（保留 1 处待人工确认） |
| console.warn (业务) | 56 | 保留 - 浏览器模式兼容性警告 |
| console.error (错误处理) | 46 | 保留 - 标准错误处理实践 |

### 2. 敏感信息
| 检查项 | 结果 |
|-------|------|
| 硬编码 API Key | 无风险 - 均为类型定义 |
| 硬编码密码 | 未发现 |
| 硬编码路径 | 1 处 - 占位符示例，合理 |
| .env 文件 | 不存在，.gitignore 已正确配置 |

### 3. 代码检查工具
| 工具 | 结果 |
|-----|------|
| ESLint | 未配置 |
| TypeScript | 通过，0 错误 |
| Vite Build | 成功，2 个低风险警告 |
| Cargo Clippy | 161 个风格建议警告 |

### 4. 依赖分析
| 依赖 | 状态 | 建议 |
|-----|------|------|
| @tauri-apps/plugin-dialog (npm) | 可能未使用 | 保留 - 需验证 Tauri 2.0 要求 |
| urlencoding (Rust) | 未使用 | 保留 - 需人工确认后移除 |

---

## 二、修改计划

### 2.1 将执行的修改（安全）

以下 17 个 `console.log` 语句确认为纯调试用途，移除不会影响任何功能：

#### 文件 1: src/pages/ScenesPage.tsx (3 处)
- 行 216: `console.log('handleCreateScene called with:', sceneData);`
- 行 220: `console.log('Calling safeInvoke add_scene...');`
- 行 228: `console.log('safeInvoke result:', newScene);`

#### 文件 2: src/stores/claudeMdStore.ts (8 处)
- 行 142: `console.log('[ClaudeMdStore] loadFiles called');`
- 行 147: `console.log('[ClaudeMdStore] get_claude_md_files result:', files);`
- 行 155: `console.log('[ClaudeMdStore] Files loaded, count:', files?.length || 0);`
- 行 205: `console.log('[ClaudeMdStore] importFile called with:', options);`
- 行 212: `console.log('[ClaudeMdStore] import_claude_md result:', result);`
- 行 215: `console.log('[ClaudeMdStore] Import success, adding file:', result.file);`
- 行 218: `console.log('[ClaudeMdStore] New files array length:', newFiles.length);`
- 行 225: `console.log('[ClaudeMdStore] Import failed:', result?.error);`

#### 文件 3: src/components/layout/MainLayout.tsx (1 处)
- 行 259: `console.log('No launch args or error checking:', e);`

#### 文件 4: src/components/modals/ScanClaudeMdModal.tsx (5 处)
- 行 127: `console.log('[ScanModal] Starting import, items:', itemsToImport.length);`
- 行 131: `console.log('[ScanModal] Importing:', item.path);`
- 行 136: `console.log('[ScanModal] Import result:', result);`
- 行 144: `console.log('[ScanModal] Calling loadFiles...');`
- 行 146: `console.log('[ScanModal] loadFiles completed');`

### 2.2 不执行的修改（需人工确认）

#### 1. ProjectsPage.tsx:246 的占位符回调
```typescript
onOpenFolder={() => console.log('Open folder:', selectedProject.path)}
```
**原因**: 这可能是未实现的功能占位符。移除可能影响用户体验预期。需确认：
- 是否需要实现"打开文件夹"功能？
- 还是应该移除这个按钮？

#### 2. Rust 依赖 urlencoding
**原因**: 虽然调查显示未使用，但移除依赖可能有意外影响。建议人工确认后在单独提交中移除。

#### 3. npm 依赖 @tauri-apps/plugin-dialog
**原因**: Tauri 2.0 可能要求前后端同时安装插件包。保留以确保功能正常。

#### 4. Rust Clippy 警告 (161 处)
**原因**:
- 全部为代码风格建议，不影响功能
- 批量自动修复可能引入意外变更
- 建议在单独提交中使用 `cargo clippy --fix` 处理

---

## 三、执行步骤

### Step 1: 修改 src/pages/ScenesPage.tsx
移除行 216、220、228 的 console.log

### Step 2: 修改 src/stores/claudeMdStore.ts
移除行 142、147、155、205、212、215、218、225 的 console.log

### Step 3: 修改 src/components/layout/MainLayout.tsx
移除行 259 的 console.log

### Step 4: 修改 src/components/modals/ScanClaudeMdModal.tsx
移除行 127、131、136、144、146 的 console.log

### Step 5: 验证
- 运行 `npm run build` 确认前端编译成功
- 运行 `cargo build` 确认 Rust 编译成功
- 确认无新增错误或警告

---

## 四、风险评估

| 风险项 | 级别 | 缓解措施 |
|-------|------|---------|
| 移除调试日志影响功能 | 低 | 只移除明确的调试日志，保留错误处理 |
| 编译失败 | 低 | 执行后立即验证编译 |
| 遗漏必要日志 | 低 | 保守策略，不确定的不移除 |

---

## 五、检查清单

修改前确认：
- [x] 所有待移除的 console.log 都是纯调试用途
- [x] 没有任何 console.warn 被移除
- [x] 没有任何 console.error 被移除
- [x] 保留了需要人工确认的语句

修改后确认：
- [ ] npm run build 成功
- [ ] cargo build 成功
- [ ] 无新增错误或警告
