# 自动分类功能重构 - 执行规划

## 一、任务概述

将 Ensemble 的自动分类功能从 Anthropic API 直接调用改为使用 Claude CLI，并扩展到 Skills、MCPs、CLAUDE.md 三个模块。

## 二、技术方案详细设计

### 2.1 Claude CLI 调用命令

```bash
claude -p "<prompt>" \
  --output-format json \
  --json-schema '<schema>' \
  --dangerously-skip-permissions \
  --model sonnet
```

### 2.2 JSON Schema 设计

```json
{
  "type": "object",
  "properties": {
    "classifications": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string", "description": "Item ID" },
          "category": { "type": "string", "description": "Suggested category name" },
          "tags": {
            "type": "array",
            "items": { "type": "string" },
            "description": "2-5 relevant tags"
          },
          "icon": { "type": "string", "description": "Lucide icon name" }
        },
        "required": ["id", "category", "tags", "icon"]
      }
    }
  },
  "required": ["classifications"]
}
```

### 2.3 Prompt 模板设计

```
You are an expert classifier for Claude Code skills, MCP servers, and configuration files.

## Task
Analyze each item and assign:
1. **Category**: A functional category (use existing if appropriate, or suggest new)
2. **Tags**: 2-5 descriptive tags (use existing if appropriate, or suggest new)
3. **Icon**: The most representative Lucide icon name

## Available Options

### Existing Categories
{categories_list}

### Existing Tags
{tags_list}

### Available Icons
{icons_list}

## Items to Classify

{items_json}

## Classification Guidelines

### For Category:
- Development: coding tools, frameworks, languages
- Writing: documentation, content creation, editing
- Research: search, analysis, data gathering
- Productivity: automation, workflow, organization
- Design: UI/UX, graphics, styling
- Data: databases, analytics, visualization
- DevOps: deployment, CI/CD, infrastructure
- AI/ML: machine learning, AI assistants, prompts
- Communication: messaging, email, collaboration

### For Tags:
- Be specific but not overly narrow
- Include technology names when relevant (react, python, sql)
- Include use case tags (debugging, testing, documentation)
- Maximum 5 tags per item

### For Icon:
- Choose icon that best represents the PRIMARY function
- Common mappings:
  - Code/development: code, terminal, file-code
  - Database: database, server
  - Search/research: search, globe
  - Writing/docs: file-text, pen-tool, book-open
  - AI/automation: sparkles, bot, wand-2
  - Design: palette, layers
  - Communication: mail, message-circle
  - Security: shield-check, lock, key

Respond with the classification JSON only.
```

## 三、文件修改计划

### 3.1 后端文件 (Rust)

| 文件 | 修改内容 | 优先级 |
|------|----------|--------|
| `src-tauri/src/commands/classify.rs` | 重写 `auto_classify` 使用 Claude CLI | P0 |
| `src-tauri/src/types.rs` | 更新 `ClassifyResult` 添加 `icon` 字段 | P0 |

### 3.2 前端类型文件

| 文件 | 修改内容 | 优先级 |
|------|----------|--------|
| `src/types/index.ts` | 添加 `ClassifyItem` 和 `ClassifyResult` 类型导出 | P0 |

### 3.3 前端 Store 文件

| 文件 | 修改内容 | 优先级 |
|------|----------|--------|
| `src/stores/skillsStore.ts` | 更新 `autoClassify` 方法，移除过滤逻辑，添加 icon 支持 | P0 |
| `src/stores/mcpsStore.ts` | 添加 `autoClassify` 方法和 `isClassifying` 状态 | P0 |
| `src/stores/claudeMdStore.ts` | 添加 `autoClassify` 方法和 `isAutoClassifying` 状态 | P0 |

### 3.4 前端页面文件

| 文件 | 修改内容 | 优先级 |
|------|----------|--------|
| `src/pages/McpServersPage.tsx` | 添加 Auto Classify 按钮 | P1 |
| `src/pages/ClaudeMdPage.tsx` | 添加 Auto Classify 按钮 | P1 |

### 3.5 前端组件文件

| 文件 | 修改内容 | 优先级 |
|------|----------|--------|
| `src/components/common/IconPicker.tsx` | 导出图标名称列表 `ICON_NAMES` | P0 |

### 3.6 设置相关（可选）

| 文件 | 修改内容 | 优先级 |
|------|----------|--------|
| `src/pages/SettingsPage.tsx` | API Key 配置标记为"可选（用于其他功能）" | P2 |

## 四、执行阶段划分

