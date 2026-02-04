# CLAUDE.md 独立文件存储重构 - 研究报告

> 创建时间: 2026-02-04
> SubAgent: R1 (研究分析)
> 状态: 完成

---

## 一、研究概述

本报告深入分析了 Ensemble 项目中 Skill 和 MCP 的文件存储实现模式，为 CLAUDE.md 独立文件存储重构提供参考。

---

## 二、Skill 存储实现模式

### 2.1 目录结构

```
~/.ensemble/
├── skills/
│   ├── skill-name-1/          # 目录名 = Skill 名称
│   │   └── SKILL.md           # Skill 内容文件
│   ├── skill-name-2/
│   │   └── SKILL.md
│   └── (symlink) -> ~/.agents/skills/xxx/  # 支持符号链接
└── trash/
    └── skills/                # 删除的 Skill 移到这里
        └── skill-name_timestamp/
```

### 2.2 关键特点

1. **ID = 文件路径**: Skill 的 `id` 就是其完整文件路径
   ```rust
   // skills.rs:171
   let id = skill_dir.to_string_lossy().to_string();
   ```

2. **元数据分离存储**: 文件内容在独立目录，元数据在 `data.json`
   ```rust
   // data.json 中存储 skill_metadata HashMap<String, SkillMetadata>
   pub struct SkillMetadata {
       pub category: String,
       pub tags: Vec<String>,
       pub enabled: bool,
       pub usage_count: u32,
       pub last_used: Option<String>,
       pub icon: Option<String>,
       pub scope: String,
   }
   ```

3. **支持符号链接**: 从插件导入的 Skill 使用符号链接
   ```rust
   // plugins.rs:706-714
   #[cfg(unix)]
   std::os::unix::fs::symlink(source_path, &dest_skill_path)
   ```

4. **软删除机制**: 删除时移动到 trash 目录
   ```rust
   // skills.rs:264-277
   let trash_dir = ensemble_path.join("trash").join("skills");
   fs::rename(skill_path, &dest_path)
   ```

### 2.3 关键函数

| 函数 | 作用 | 文件位置 |
|------|------|----------|
| `scan_skills()` | 扫描 skills 目录获取 Skill 列表 | skills.rs:9-49 |
| `get_skill()` | 通过 ID 获取单个 Skill | skills.rs:53-57 |
| `update_skill_metadata()` | 更新元数据 | skills.rs:61-104 |
| `delete_skill()` | 删除 Skill (移到 trash) | skills.rs:247-293 |
| `import_plugin_skills()` | 从插件导入 Skill | plugins.rs:671-741 |

### 2.4 代码示例 - 扫描 Skill

```rust
pub fn scan_skills(source_dir: String) -> Result<Vec<Skill>, String> {
    let path = expand_path(&source_dir);
    let mut skills = Vec::new();
    let metadata_map = load_skill_metadata();  // 从 data.json 加载元数据

    if let Ok(entries) = fs::read_dir(&path) {
        for entry in entries.filter_map(|e| e.ok()) {
            let entry_path = entry.path();
            if !entry_path.is_dir() { continue; }

            // 检查 SKILL.md 文件
            let skill_md_path = entry_path.join("SKILL.md");
            if skill_md_path.exists() {
                if let Ok(skill) = parse_skill_file(&skill_md_path, &metadata_map) {
                    skills.push(skill);
                }
            }
        }
    }
    Ok(skills)
}
```

---

## 三、MCP 存储实现模式

### 3.1 目录结构

```
~/.ensemble/
├── mcps/
│   ├── mcp-name-1.json        # 文件名 = MCP 名称
│   └── mcp-name-2.json
└── trash/
    └── mcps/                  # 删除的 MCP 移到这里
        └── mcp-name_timestamp.json
```

### 3.2 关键特点

1. **ID = 文件路径**: MCP 的 `id` 是其 JSON 文件的完整路径
   ```rust
   // mcps.rs:119
   let id = file_path.to_string_lossy().to_string();
   ```

2. **配置即内容**: MCP 的配置信息直接存储在 JSON 文件中
   ```rust
   pub struct McpConfigFile {
       pub name: String,
       pub description: Option<String>,
       pub command: String,
       pub args: Option<Vec<String>>,
       pub env: Option<HashMap<String, String>>,
       pub provided_tools: Option<Vec<Tool>>,
       // 插件来源字段
       pub install_source: Option<String>,
       pub plugin_id: Option<String>,
       pub plugin_name: Option<String>,
       pub marketplace: Option<String>,
   }
   ```

3. **元数据分离**: 与 Skill 类似，元数据在 `data.json`
   ```rust
   pub struct McpMetadata {
       pub category: String,
       pub tags: Vec<String>,
       pub enabled: bool,
       pub usage_count: u32,
       pub last_used: Option<String>,
       pub scope: String,
   }
   ```

