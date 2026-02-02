# SubAgent 执行规划文档 - 终端 CLI 启动方式重构

## 文档信息
- **创建日期**: 2026-02-02
- **任务**: 重构 `launch_claude_for_folder` 函数，使用各终端的原生 CLI 方式启动
- **工作目录**: /Users/bo/Documents/Development/Ensemble/Ensemble2-core-features

---

## 一、任务背景

当前 `src-tauri/src/commands/import.rs` 中的 `launch_claude_for_folder` 函数使用 AppleScript 的 `keystroke` 命令模拟键盘输入，这会受到输入法状态的影响，导致命令被错误处理。

需要重构为使用各终端的原生 CLI 启动方式，完全避免 `keystroke` 模拟输入。

---

## 二、各终端的推荐实现方式

### 2.1 Terminal.app
使用 AppleScript 的 `do script` 命令（原生命令，不受输入法影响）：
```rust
let applescript = format!(
    r#"tell application "Terminal"
    activate
    do script "cd \"{}\" && {}"
end tell"#,
    escaped_path, claude_command
);
```

### 2.2 iTerm2
使用 AppleScript 的 `create window with default profile command` 命令：
```rust
let applescript = format!(
    r#"tell application "iTerm2"
    activate
    create window with default profile command "cd \"{}\" && {}"
end tell"#,
    escaped_path, claude_command
);
```

### 2.3 Warp
Warp 的 URI Scheme 不支持直接执行命令，需要使用 Launch Configuration：

1. 创建临时 YAML 配置文件到 `/tmp/ensemble_warp_launch.yaml`
2. 通过 `open "warp://launch/path/to/config.yaml"` 启动

配置文件格式：
```yaml
name: ensemble-launch
windows:
  - tabs:
    - title: Claude Code
      layout:
        cwd: /path/to/project
        commands:
          - exec: "claude --dangerously-skip-permissions"
```

### 2.4 Alacritty
使用 CLI 参数直接启动：
```rust
std::process::Command::new("alacritty")
    .arg("--working-directory")
    .arg(&folder_path)
    .arg("-e")
    .arg("zsh")
    .arg("-c")
    .arg(format!("{}; zsh", claude_command))
    .spawn()
```

注意：`-e` 必须是最后一个参数，后面的所有内容都被当作命令。

---

## 三、代码修改规范

### 3.1 文件位置
`/Users/bo/Documents/Development/Ensemble/Ensemble2-core-features/src-tauri/src/commands/import.rs`

### 3.2 函数签名（保持不变）
```rust
#[tauri::command]
pub async fn launch_claude_for_folder(
    folder_path: String,
    terminal_app: String,
    claude_command: String,
) -> Result<(), String>
```

### 3.3 实现要求

1. **完全移除 `keystroke` 的使用** - 不再模拟键盘输入
2. **路径转义** - 正确处理包含空格和特殊字符的路径
3. **错误处理** - 提供清晰的错误信息
4. **Warp 特殊处理** - 创建临时配置文件，使用后可选择性清理
5. **Alacritty 使用 CLI** - 不使用 AppleScript，直接使用命令行参数

### 3.4 代码结构
```rust
pub async fn launch_claude_for_folder(
    folder_path: String,
    terminal_app: String,
    claude_command: String,
) -> Result<(), String> {
    let folder = expand_tilde(&folder_path);

    if !folder.exists() {
        return Err(format!("Folder does not exist: {}", folder_path));
    }

    let escaped_path = folder.display().to_string();

    match terminal_app.as_str() {
        "iTerm" => {
            // 使用 create window with default profile command
        }
        "Warp" => {
            // 创建临时 Launch Configuration 文件
            // 使用 open warp://launch/path 启动
        }
        "Alacritty" => {
            // 使用 CLI 参数直接启动，不使用 AppleScript
        }
        _ => {
            // Terminal.app - 使用 do script
        }
    }

    Ok(())
}
```

---

## 四、测试验证

修改完成后需要验证：
1. 编译通过 (`cargo check`)
2. 各终端启动正常
3. 命令正确执行
4. 不受输入法影响

---

## 五、注意事项

1. **不要使用 `keystroke`** - 这是本次重构的核心目标
2. **Warp 临时文件** - 文件路径使用 `/tmp/ensemble_warp_launch.yaml`
3. **Alacritty 保持终端打开** - 使用 `zsh -c "command; zsh"` 模式
4. **路径转义** - AppleScript 中使用 `\"` 转义双引号
5. **异步执行** - 使用 `.spawn()` 而非 `.output()` 以避免阻塞
