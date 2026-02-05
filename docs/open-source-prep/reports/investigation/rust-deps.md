# Rust 依赖分析报告

## Dependencies

| 依赖名 | 版本 | 使用状态 | 使用位置 |
|-------|-----|---------|---------|
| serde_json | 1.0 | used | 多处文件读写、JSON解析（commands/trash.rs, commands/mcps.rs, commands/data.rs, commands/config.rs, commands/import.rs, commands/skills.rs, commands/usage.rs, commands/claude_md.rs, commands/plugins.rs, commands/classify.rs, utils/parser.rs, types.rs） |
| serde | 1.0 (features=["derive"]) | used | 通过 `#[derive(Serialize, Deserialize)]` 宏在多个文件中使用（types.rs, commands/usage.rs, commands/import.rs, commands/plugins.rs, commands/classify.rs, commands/mcps.rs） |
| log | 0.4 | used | lib.rs（log::LevelFilter::Info）, commands/usage.rs（log::warn!） |
| tauri | 2.9.5 | used | lib.rs（Builder, generate_handler!, generate_context!）, 所有commands文件（#[tauri::command]宏）, commands/dialog.rs（tauri::Manager, tauri::AppHandle, tauri::async_runtime） |
| tauri-plugin-log | 2 | used | lib.rs（tauri_plugin_log::Builder） |
| tauri-plugin-dialog | 2 | used | lib.rs（tauri_plugin_dialog::init()）, commands/dialog.rs（tauri_plugin_dialog::DialogExt） |
| tauri-plugin-shell | 2 | used | lib.rs（tauri_plugin_shell::init()） |
| uuid | 1 (features=["v4"]) | used | commands/data.rs（Uuid::new_v4()）, commands/claude_md.rs（Uuid::new_v4(), uuid::Uuid::new_v4()） |
| chrono | 0.4 (features=["serde"]) | used | commands/trash.rs（DateTime, NaiveDateTime, Utc）, commands/mcps.rs, commands/data.rs, commands/import.rs, commands/skills.rs, commands/claude_md.rs（Utc::now()等） |
| dirs | 5 | used | 多处获取home目录（commands/mcps.rs, commands/import.rs, commands/plugins.rs, commands/skills.rs, commands/claude_md.rs, utils/path.rs）- dirs::home_dir() |
| walkdir | 2 | used | commands/mcps.rs, commands/import.rs, commands/claude_md.rs（WalkDir::new()遍历目录） |
| reqwest | 0.12 (features=["json"]) | used | commands/classify.rs（reqwest::Client::new()） |
| tauri-plugin-single-instance | 2 | used | lib.rs（tauri_plugin_single_instance::init()） |
| urlencoding | 2.1 | **unused** | 无任何使用记录 |
| tokio | 1 (features=["process", "io-util", "time"]) | used | commands/mcps.rs（tokio::io::AsyncBufReadExt, AsyncWriteExt, BufReader, tokio::process::Command, tokio::time::timeout, Duration）- 用于MCP工具获取的异步进程通信 |
| regex | 1 | used | commands/trash.rs（Regex::new()用于解析带时间戳的文件名） |

## Build Dependencies

| 依赖名 | 版本 | 使用状态 | 说明 |
|-------|-----|---------|-----|
| tauri-build | 2.5.3 | used | Tauri构建必需，由Cargo自动使用 |

## 可能未使用的依赖

### 1. urlencoding (v2.1)
- **状态**: 未使用
- **分析**: 在整个 `src-tauri/src/` 目录中搜索未发现任何对 `urlencoding` 的使用。没有 `use urlencoding`、也没有 `urlencoding::encode` 或 `urlencoding::decode` 的调用。
- **建议**: 可以安全移除此依赖

## 依赖树

```
ensemble v0.0.1
├── chrono v0.4.43
├── dirs v5.0.1
├── log v0.4.29
├── regex v1.12.2
├── reqwest v0.12.28
├── serde v1.0.228
├── serde_json v1.0.149
├── tauri v2.9.5
├── tauri-plugin-dialog v2.6.0
├── tauri-plugin-log v2.8.0
├── tauri-plugin-shell v2.3.4
├── tauri-plugin-single-instance v2.3.7
├── tokio v1.49.0
├── urlencoding v2.1.3      <-- 未使用
├── uuid v1.20.0
└── walkdir v2.5.0
[build-dependencies]
└── tauri-build v2.5.3
```

## 特殊说明

### Tauri 相关依赖
Tauri 框架的依赖通过以下方式使用：
- `tauri`: 通过 `#[tauri::command]` 宏装饰命令函数，以及 `tauri::Builder`, `tauri::generate_handler!`, `tauri::generate_context!` 等
- `tauri-plugin-*`: 通过 `.plugin(xxx::init())` 在 lib.rs 中注册

### Serde 依赖
`serde` 主要通过 `#[derive(Serialize, Deserialize)]` 宏使用，这种使用方式不需要显式的 `use serde::*` 语句。

### Tokio 依赖
`tokio` 用于异步运行时支持，主要在 `commands/mcps.rs` 中用于：
- 异步进程创建和通信 (`tokio::process::Command`)
- 异步I/O操作 (`tokio::io::AsyncBufReadExt`, `AsyncWriteExt`)
- 超时处理 (`tokio::time::timeout`)

## 总结

| 统计项 | 数量 |
|-------|-----|
| 总依赖数 | 15 (不含build-dependencies) |
| 已使用 | 14 |
| 未使用 | 1 (urlencoding) |

**结论**: 项目中有 1 个未使用的依赖 (`urlencoding`)，建议移除以减少编译时间和二进制大小。