### 3.3 关键函数

| 函数 | 作用 | 文件位置 |
|------|------|----------|
| `scan_mcps()` | 扫描 mcps 目录获取 MCP 列表 | mcps.rs:13-40 |
| `get_mcp()` | 通过 ID 获取单个 MCP | mcps.rs:43-47 |
| `update_mcp_metadata()` | 更新元数据 | mcps.rs:50-90 |
| `delete_mcp()` | 删除 MCP (移到 trash) | mcps.rs:408-459 |
| `import_plugin_mcps()` | 从插件导入 MCP | plugins.rs:748-851 |

### 3.4 代码示例 - 导入 MCP

```rust
pub fn import_plugin_mcps(items: Vec<PluginImportItem>, dest_dir: String) -> Result<Vec<String>, String> {
    let dest_path = expand_tilde(&dest_dir);
    fs::create_dir_all(&dest_path)?;

    for item in items {
        // 目标文件: dest_dir/{mcp_name}.json
        let dest_mcp_path = dest_path.join(format!("{}.json", item.item_name));

        // 创建独立 MCP 配置文件
        let mcp_config_file = McpConfigFile {
            name: item.item_name.clone(),
            description: Some(format!("Imported from plugin: {}", item.plugin_name)),
            command: mcp_config.command.clone(),
            args: Some(mcp_config.args.clone()),
            env: mcp_config.env.clone(),
            // ...
        };

        let json = serde_json::to_string_pretty(&mcp_config_file)?;
        fs::write(&dest_mcp_path, json)?;
    }
    Ok(imported_plugin_ids)
}
```

---

## 四、当前 CLAUDE.md 实现分析

### 4.1 当前存储方式

```rust
// types.rs:585-627
pub struct ClaudeMdFile {
    pub id: String,           // UUID
    pub name: String,
    pub description: String,
    pub source_path: String,  // 原始来源路径
    pub source_type: ClaudeMdType,
    pub content: String,      // !!! 内容直接嵌入 !!!
    pub is_global: bool,
    pub category_id: Option<String>,
    pub tag_ids: Vec<String>,
    pub created_at: String,
    pub updated_at: String,
    pub size: u64,
    pub icon: Option<String>,
}
```

**问题**: `content` 字段直接存储在 `data.json` 中，导致数据文件过大。

### 4.2 需要修改的函数清单

#### 4.2.1 `import_claude_md()` (claude_md.rs:281-349)

**当前逻辑**:
```rust
// 读取文件内容
let content = fs::read_to_string(&source_path)?;

// 创建 ClaudeMdFile，内容嵌入
let file = ClaudeMdFile {
    id: Uuid::new_v4().to_string(),
    content,  // 内容直接存入
    // ...
};

// 保存到 AppData
app_data.claude_md_files.push(file.clone());
write_app_data(app_data)?;
```

**需要修改为**:
1. 生成 UUID 作为 ID
2. 创建目录 `~/.ensemble/claude-md/{id}/`
3. 复制源文件到 `~/.ensemble/claude-md/{id}/CLAUDE.md`
4. 在 `ClaudeMdFile` 中保存 `managed_path` 而不是 `content`
5. 保存元数据到 `data.json`

#### 4.2.2 `read_claude_md()` (claude_md.rs:398-406)

**当前逻辑**:
```rust
pub fn read_claude_md(id: String) -> Result<ClaudeMdFile, String> {
    let app_data = read_app_data()?;
    app_data.claude_md_files
        .into_iter()
        .find(|f| f.id == id)
        .ok_or_else(|| format!("CLAUDE.md file not found: {}", id))
}
```

**需要修改为**:
1. 从 `data.json` 获取元数据
2. 从独立文件 `~/.ensemble/claude-md/{id}/CLAUDE.md` 读取 `content`
3. 组装完整的 `ClaudeMdFile` 返回

#### 4.2.3 `get_claude_md_files()` (claude_md.rs:410-413)

**当前逻辑**:
```rust
pub fn get_claude_md_files() -> Result<Vec<ClaudeMdFile>, String> {
    let app_data = read_app_data()?;
    Ok(app_data.claude_md_files)
}
```

**需要修改为**:
1. 从 `data.json` 获取所有元数据
2. 对每个文件，从独立文件读取 `content`
3. 返回完整的 `ClaudeMdFile` 列表

**优化建议**: 可以添加 `get_claude_md_files_metadata_only()` 函数，不读取内容，用于列表展示。

#### 4.2.4 `update_claude_md()` (claude_md.rs:426-470)

**当前逻辑**:
```rust
if let Some(c) = content {
    file.size = c.len() as u64;
    file.content = c;  // 更新嵌入的内容
}
// ...
write_app_data(app_data)?;
```