### Phase 1: 基础类型和后端重构
1. 更新 Rust 类型定义 (`ClassifyResult` 添加 `suggested_icon`)
2. 重写 `auto_classify` 命令使用 Claude CLI
3. 更新前端类型定义
4. 导出图标名称列表

### Phase 2: Skills 模块更新
1. 更新 `skillsStore.ts` 的 `autoClassify` 方法
2. 移除"只分类未分类项目"的过滤逻辑
3. 添加 icon 结果处理

### Phase 3: MCPs 模块添加
1. 在 `mcpsStore.ts` 添加 `autoClassify` 方法
2. 在 `McpServersPage.tsx` 添加按钮

### Phase 4: CLAUDE.md 模块添加
1. 在 `claudeMdStore.ts` 添加 `autoClassify` 方法
2. 在 `ClaudeMdPage.tsx` 添加按钮

### Phase 5: 测试和验证
1. 编译测试
2. 功能测试
3. UI 验证

## 五、详细代码变更

### 5.1 Rust: classify.rs 核心逻辑

```rust
use std::process::Command;
use serde_json::json;

#[tauri::command]
pub async fn auto_classify(
    items: Vec<ClassifyItem>,
    existing_categories: Vec<String>,
    existing_tags: Vec<String>,
    available_icons: Vec<String>,
) -> Result<Vec<ClassifyResult>, String> {
    if items.is_empty() {
        return Ok(vec![]);
    }

    // Build the prompt
    let prompt = build_classification_prompt(&items, &existing_categories, &existing_tags, &available_icons);

    // Build JSON schema
    let schema = json!({
        "type": "object",
        "properties": {
            "classifications": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "id": { "type": "string" },
                        "category": { "type": "string" },
                        "tags": { "type": "array", "items": { "type": "string" } },
                        "icon": { "type": "string" }
                    },
                    "required": ["id", "category", "tags", "icon"]
                }
            }
        },
        "required": ["classifications"]
    });

    // Execute Claude CLI
    let output = Command::new("claude")
        .arg("-p")
        .arg(&prompt)
        .arg("--output-format")
        .arg("json")
        .arg("--json-schema")
        .arg(schema.to_string())
        .arg("--dangerously-skip-permissions")
        .arg("--model")
        .arg("sonnet")
        .output()
        .map_err(|e| format!("Failed to execute Claude CLI: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Claude CLI error: {}", stderr));
    }

    // Parse output
    let stdout = String::from_utf8_lossy(&output.stdout);
    let response: serde_json::Value = serde_json::from_str(&stdout)
        .map_err(|e| format!("Failed to parse Claude response: {}", e))?;

    // Extract structured_output
    let classifications = response["structured_output"]["classifications"]
        .as_array()
        .ok_or("Invalid response structure")?;

    let results: Vec<ClassifyResult> = classifications
        .iter()
        .filter_map(|c| {
            Some(ClassifyResult {
                id: c["id"].as_str()?.to_string(),
                suggested_category: c["category"].as_str()?.to_string(),
                suggested_tags: c["tags"]
                    .as_array()?
                    .iter()
                    .filter_map(|t| t.as_str().map(String::from))
                    .collect(),
                suggested_icon: Some(c["icon"].as_str()?.to_string()),
            })
        })
        .collect();

    Ok(results)
}
```

### 5.2 TypeScript: 更新后的 ClassifyResult

```typescript
export interface ClassifyResult {
  id: string;
  suggested_category: string;
  suggested_tags: string[];
  suggested_icon?: string;
}
```

### 5.3 IconPicker 导出

```typescript
// 在 IconPicker.tsx 末尾添加
export const ICON_NAMES: string[] = PRESET_ICONS.map(icon => icon.name);
```

## 六、测试清单

- [ ] Claude CLI 正确安装并可执行
- [ ] Skills 自动分类功能正常
- [ ] MCPs 自动分类功能正常
- [ ] CLAUDE.md 自动分类功能正常
- [ ] 分类结果包含 category、tags、icon
- [ ] 新分类/标签能正确创建
- [ ] 图标正确显示
- [ ] 错误情况有友好提示
- [ ] 现有功能不受影响
- [ ] UI 样式符合设计稿

## 七、风险和缓解

| 风险 | 缓解措施 |
|------|----------|
| Claude CLI 未安装 | 检测并给出安装提示 |
| Claude CLI 执行超时 | 设置合理超时，分批处理大量项目 |
| JSON 解析失败 | 添加重试逻辑，降级到默认值 |
| 权限问题 | 使用 --dangerously-skip-permissions |
