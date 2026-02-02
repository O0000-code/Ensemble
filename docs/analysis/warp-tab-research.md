# Warp Terminal Tab 功能调研报告

## 概述

本报告调研了如何在 Warp 终端的现有窗口中打开新 Tab，而不是每次都打开新窗口。

## 调研结果

### 1. Warp URI Scheme

Warp 提供了 URI Scheme 支持，可以通过 URL 方式控制终端行为。

#### 可用的 Actions

| Action | URI 格式 | 功能 |
|--------|----------|------|
| new_window | `warp://action/new_window?path=<path>` | 在新窗口中打开指定目录 |
| new_tab | `warp://action/new_tab?path=<path>` | **在现有窗口中打开新 Tab** |
| launch | `warp://launch/<config_name>` | 打开 Launch Configuration |

#### 关键发现：`new_tab` Action

**这是解决问题的关键！** Warp 提供了 `warp://action/new_tab?path=<path>` URI，可以在现有窗口中打开新 Tab。

**使用方法：**
```bash
# 在现有窗口的新 Tab 中打开指定目录
open "warp://action/new_tab?path=/Users/bo/Projects"
```

#### 限制

- URI Scheme **不支持直接执行命令**（只能指定目录）
- 如果 Warp 没有运行，会先启动 Warp 再创建 Tab
- 不能在 URI 中指定 Tab 名称或颜色

### 2. Launch Configuration

Launch Configuration 是 YAML 配置文件，存储在 `~/.warp/launch_configurations/`。

#### 配置选项

```yaml
name: My Project
windows:
  - tabs:
    - title: Project Tab
      layout:
        cwd: /path/to/project
        color: blue
      commands:
        - "echo 'Hello'"
```

#### 关键发现

**Launch Configuration 本身无法控制是否在新窗口或现有窗口中打开。** 但是：

1. **使用 `warp://launch/config_name`** - 总是打开**新窗口**
2. **使用快捷键 `CMD-ENTER`（macOS）或 `CTRL-ENTER`（Windows/Linux）** - 可以在**当前窗口**中启动配置

这意味着从外部程序调用 Launch Configuration 时，无法控制是否使用现有窗口。

### 3. AppleScript 支持

#### 官方状态

**Warp 不原生支持 AppleScript。** 这是一个长期被用户请求的功能，但至今未实现。

#### System Events 变通方案

可以使用 macOS 的 System Events 进行 UI 自动化：

```applescript
on run argv
    set targetDir to item 1 of argv

    tell application "Warp" to activate
    delay 0.5

    tell application "System Events"
        -- 打开新 Tab
        keystroke "t" using command down
        delay 0.2
        -- 切换目录
        keystroke "cd " & targetDir
        key code 36 -- Return
    end tell
end run
```

#### 限制

- 依赖 UI 模拟，不够稳定
- 需要 Accessibility 权限
- 执行速度较慢，需要 delay
- 命令需要手动输入而非直接执行

### 4. CLI 参数

#### 当前状态

**Warp 不支持传统的命令行参数来控制窗口/Tab 行为。**

```bash
# 这些都不工作：
warp -t "/path/to/dir"  # 不支持
warp --new-tab "/path"  # 不支持
/Applications/Warp.app/Contents/MacOS/Warp --args /path  # 不工作
```

#### 替代方案

Warp 团队推荐使用 URI Scheme 替代 CLI 参数。在 macOS 上可以用 `open` 命令调用：

```bash
open "warp://action/new_tab?path=/path/to/dir"
```

### 5. 其他发现

#### Dock 拖放

可以将文件夹拖放到 Warp 的 Dock 图标上，会在新 Tab 中打开。

#### Finder 服务

右键点击文件夹 > Services > "Open new Warp Tab here" 可以在新 Tab 中打开。

## 方案对比

| 方案 | 可行性 | 支持执行命令 | 可控性 | 稳定性 |
|------|--------|--------------|--------|--------|
| `warp://action/new_tab` | ✅ 最佳 | ❌ 不支持 | 中等 | 高 |
| Launch Config + `CMD-ENTER` | ⚠️ 需手动 | ✅ 支持 | 高 | 高 |
| AppleScript/System Events | ⚠️ 变通 | ✅ 支持 | 中等 | 低 |
| 临时 Launch Config + `new_tab` | ✅ 可行 | ✅ 支持 | 高 | 中等 |