**需要修改为**:
1. 如果更新内容，写入独立文件 `~/.ensemble/claude-md/{id}/CLAUDE.md`
2. 更新元数据中的 `size` 和 `updated_at`
3. 其他字段仍然保存到 `data.json`

#### 4.2.5 `delete_claude_md()` (claude_md.rs:473-494)

**当前逻辑**:
```rust
app_data.claude_md_files.retain(|f| f.id != id);
write_app_data(app_data)?;
```

**需要修改为**:
1. 从 `data.json` 删除元数据
2. 删除独立文件目录 `~/.ensemble/claude-md/{id}/`
3. 或者采用软删除：移动到 `~/.ensemble/trash/claude-md/`

#### 4.2.6 `set_global_claude_md()` (claude_md.rs:512-578)

**当前逻辑**:
```rust
// 写入全局文件
fs::write(&global_path, &target_file.content)?;
```

**需要修改为**:
1. 从独立文件 `~/.ensemble/claude-md/{id}/CLAUDE.md` 读取内容
2. 写入 `~/.claude/CLAUDE.md`

#### 4.2.7 `distribute_claude_md()` (claude_md.rs:619-687)

**当前逻辑**:
```rust
// 写入目标文件
fs::write(&target_path, &source_file.content)?;
```

**需要修改为**:
1. 从独立文件读取内容
2. 写入目标路径

### 4.3 需要新增的辅助函数

```rust
/// 获取 CLAUDE.md 存储根目录
fn get_claude_md_storage_dir() -> PathBuf {
    get_app_data_dir().join("claude-md")
}

/// 获取特定 CLAUDE.md 文件的目录
fn get_claude_md_file_dir(id: &str) -> PathBuf {
    get_claude_md_storage_dir().join(id)
}

/// 获取特定 CLAUDE.md 文件的路径
fn get_claude_md_file_path(id: &str) -> PathBuf {
    get_claude_md_file_dir(id).join("CLAUDE.md")
}

/// 读取 CLAUDE.md 文件内容
fn read_claude_md_content(id: &str) -> Result<String, String> {
    let path = get_claude_md_file_path(id);
    fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read CLAUDE.md content: {}", e))
}

/// 写入 CLAUDE.md 文件内容
fn write_claude_md_content(id: &str, content: &str) -> Result<(), String> {
    let dir = get_claude_md_file_dir(id);
    fs::create_dir_all(&dir)
        .map_err(|e| format!("Failed to create directory: {}", e))?;

    let path = dir.join("CLAUDE.md");
    fs::write(&path, content)
        .map_err(|e| format!("Failed to write content: {}", e))
}
```

---

## 五、类型定义修改建议

### 5.1 ClaudeMdFile 结构体修改

```rust
/// CLAUDE.md 文件信息 (管理的文件)
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClaudeMdFile {
    /// 唯一标识 (UUID)
    pub id: String,

    /// 显示名称
    pub name: String,

    /// 描述
    pub description: String,

    /// 原始来源路径
    pub source_path: String,

    /// 原始来源类型
    pub source_type: ClaudeMdType,

    /// 文件内容 - 运行时填充，不序列化到 data.json
    #[serde(skip)]
    pub content: String,

    /// 托管文件路径 (新增)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub managed_path: Option<String>,

    /// 是否设为全局
    pub is_global: bool,

    /// 分类 ID
    #[serde(skip_serializing_if = "Option::is_none")]
    pub category_id: Option<String>,

    /// 标签 ID 列表
    #[serde(default)]
    pub tag_ids: Vec<String>,

    /// 创建时间 (ISO 8601)
    pub created_at: String,

    /// 更新时间 (ISO 8601)
    pub updated_at: String,

    /// 文件大小 (bytes)
    pub size: u64,

    /// 自定义图标名称
    #[serde(skip_serializing_if = "Option::is_none")]
    pub icon: Option<String>,
}
```

### 5.2 关键修改点

1. **`content` 字段**: 添加 `#[serde(skip)]` 使其不序列化到 data.json
2. **新增 `managed_path`**: 记录托管文件的实际路径

### 5.3 向后兼容方案

如果选择保留 `content` 字段用于兼容：

```rust
/// 文件内容 - 仅用于向后兼容旧数据迁移
#[serde(default)]
#[serde(skip_serializing)]  // 只反序列化，不序列化
pub content: String,
```

这样：
- 反序列化时可以读取旧数据中的 `content`
- 序列化时不会写入 `content`
- 运行时从独立文件读取内容

---

## 六、数据迁移策略建议

### 6.1 自动迁移方案

在应用启动时检测并执行迁移：

