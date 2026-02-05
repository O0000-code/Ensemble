# 第二轮 SubAgent 执行规划 - 修改阶段

## 一、本轮目标

安全地移除 17 个调试用 console.log 语句，并验证修改后项目可正常编译。

## 二、修改原则

1. **只移除整行**: 移除包含 console.log 的完整行
2. **保持缩进**: 不影响周围代码结构
3. **不移除其他代码**: 只移除明确标记的调试语句
4. **不添加任何代码**: 只做删除操作

## 三、SubAgent 任务分配

### SubAgent 1: 修改 ScenesPage.tsx
**任务**: 移除 3 个 console.log
**文件**: `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/pages/ScenesPage.tsx`

**待移除的语句**:
1. 约行 216: `console.log('handleCreateScene called with:', sceneData);`
2. 约行 220: `console.log('Calling safeInvoke add_scene...');`
3. 约行 228: `console.log('safeInvoke result:', newScene);`

**执行步骤**:
1. 读取文件
2. 找到包含上述 console.log 的行
3. 使用 Edit 工具移除这些行（将整行替换为空字符串或下一行）
4. 确认文件语法正确

---

### SubAgent 2: 修改 claudeMdStore.ts
**任务**: 移除 8 个 console.log
**文件**: `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/stores/claudeMdStore.ts`

**待移除的语句**:
1. 约行 142: `console.log('[ClaudeMdStore] loadFiles called');`
2. 约行 147: `console.log('[ClaudeMdStore] get_claude_md_files result:', files);`
3. 约行 155: `console.log('[ClaudeMdStore] Files loaded, count:', files?.length || 0);`
4. 约行 205: `console.log('[ClaudeMdStore] importFile called with:', options);`
5. 约行 212: `console.log('[ClaudeMdStore] import_claude_md result:', result);`
6. 约行 215: `console.log('[ClaudeMdStore] Import success, adding file:', result.file);`
7. 约行 218: `console.log('[ClaudeMdStore] New files array length:', newFiles.length);`
8. 约行 225: `console.log('[ClaudeMdStore] Import failed:', result?.error);`

**执行步骤**:
1. 读取文件
2. 按照从后往前的顺序移除（避免行号变化问题）
3. 使用 Edit 工具逐个移除
4. 确认文件语法正确

---

### SubAgent 3: 修改 MainLayout.tsx
**任务**: 移除 1 个 console.log
**文件**: `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/components/layout/MainLayout.tsx`

**待移除的语句**:
1. 约行 259: `console.log('No launch args or error checking:', e);`

**执行步骤**:
1. 读取文件
2. 找到 catch 块中的 console.log
3. 使用 Edit 工具移除该行
4. 确认 catch 块结构完整（可能需要保留空的 catch 块或添加注释）

**注意**: 这个 console.log 在 catch 块中，移除后需要确保 catch 块仍然有效。如果 catch 块只有这一行，可以保留空块 `catch (e) { }` 或添加 `// Expected when no launch args` 注释。

---

### SubAgent 4: 修改 ScanClaudeMdModal.tsx
**任务**: 移除 5 个 console.log
**文件**: `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/components/modals/ScanClaudeMdModal.tsx`

**待移除的语句**:
1. 约行 127: `console.log('[ScanModal] Starting import, items:', itemsToImport.length);`
2. 约行 131: `console.log('[ScanModal] Importing:', item.path);`
3. 约行 136: `console.log('[ScanModal] Import result:', result);`
4. 约行 144: `console.log('[ScanModal] Calling loadFiles...');`
5. 约行 146: `console.log('[ScanModal] loadFiles completed');`

**执行步骤**:
1. 读取文件
2. 按照从后往前的顺序移除
3. 使用 Edit 工具逐个移除
4. 确认文件语法正确

---

## 四、验证任务

### SubAgent 5: 验证编译
**任务**: 验证修改后项目可正常编译
**执行步骤**:
1. 在项目根目录运行 `npm run build`
2. 在 `src-tauri` 目录运行 `cargo build`
3. 记录编译结果
4. 如有错误，详细记录错误信息

---

## 五、执行顺序

1. SubAgent 1-4 并行执行修改
2. 等待所有修改完成
3. SubAgent 5 验证编译

## 六、输出要求

每个 SubAgent 完成后需要报告:
- 修改前后的代码对比
- 是否成功完成
- 遇到的任何问题