## 推荐方案

### 最佳方案：混合使用 URI Scheme 和临时 Launch Configuration

这种方案结合了两种方法的优点：

1. **简单打开 Tab（不执行命令）**：直接使用 `warp://action/new_tab`
2. **打开 Tab 并执行命令**：创建临时 Launch Config，然后用 `warp://action/new_tab` 配合

### 实现代码示例

#### 方案 A：仅打开目录（不执行命令）

```swift
// Swift (适用于 macOS 应用)
import Foundation

func openWarpTab(path: String) {
    let encodedPath = path.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? path
    let urlString = "warp://action/new_tab?path=\(encodedPath)"

    if let url = URL(string: urlString) {
        NSWorkspace.shared.open(url)
    }
}

// 使用
openWarpTab(path: "/Users/bo/Projects/MyProject")
```

```typescript
// TypeScript (适用于 Electron 应用如 Ensemble)
import { shell } from 'electron';

function openWarpTab(path: string): void {
    const encodedPath = encodeURIComponent(path);
    const url = `warp://action/new_tab?path=${encodedPath}`;
    shell.openExternal(url);
}

// 使用
openWarpTab('/Users/bo/Projects/MyProject');
```

#### 方案 B：打开目录并执行命令（推荐方案）

由于 `new_tab` URI 不支持直接执行命令，需要变通处理：

**步骤 1：创建临时 Launch Configuration**

```typescript
// TypeScript (Electron)
import { writeFileSync, mkdirSync, existsSync, unlinkSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { shell } from 'electron';

interface WarpTabConfig {
    path: string;
    title?: string;
    commands?: string[];
    color?: 'Red' | 'Green' | 'Yellow' | 'Blue' | 'Magenta' | 'Cyan';
}

function openWarpTabWithCommand(config: WarpTabConfig): void {
    const configDir = join(homedir(), '.warp', 'launch_configurations');

    // 确保目录存在
    if (!existsSync(configDir)) {
        mkdirSync(configDir, { recursive: true });
    }

    // 生成唯一配置名称
    const configName = `ensemble_temp_${Date.now()}`;
    const configPath = join(configDir, `${configName}.yaml`);

    // 构建 YAML 配置
    const yamlContent = buildLaunchConfigYaml(config, configName);

    // 写入配置文件
    writeFileSync(configPath, yamlContent, 'utf-8');

    // 方案 1：使用 launch URI（会打开新窗口）
    // shell.openExternal(`warp://launch/${configName}`);

    // 方案 2：使用 new_tab URI + 延迟执行命令
    // 先打开 tab
    const encodedPath = encodeURIComponent(config.path);
    shell.openExternal(`warp://action/new_tab?path=${encodedPath}`);

    // 如果需要执行命令，使用 AppleScript
    if (config.commands && config.commands.length > 0) {
        setTimeout(() => {
            executeCommandsViaAppleScript(config.commands!);
            // 清理临时配置
            try { unlinkSync(configPath); } catch {}
        }, 1000);
    } else {
        // 清理临时配置
        setTimeout(() => {
            try { unlinkSync(configPath); } catch {}
        }, 2000);
    }
}

function buildLaunchConfigYaml(config: WarpTabConfig, name: string): string {
    const lines = [
        `name: ${name}`,
        'windows:',
        '  - tabs:',
        `    - title: ${config.title || 'Ensemble'}`,
        '      layout:',
        `        cwd: "${config.path}"`,
    ];

    if (config.color) {
        lines.push(`        color: ${config.color}`);
    }

    if (config.commands && config.commands.length > 0) {
        lines.push('      commands:');
        config.commands.forEach(cmd => {
            lines.push(`        - "${cmd.replace(/"/g, '\\"')}"`);
        });
    }

    return lines.join('\n');
}

function executeCommandsViaAppleScript(commands: string[]): void {
    const { execSync } = require('child_process');

    // 构建要执行的命令（合并为一行）
    const fullCommand = commands.join(' && ');

    const appleScript = `
        tell application "Warp"
            activate
        end tell
        delay 0.3
        tell application "System Events"
            keystroke "${fullCommand.replace(/"/g, '\\"')}"
            key code 36
        end tell
    `;

    try {
        execSync(`osascript -e '${appleScript.replace(/'/g, "'\\''")}'`);
    } catch (error) {
        console.error('Failed to execute commands via AppleScript:', error);
    }
}

// 使用示例
openWarpTabWithCommand({
    path: '/Users/bo/Projects/MyProject',
    title: 'My Project',
    commands: ['npm run dev'],
    color: 'Blue'
});
```

#### 方案 C：纯 URI Scheme（最简单，但不支持命令）

如果不需要执行命令，这是最简单稳定的方案：

```typescript
// 最简单的实现
import { shell } from 'electron';

class WarpTerminal {
    /**
     * 在现有 Warp 窗口中打开新 Tab
     */
    static openTab(directory: string): void {
        const url = `warp://action/new_tab?path=${encodeURIComponent(directory)}`;
        shell.openExternal(url);
    }

    /**
     * 打开新窗口
     */
    static openWindow(directory: string): void {
        const url = `warp://action/new_window?path=${encodeURIComponent(directory)}`;
        shell.openExternal(url);
    }

    /**
     * 使用 Launch Configuration 打开（总是新窗口）
     */
    static openLaunchConfig(configName: string): void {
        const url = `warp://launch/${configName}`;
        shell.openExternal(url);
    }
}

// 使用
WarpTerminal.openTab('/Users/bo/Projects');  // 新 Tab
WarpTerminal.openWindow('/Users/bo/Projects');  // 新窗口
```

## Ensemble 集成建议

### 修改现有实现

当前 Ensemble 的实现使用 Launch Configuration + `warp://launch/` 会导致总是打开新窗口。

建议修改为：

1. **如果只需要打开目录**：使用 `warp://action/new_tab?path=...`
2. **如果需要执行命令**：
   - 仍然创建 Launch Configuration
   - 但改用 `warp://action/new_tab` 打开目录
   - 然后通过 AppleScript 执行命令（或接受打开新窗口的限制）

### 用户偏好设置

可以添加设置让用户选择：
- 总是打开新 Tab（使用 `new_tab` URI）
- 总是打开新窗口（使用 `launch` URI 或 `new_window` URI）
- 自动选择（根据是否需要执行命令决定）

## 参考资料

- [Warp URI Scheme 官方文档](https://docs.warp.dev/terminal/more-features/uri-scheme)
- [Warp Launch Configurations 文档](https://docs.warp.dev/terminal/sessions/launch-configurations)
- [Warp Tabs 文档](https://docs.warp.dev/terminal/windows/tabs)
- [GitHub Issue #5859 - 添加命令执行到 URI Scheme](https://github.com/warpdotdev/Warp/issues/5859)
- [GitHub Issue #3959 - 从命令行打开 Tab 并执行命令](https://github.com/warpdotdev/Warp/issues/3959)
- [GitHub Issue #4548 - 命令行选项](https://github.com/warpdotdev/Warp/issues/4548)
- [GitHub Issue #3364 - AppleScript 支持请求](https://github.com/warpdotdev/Warp/issues/3364)
- [Alfred Warp 集成方案](https://www.thoughtasylum.com/2025/04/19/alfred-using-warp-for-your-terminal/)

## 结论

**最佳方案是使用 `warp://action/new_tab?path=<path>` URI Scheme。**

这是 Warp 官方支持的方式，可以在现有窗口中打开新 Tab，而不是每次都打开新窗口。

主要限制是 URI Scheme 目前不支持直接执行命令。如果需要执行命令，可以：
1. 接受打开新窗口的限制，继续使用 Launch Configuration
2. 使用 AppleScript/System Events 变通方案（不太稳定）
3. 等待 Warp 官方支持 URI Scheme 命令执行功能（Issue #5859）