```rust
/// 迁移旧数据到独立文件存储
pub fn migrate_claude_md_storage() -> Result<(), String> {
    let mut app_data = read_app_data()?;
    let mut migrated = false;

    for file in app_data.claude_md_files.iter_mut() {
        // 检查是否需要迁移 (content 非空且 managed_path 为空)
        if !file.content.is_empty() && file.managed_path.is_none() {
            // 创建目录
            let file_dir = get_claude_md_file_dir(&file.id);
            fs::create_dir_all(&file_dir)?;

            // 写入内容到独立文件
            let file_path = file_dir.join("CLAUDE.md");
            fs::write(&file_path, &file.content)?;

            // 更新 managed_path
            file.managed_path = Some(file_path.to_string_lossy().to_string());

            // 清空 content (将在序列化时自动跳过)
            file.content = String::new();

            migrated = true;
            println!("[Migration] Migrated CLAUDE.md: {}", file.name);
        }
    }

    if migrated {
        write_app_data(app_data)?;
    }

    Ok(())
}
```

### 6.2 迁移时机

在 `init_app_data()` 中调用迁移函数：

```rust
pub fn init_app_data() -> Result<(), String> {
    // ... 现有的初始化逻辑 ...

    // 执行数据迁移
    migrate_claude_md_storage()?;

    Ok(())
}
```

### 6.3 迁移安全措施

1. **备份原数据**: 迁移前备份 `data.json`
2. **原子操作**: 先写入独立文件，成功后再更新 `data.json`
3. **回滚机制**: 如果迁移失败，保持原状态

---

## 七、推荐的目录结构

### 7.1 最终目录结构

```
~/.ensemble/
├── data.json                  # 元数据 (不含 content)
├── settings.json              # 应用设置
├── skills/                    # Skills 独立存储
│   └── {skill-name}/
│       └── SKILL.md
├── mcps/                      # MCPs 独立存储
│   └── {mcp-name}.json
├── claude-md/                 # CLAUDE.md 独立存储 (新增)
│   ├── {uuid-1}/
│   │   └── CLAUDE.md
│   ├── {uuid-2}/
│   │   └── CLAUDE.md
│   └── global-backup/         # 全局备份 (已存在)
│       └── CLAUDE.md.{timestamp}.backup
├── trash/                     # 回收站
│   ├── skills/
│   ├── mcps/
│   └── claude-md/             # (可选)
└── backups/                   # 导入备份
```

### 7.2 文件命名规范

| 资源类型 | ID 策略 | 目录/文件命名 |
|---------|---------|--------------|
| Skill | 文件路径 | `{skill-name}/SKILL.md` |
| MCP | 文件路径 | `{mcp-name}.json` |
| CLAUDE.md | UUID | `{uuid}/CLAUDE.md` |

### 7.3 为什么 CLAUDE.md 使用 UUID

1. **来源可能重复**: 多次导入同一路径的文件会生成不同版本
2. **名称不唯一**: 用户可以给文件自定义名称
3. **避免冲突**: UUID 保证唯一性
4. **与现有设计一致**: 当前已使用 UUID 作为 ID

---

## 八、实现优先级建议

### Phase 1: 核心功能 (必须)
1. 新增辅助函数 (`get_claude_md_file_path`, `read_claude_md_content`, 等)
2. 修改 `import_claude_md()` - 导入时写入独立文件
3. 修改 `read_claude_md()` - 从独立文件读取
4. 修改 `update_claude_md()` - 更新独立文件

### Phase 2: 完整支持 (必须)
5. 修改 `get_claude_md_files()` - 列表读取
6. 修改 `delete_claude_md()` - 删除独立文件
7. 修改 `set_global_claude_md()` - 从独立文件读取
8. 修改 `distribute_claude_md()` - 从独立文件读取

### Phase 3: 数据迁移 (必须)
9. 实现 `migrate_claude_md_storage()`
10. 在初始化时调用迁移

### Phase 4: 优化 (可选)
11. 添加 `get_claude_md_files_metadata_only()` 优化列表性能
12. 实现软删除 (移到 trash)

---

## 九、总结

### 9.1 Skill/MCP 模式的核心特点

1. **文件内容独立存储**: 在专用目录下以文件形式存储
2. **元数据集中管理**: 在 `data.json` 中存储分类、标签等元数据
3. **ID = 路径**: 使用文件路径作为唯一标识
4. **支持符号链接**: 从插件导入时创建符号链接
5. **软删除**: 删除时移动到 trash 目录

### 9.2 CLAUDE.md 重构要点

1. **内容分离**: `content` 从 `data.json` 移至独立文件
2. **目录结构**: `~/.ensemble/claude-md/{id}/CLAUDE.md`
3. **向后兼容**: 支持从旧格式自动迁移
4. **UUID 作为 ID**: 保持当前设计，目录名使用 UUID

### 9.3 预期收益

1. **data.json 体积减小**: 不再存储大量文本内容
2. **一致性**: 与 Skill/MCP 存储模式保持一致
3. **可维护性**: 独立文件便于调试和手动编辑
4. **扩展性**: 未来可支持更多文件类型存储在同一目录
