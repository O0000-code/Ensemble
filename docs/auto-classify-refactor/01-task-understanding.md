# 自动分类功能重构 - 任务理解文档

## 一、背景与目标

### 1.1 当前状态
- Ensemble 应用有一个 AI 自动分类功能，用于给 Skills 自动分配 Category 和 Tags
- 当前实现使用 **Anthropic API 直接调用** (通过 Rust 后端的 reqwest HTTP 客户端)
- 需要用户在 Settings 中配置 `ANTHROPIC_API_KEY`
- 只有 Skills 页面有 "Auto Classify" 按钮
- MCP Servers 和 CLAUDE.md 页面 **没有** 自动分类功能

### 1.2 目标状态
- 移除对 Anthropic API Key 的依赖
- 使用 **Claude CLI** (`claude` 命令) 来执行分类，因为所有 Ensemble 用户必然已安装 Claude Code
- 为 **Skills、MCPs、CLAUDE.md** 三个页面都添加自动分类功能
- 分类结果应包含：**Category、Tags、Icon** 三个维度
- 每次点击 "Auto Classify" 按钮时，**对所有项目重新分类**（不再跳过已分类的项目）

## 二、技术方案

### 2.1 Claude CLI 调用方式

基于探索结果，最佳调用方式为：

```bash
claude -p "分类prompt" \
  --output-format json \
  --json-schema '{"type":"object",...}' \
  --dangerously-skip-permissions
```

关键参数：
- `-p "prompt"`: 非交互模式，打印结果后退出
- `--output-format json`: JSON 格式输出
- `--json-schema`: 强制输出符合指定 schema 的结构化数据（输出在 `structured_output` 字段中）
- `--dangerously-skip-permissions`: 跳过权限检查，适用于自动化场景

### 2.2 数据传递策略

**方案选择**：将分类所需的所有数据通过 prompt 传入

**原因**：
1. 分类所需数据量可控（名称、描述、instructions/content 摘要）
2. 避免复杂的文件读取逻辑
3. 可以精确控制 Claude 看到的上下文
4. 避免 Claude 执行不必要的文件操作

**数据结构**：
```json
{
  "items": [
    {
      "id": "uuid-1",
      "name": "skill-name",
      "description": "skill description",
      "content_summary": "前500字符的内容摘要"
    }
  ],
  "available_categories": ["Development", "Writing", "Analysis"],
  "available_tags": ["frontend", "backend", "ai", "automation"],
  "available_icons": ["code", "file-text", "database", "sparkles"]
}
```

### 2.3 输出 Schema 设计

```json
{
  "type": "object",
  "properties": {
    "classifications": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "category": { "type": "string" },
          "tags": {
            "type": "array",
            "items": { "type": "string" },
            "maxItems": 5
          },
          "icon": { "type": "string" }
        },
        "required": ["id", "category", "tags", "icon"]
      }
    }
  },
  "required": ["classifications"]
}
```

## 三、需要修改的文件

### 3.1 后端 (Rust/Tauri)

| 文件 | 修改内容 |
|------|----------|
| `src-tauri/src/commands/classify.rs` | 重写 `auto_classify` 命令，改用 Claude CLI |
| `src-tauri/src/types.rs` | 更新 `ClassifyItem` 和 `ClassifyResult` 类型，添加 icon 字段 |
| `src-tauri/src/lib.rs` | 可能需要添加新命令 |

### 3.2 前端 (React/TypeScript)

| 文件 | 修改内容 |
|------|----------|
| `src/stores/skillsStore.ts` | 更新 `autoClassify` 方法，传递 icon 列表，接收 icon 结果 |
| `src/stores/mcpsStore.ts` | 添加 `autoClassify` 方法 |
| `src/stores/claudeMdStore.ts` | 添加 `autoClassify` 方法 |
| `src/pages/McpServersPage.tsx` | 添加 "Auto Classify" 按钮 |
| `src/pages/ClaudeMdPage.tsx` | 添加 "Auto Classify" 按钮 |
| `src/types/index.ts` | 更新 `ClassifyResult` 类型 |
| `src/components/common/IconPicker.tsx` | 导出图标名称列表供分类使用 |

### 3.3 设置相关

| 文件 | 修改内容 |
|------|----------|
| `src/pages/SettingsPage.tsx` | 移除或标记为可选的 API Key 配置 |
| `src/stores/settingsStore.ts` | 相应更新 |

## 四、分类 Prompt 设计原则

### 4.1 核心要求
1. **精准分类**：根据 name、description、content 准确判断功能领域
2. **合理标签**：选择2-5个最相关的标签，避免过度标签化
3. **适配图标**：选择最能代表该项目功能的图标
4. **复用已有**：优先使用 available_categories 和 available_tags 中的已有选项
5. **合理新建**：当没有合适选项时，建议合理的新分类/标签

### 4.2 分类依据

**Category 判断维度**：
- 主要功能领域（开发、写作、分析、设计等）
- 技术栈（前端、后端、数据库、AI等）
- 使用场景（自动化、调试、文档等）

**Tags 判断维度**：
- 具体技术（react, python, sql 等）
- 功能特性（search, generate, convert 等）
- 适用场景（debugging, testing, documentation 等）

**Icon 判断维度**：
- 核心功能的视觉隐喻
- 技术领域的标准图标
- 避免过于抽象或不相关的图标

## 五、实施约束

1. **不影响现有功能**：所有现有 UI 和功能必须保持正常工作
2. **不修改设计稿样式**：按钮样式、布局等保持与现有一致
3. **错误处理**：Claude CLI 调用失败时给出友好提示
4. **性能考虑**：批量分类时控制 prompt 大小，必要时分批处理
5. **向后兼容**：保留 API Key 配置作为可选备用方案

## 六、验收标准

1. Skills 页面 "Auto Classify" 按钮点击后，使用 Claude CLI 对所有 Skills 进行分类
2. MCPs 页面新增 "Auto Classify" 按钮，功能同上
3. CLAUDE.md 页面新增 "Auto Classify" 按钮，功能同上
4. 分类结果包含 Category、Tags、Icon 三个维度
5. 不再需要配置 Anthropic API Key 即可使用自动分类
6. 分类结果质量高，具有实际管理价值
