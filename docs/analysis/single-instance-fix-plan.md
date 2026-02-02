# SubAgent 执行规划文档 - 单实例启动参数修复

## 文档信息
- **创建日期**: 2026-02-02
- **任务**: 修复应用已运行时无法接收新启动参数的问题，并优化启动逻辑
- **工作目录**: /Users/bo/Documents/Development/Ensemble/Ensemble2-core-features

---

## 一、问题描述

### 问题 1：应用已运行时新启动参数不被处理
当用户通过 Finder Quick Action 对新文件夹选择 "Open with Ensemble" 时，如果应用已运行，新的 `--launch` 参数会被丢弃，macOS 只会激活现有窗口。

### 问题 2：启动逻辑未区分已关联/未关联 Scene
当前无论文件夹是否已关联 Scene，都会弹出 Launcher 弹窗。期望行为：
- **未关联 Scene**：弹出 Launcher 弹窗让用户选择
- **已关联 Scene**：直接同步配置并启动终端，不显示任何 UI

---

## 二、修复方案

### 2.1 添加 tauri-plugin-single-instance

**步骤**:
1. 在 `src-tauri/Cargo.toml` 添加依赖：
   ```toml
   [dependencies]
   tauri-plugin-single-instance = "2"
   ```

2. 在 `src-tauri/src/lib.rs` 注册插件并处理新启动参数

3. 通过 Tauri 事件系统将新参数发送到前端

### 2.2 修改前端启动逻辑

**文件**: `src/components/layout/MainLayout.tsx`

**修改内容**:
1. 监听 Tauri 单实例事件 `second-instance`
2. 收到新路径时，检查是否已关联 Scene
3. 已关联 Scene → 直接调用同步和启动
4. 未关联 Scene → 打开 Launcher 弹窗

### 2.3 新增后端命令

**文件**: `src-tauri/src/commands/import.rs`

**新增命令**: `quick_launch`
- 接收文件夹路径
- 检查是否已有关联的 Project 和 Scene
- 如果已关联：直接同步配置并启动终端
- 如果未关联：返回标识让前端弹出选择弹窗

---

## 三、详细实现

### 3.1 Cargo.toml 修改

```toml
[dependencies]
# 在现有依赖后添加
tauri-plugin-single-instance = "2"
```

### 3.2 lib.rs 修改

```rust
// 在 .plugin() 链中添加
.plugin(tauri_plugin_single_instance::init(|app, args, _cwd| {
    // 检查是否有 --launch 参数
    if let Some(launch_index) = args.iter().position(|a| a == "--launch") {
        if let Some(path) = args.get(launch_index + 1) {
            // 发送事件到前端
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.emit("second-instance-launch", path.clone());
                let _ = window.set_focus();
            }
        }
    }
}))
```

### 3.3 MainLayout.tsx 修改

```typescript
// 在 useEffect 中添加事件监听
useEffect(() => {
  if (!isTauri()) return;

  const setupListener = async () => {
    const { listen } = await import('@tauri-apps/api/event');

    const unlisten = await listen<string>('second-instance-launch', async (event) => {
      const path = event.payload;
      await handleLaunchPath(path);
    });

    return unlisten;
  };

  const unlistenPromise = setupListener();

  return () => {
    unlistenPromise.then(unlisten => unlisten?.());
  };
}, []);

// 新增处理函数
const handleLaunchPath = async (path: string) => {
  // 检查是否已有关联的 Project
  const projects = useProjectsStore.getState().projects;
  const existingProject = projects.find((p) => p.path === path);

  if (existingProject && existingProject.sceneId) {
    // 已关联 Scene，直接同步并启动
    await useProjectsStore.getState().syncProject(existingProject.id);
    await safeInvoke('launch_claude_for_folder', {
      folderPath: path
    });
  } else {
    // 未关联 Scene，打开 Launcher 弹窗
    useLauncherStore.getState().openLauncher(path);
  }
};
```

---

## 四、验证步骤

1. 构建应用
2. 安装到 /Applications
3. 测试场景 A：首次启动 + 未关联 Scene 的文件夹 → 弹出 Launcher
4. 测试场景 B：应用运行中 + 未关联 Scene 的新文件夹 → 弹出 Launcher
5. 测试场景 C：应用运行中 + 已关联 Scene 的文件夹 → 直接启动终端

---

## 五、注意事项

1. Tauri 2.0 的单实例插件版本要匹配
2. 事件名称 `second-instance-launch` 需要在前后端保持一致
3. 路径比较需要规范化处理（去除尾部斜杠等）
