# 修复扫描加载和导入列表问题 - SubAgent 执行规划

> 创建时间: 2026-02-04
> 状态: 执行中

---

## 一、问题分析

### 问题 1: 扫描加载动画不显示

**现象**: 点击 "Scan System" 按钮后，应用卡住，直到扫描完成才弹出弹框

**根本原因**:
- Modal 在 `isOpen` 为 true 后才渲染，然后在 `useEffect` 中调用 `scanFiles()`
- 但是在 `scanFiles()` 执行期间，由于是同步的 Tauri invoke 调用，整个 UI 线程被阻塞
- 导致 Modal 虽然设置了 `isOpen=true`，但 React 没有机会渲染 Modal 和加载动画

**修复方案**:
1. 先打开 Modal（让 React 有机会渲染）
2. 使用 `setTimeout` 延迟调用 `scanFiles()`，确保 Modal 先渲染出来
3. 或者在点击按钮后立即设置一个本地 `scanning` 状态

### 问题 2: 导入后文件不显示在列表

**现象**: 在 ScanClaudeMdModal 中选择文件并导入后，关闭弹框，列表中没有新文件

**可能原因**:
1. Rust 后端 `import_claude_md` 命令没有正确保存到 data.json
2. Store 的 `importFile` 方法可能没有正确更新 `files` 数组
3. `loadFiles()` 回调在 Modal 关闭后执行，但可能有时序问题
4. useMemo 的依赖可能没有正确触发更新

**修复方案**:
1. 检查 Rust 后端 `import_claude_md` 命令的实现
2. 在 `ScanClaudeMdModal` 中，导入完成后手动调用 `loadFiles()` 刷新
3. 确保 `onImportComplete` 回调正确触发

---

## 二、SubAgent 任务分配

### SubAgent G1: 修复扫描加载动画

**任务**: 修复点击 "Scan System" 按钮后加载动画不显示的问题

**工作目录**: `/Users/bo/Documents/Development/Ensemble/Ensemble2-claude-md-feature`

**需要修改的文件**:
- `src/pages/ClaudeMdPage.tsx`
- `src/components/modals/ScanClaudeMdModal.tsx`

**修复策略**:
1. 在 `ClaudeMdPage` 中，点击 "Scan System" 按钮时：
   - 立即打开 Modal (`setIsScanModalOpen(true)`)
   - Modal 内部自己管理扫描状态
2. 在 `ScanClaudeMdModal` 中：
   - 使用 `useLayoutEffect` + `setTimeout` 延迟调用 `scanFiles()`
   - 确保 Modal 先渲染出来再开始扫描

**代码修改**:

```tsx
// ScanClaudeMdModal.tsx - 修改 useEffect
useEffect(() => {
  if (isOpen) {
    // 延迟 100ms 调用 scanFiles，确保 Modal 先渲染
    const timer = setTimeout(() => {
      scanFiles();
    }, 100);
    return () => clearTimeout(timer);
  }
}, [isOpen, scanFiles]);
```

### SubAgent G2: 修复导入后列表不刷新

**任务**: 修复导入文件后列表不显示新文件的问题

**工作目录**: `/Users/bo/Documents/Development/Ensemble/Ensemble2-claude-md-feature`

**需要检查和修改的文件**:
- `src-tauri/src/claude_md.rs` - 检查 `import_claude_md` 命令实现
- `src-tauri/src/storage.rs` - 检查数据保存逻辑
- `src/stores/claudeMdStore.ts` - 检查 `importFile` 方法
- `src/components/modals/ScanClaudeMdModal.tsx` - 检查导入流程

**修复策略**:
1. 检查 Rust 后端是否正确保存导入的文件
2. 在 Modal 关闭前调用 `loadFiles()` 刷新文件列表
3. 确保 Store 状态正确更新

**关键点**:
- 导入完成后需要调用 `loadFiles()` 从后端重新加载所有文件
- 确保 `loadFiles()` 在 Modal 关闭之前或同时被调用
- 检查 Rust 后端是否将文件写入 `~/.ensemble/data.json`

---

## 三、输出要求

1. 修改后代码必须能正常编译
2. 点击 "Scan System" 按钮后应立即显示 Modal 和加载动画
3. 导入文件后应立即在列表中显示
4. 不能影响其他现有功能
