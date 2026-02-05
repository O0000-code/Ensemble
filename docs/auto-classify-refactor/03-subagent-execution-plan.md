# SubAgent 执行规划文档 - 第一轮

## 执行概述

本轮 SubAgent 执行将完成自动分类功能重构的核心实现。所有 SubAgent 必须在 Git Worktree 目录 `/Users/bo/Documents/Development/Ensemble/Ensemble2-auto-classify-refactor` 中进行修改。

## 工作目录

**重要**: 所有文件修改必须在以下目录进行：
```
/Users/bo/Documents/Development/Ensemble/Ensemble2-auto-classify-refactor
```

## 前置阅读要求

每个 SubAgent 在执行任务前必须阅读：
1. `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/auto-classify-refactor/01-task-understanding.md`
2. `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/auto-classify-refactor/02-execution-plan.md`
3. 本文档（03-subagent-execution-plan.md）

---

## SubAgent 1: 后端类型和命令重构

### 任务描述
重写 Rust 后端的自动分类命令，从 Anthropic API 改为 Claude CLI 调用。

### 需要阅读的文件
- `/Users/bo/Documents/Development/Ensemble/Ensemble2-auto-classify-refactor/src-tauri/src/commands/classify.rs` (当前实现)
- `/Users/bo/Documents/Development/Ensemble/Ensemble2-auto-classify-refactor/src-tauri/src/types.rs` (类型定义)
- `/Users/bo/Documents/Development/Ensemble/Ensemble2-auto-classify-refactor/src-tauri/src/lib.rs` (命令注册)

### 需要修改的文件

#### 1. `src-tauri/src/types.rs`
更新 `ClassifyResult` 结构体，添加 `suggested_icon` 字段：
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClassifyResult {
    pub id: String,
    pub suggested_category: String,
    pub suggested_tags: Vec<String>,
    pub suggested_icon: Option<String>,  // 新增字段
}
```

#### 2. `src-tauri/src/commands/classify.rs`
完全重写，核心变更：
- 移除 `api_key` 参数
- 添加 `available_icons: Vec<String>` 参数
- 使用 `std::process::Command` 执行 Claude CLI
- 构建包含分类指南的 prompt
- 解析 `structured_output` 获取结果

### Prompt 模板（必须使用）

```rust
fn build_classification_prompt(
    items: &[ClassifyItem],
    categories: &[String],
    tags: &[String],
    icons: &[String],
) -> String {
    let items_json = serde_json::to_string_pretty(items).unwrap_or_default();
    let categories_list = if categories.is_empty() {
        "Development, Writing, Research, Productivity, Design, Data, DevOps, AI/ML, Communication, Other".to_string()
    } else {
        categories.join(", ")
    };
    let tags_list = if tags.is_empty() {
        "No existing tags".to_string()
    } else {
        tags.join(", ")
    };
    let icons_list = icons.join(", ");

    format!(r#"You are an expert classifier for Claude Code skills, MCP servers, and configuration files.

## Task
Analyze each item and assign:
1. **Category**: A functional category (prefer existing categories when appropriate)
2. **Tags**: 2-5 descriptive tags (prefer existing tags when appropriate, but create new ones if needed)
3. **Icon**: The most representative Lucide icon name from the available list

## Available Options

### Existing Categories (prefer these when applicable)
{categories_list}

### Existing Tags (prefer these when applicable)
{tags_list}

### Available Icons (MUST choose from this list)
{icons_list}

## Items to Classify

{items_json}

## Classification Guidelines

### For Category:
- **Development**: coding tools, frameworks, programming languages, IDE extensions
- **Writing**: documentation, content creation, editing, markdown
- **Research**: search, analysis, data gathering, literature review
- **Productivity**: automation, workflow optimization, task management
- **Design**: UI/UX, graphics, styling, visual design
- **Data**: databases, analytics, visualization, data processing
- **DevOps**: deployment, CI/CD, infrastructure, monitoring
- **AI/ML**: machine learning, AI assistants, prompts, models
- **Communication**: messaging, email, collaboration tools
- **Other**: items that don't fit other categories

### For Tags:
- Be specific but not overly narrow
- Include technology names when relevant (react, python, sql, etc.)
- Include use case tags (debugging, testing, documentation, etc.)
- Include domain tags (frontend, backend, fullstack, etc.)
- Maximum 5 tags per item, minimum 2 tags

### For Icon (MUST be from the available icons list):
- Choose icon that best represents the PRIMARY function
- Common mappings:
  - Code/development: code, terminal, file-code, braces
  - Database: database, server, hard-drive
  - Search/research: search, globe, compass
  - Writing/docs: file-text, pen-tool, book-open, notebook
  - AI/automation: sparkles, bot, wand-2, brain
  - Design: palette, layers, image
  - Communication: mail, message-circle, phone
  - Security: shield-check, lock, key
  - Files/folders: folder, file, archive
  - Settings/config: settings, sliders, wrench

Return ONLY the JSON classification result, no explanations."#,
        categories_list = categories_list,
        tags_list = tags_list,
        icons_list = icons_list,
        items_json = items_json
    )
}
```

### JSON Schema（必须使用）

```rust
let schema = serde_json::json!({
    "type": "object",
    "properties": {
        "classifications": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "id": { "type": "string", "description": "The item's original ID" },
                    "category": { "type": "string", "description": "Category name" },
                    "tags": {
                        "type": "array",
                        "items": { "type": "string" },
                        "minItems": 2,
                        "maxItems": 5,
                        "description": "2-5 relevant tags"
                    },
                    "icon": { "type": "string", "description": "Lucide icon name from available list" }
                },
                "required": ["id", "category", "tags", "icon"]
            }
        }
    },
    "required": ["classifications"]
});
```

### 预期输出
- 修改后的 `types.rs` 文件
- 完全重写的 `classify.rs` 文件
- 确保编译通过

---

## SubAgent 2: 前端类型和图标导出

### 任务描述
更新前端类型定义，并从 IconPicker 导出图标名称列表。

### 需要阅读的文件
- `/Users/bo/Documents/Development/Ensemble/Ensemble2-auto-classify-refactor/src/types/index.ts`
- `/Users/bo/Documents/Development/Ensemble/Ensemble2-auto-classify-refactor/src/components/common/IconPicker.tsx`

### 需要修改的文件

#### 1. `src/types/index.ts`
在文件中添加类型定义（在适当位置）：

```typescript
// Classification types
export interface ClassifyItem {
  id: string;
  name: string;
  description: string;
  content?: string;  // For CLAUDE.md files
  instructions?: string;  // For Skills
  tools?: string[];  // For MCPs - tool names
}

export interface ClassifyResult {
  id: string;
  suggested_category: string;
  suggested_tags: string[];
  suggested_icon?: string;
}
```

#### 2. `src/components/common/IconPicker.tsx`
在文件末尾（在 export default 之前）添加：

```typescript
// Export icon names for classification
export const ICON_NAMES: string[] = PRESET_ICONS.map(icon => icon.name);
```

### 预期输出
- 修改后的 `types/index.ts`
- 修改后的 `IconPicker.tsx`

---

## SubAgent 3: Skills Store 更新

### 任务描述
更新 skillsStore 的 autoClassify 方法，移除过滤逻辑，添加图标支持。

### 需要阅读的文件
- `/Users/bo/Documents/Development/Ensemble/Ensemble2-auto-classify-refactor/src/stores/skillsStore.ts`
- `/Users/bo/Documents/Development/Ensemble/Ensemble2-auto-classify-refactor/src/stores/appStore.ts`
- `/Users/bo/Documents/Development/Ensemble/Ensemble2-auto-classify-refactor/src/stores/settingsStore.ts`

### 需要修改的文件

#### `src/stores/skillsStore.ts`

关键变更：
1. 移除本地的 `ClassifyItem` 和 `ClassifyResult` 接口定义，改为从 `@/types` 导入
2. 更新 `autoClassify` 方法：
   - 移除 API Key 检查
   - 移除 `skillsToClassify` 过滤逻辑，改为对所有 skills 分类
   - 添加 `availableIcons` 参数传递
   - 添加 icon 结果处理

```typescript
import { ClassifyItem, ClassifyResult } from '@/types';
import { ICON_NAMES } from '@/components/common/IconPicker';

// 在 autoClassify 方法中：
autoClassify: async () => {
  if (!isTauri()) {
    console.warn('SkillsStore: Cannot auto-classify in browser mode');
    set({ error: 'Auto-classification is not available in browser mode' });
    return;
  }

  const { skills } = get();
  const { categories, tags } = useAppStore.getState();

  if (skills.length === 0) {
    set({ error: 'No skills to classify.' });
    return;
  }

  set({ isClassifying: true, error: null });

  try {
    // Prepare all skills for classification
    const items: ClassifyItem[] = skills.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      instructions: s.instructions,
    }));

    const existingCategories = categories.map((c) => c.name);
    const existingTags = tags.map((t) => t.name);

    // Call backend with available icons
    const results = await safeInvoke<ClassifyResult[]>('auto_classify', {
      items,
      existingCategories,
      existingTags,
      availableIcons: ICON_NAMES,
    });

    if (!results) {
      set({ error: 'Classification failed', isClassifying: false });
      return;
    }

    // Apply results
    for (const result of results) {
      const skill = skills.find((s) => s.id === result.id);
      if (skill) {
        // Update category, tags, and icon
        await safeInvoke('update_skill_metadata', {
          skillId: result.id,
          category: result.suggested_category,
          tags: result.suggested_tags,
          icon: result.suggested_icon,
        });
      }
    }

    // Reload skills
    await get().loadSkills();
    set({ isClassifying: false });
  } catch (error) {
    const message = typeof error === 'string' ? error : String(error);
    set({ error: message, isClassifying: false });
  }
},
```

### 预期输出
- 修改后的 `skillsStore.ts`

---

## SubAgent 4: MCPs Store 和页面更新

### 任务描述
为 MCPs 模块添加 autoClassify 功能和 UI 按钮。

### 需要阅读的文件
- `/Users/bo/Documents/Development/Ensemble/Ensemble2-auto-classify-refactor/src/stores/mcpsStore.ts`
- `/Users/bo/Documents/Development/Ensemble/Ensemble2-auto-classify-refactor/src/pages/McpServersPage.tsx`
- `/Users/bo/Documents/Development/Ensemble/Ensemble2-auto-classify-refactor/src/pages/SkillsPage.tsx` (参考按钮样式)

### 需要修改的文件

#### 1. `src/stores/mcpsStore.ts`

添加状态和方法：

```typescript
import { ClassifyItem, ClassifyResult } from '@/types';
import { ICON_NAMES } from '@/components/common/IconPicker';

// 在 interface McpsState 中添加：
isClassifying: boolean;

// 在 create 的初始状态中添加：
isClassifying: false,

// 添加方法：
autoClassify: async () => {
  if (!isTauri()) {
    console.warn('McpsStore: Cannot auto-classify in browser mode');
    set({ error: 'Auto-classification is not available in browser mode' });
    return;
  }

  const { mcpServers } = get();
  const { categories, tags } = useAppStore.getState();

  if (mcpServers.length === 0) {
    set({ error: 'No MCP servers to classify.' });
    return;
  }

  set({ isClassifying: true, error: null });

  try {
    // Prepare all MCPs for classification
    const items: ClassifyItem[] = mcpServers.map((m) => ({
      id: m.id,
      name: m.name,
      description: m.description,
      tools: m.providedTools.map(t => t.name),
    }));

    const existingCategories = categories.map((c) => c.name);
    const existingTags = tags.map((t) => t.name);

    const results = await safeInvoke<ClassifyResult[]>('auto_classify', {
      items,
      existingCategories,
      existingTags,
      availableIcons: ICON_NAMES,
    });

    if (!results) {
      set({ error: 'Classification failed', isClassifying: false });
      return;
    }

    // Apply results
    for (const result of results) {
      const mcp = mcpServers.find((m) => m.id === result.id);
      if (mcp) {
        await safeInvoke('update_mcp_metadata', {
          mcpId: result.id,
          category: result.suggested_category,
          tags: result.suggested_tags,
          icon: result.suggested_icon,
        });
      }
    }

    // Reload MCPs
    await get().loadMcps();
    set({ isClassifying: false });
  } catch (error) {
    const message = typeof error === 'string' ? error : String(error);
    set({ error: message, isClassifying: false });
  }
},
```

#### 2. `src/pages/McpServersPage.tsx`

在页面头部添加 Auto Classify 按钮。找到 PageHeader 的 actions prop，修改为：

```tsx
import { Sparkles, Loader2, Download } from 'lucide-react';

// 在组件中获取 store 状态：
const { autoClassify, isClassifying } = useMcpsStore();

// 修改 PageHeader 的 actions：
actions={
  <div className="flex items-center gap-2.5">
    <Button
      variant="secondary"
      size="small"
      icon={isClassifying ? <Loader2 className="animate-spin" /> : <Sparkles />}
      onClick={() => autoClassify()}
      disabled={isClassifying}
    >
      {isClassifying ? 'Classifying...' : 'Auto Classify'}
    </Button>
    <Button
      variant="secondary"
      size="small"
      icon={isDetectingMcps ? <Loader2 className="animate-spin" /> : <Download />}
      onClick={() => openMcpsModal()}
      disabled={isDetectingMcps}
    >
      {isDetectingMcps ? 'Detecting...' : 'Import'}
    </Button>
  </div>
}
```

### 预期输出
- 修改后的 `mcpsStore.ts`
- 修改后的 `McpServersPage.tsx`

---

## SubAgent 5: CLAUDE.md Store 和页面更新

### 任务描述
为 CLAUDE.md 模块添加 autoClassify 功能和 UI 按钮。

### 需要阅读的文件
- `/Users/bo/Documents/Development/Ensemble/Ensemble2-auto-classify-refactor/src/stores/claudeMdStore.ts`
- `/Users/bo/Documents/Development/Ensemble/Ensemble2-auto-classify-refactor/src/pages/ClaudeMdPage.tsx`

### 需要修改的文件

#### 1. `src/stores/claudeMdStore.ts`

添加状态和方法：

```typescript
import { ClassifyItem, ClassifyResult } from '@/types';
import { ICON_NAMES } from '@/components/common/IconPicker';

// 在 interface ClaudeMdState 中添加：
isAutoClassifying: boolean;

// 在 create 的初始状态中添加：
isAutoClassifying: false,

// 添加方法：
autoClassify: async () => {
  if (!isTauri()) {
    console.warn('ClaudeMdStore: Cannot auto-classify in browser mode');
    set({ error: 'Auto-classification is not available in browser mode' });
    return;
  }

  const { files } = get();
  const { categories, tags } = useAppStore.getState();

  if (files.length === 0) {
    set({ error: 'No CLAUDE.md files to classify.' });
    return;
  }

  set({ isAutoClassifying: true, error: null });

  try {
    // Prepare all files for classification
    // Use content summary (first 500 chars) to avoid too large prompts
    const items: ClassifyItem[] = files.map((f) => ({
      id: f.id,
      name: f.name,
      description: f.description,
      content: f.content.substring(0, 500),
    }));

    const existingCategories = categories.map((c) => c.name);
    const existingTags = tags.map((t) => t.name);

    const results = await safeInvoke<ClassifyResult[]>('auto_classify', {
      items,
      existingCategories,
      existingTags,
      availableIcons: ICON_NAMES,
    });

    if (!results) {
      set({ error: 'Classification failed', isAutoClassifying: false });
      return;
    }

    // Apply results - need to map category name to ID and tag names to IDs
    for (const result of results) {
      const file = files.find((f) => f.id === result.id);
      if (file) {
        // Find or create category ID
        let categoryId = categories.find(c => c.name === result.suggested_category)?.id;

        // Find or create tag IDs
        const tagIds = result.suggested_tags
          .map(tagName => tags.find(t => t.name === tagName)?.id)
          .filter((id): id is string => id !== undefined);

        await safeInvoke('update_claude_md', {
          id: file.id,
          categoryId: categoryId,
          tagIds: tagIds,
          icon: result.suggested_icon,
        });
      }
    }

    // Reload files
    await get().loadFiles();
    set({ isAutoClassifying: false });
  } catch (error) {
    const message = typeof error === 'string' ? error : String(error);
    set({ error: message, isAutoClassifying: false });
  }
},
```

#### 2. `src/pages/ClaudeMdPage.tsx`

在页面头部添加 Auto Classify 按钮。ClaudeMdPage 使用原生 button 而非 Button 组件，需保持一致。

找到 `headerActions` 变量，在最前面添加按钮：

```tsx
import { Sparkles, Loader2, Radar, Download } from 'lucide-react';

// 在组件中获取 store 状态：
const { autoClassify, isAutoClassifying } = useClaudeMdStore();

// 修改 headerActions：
const headerActions = (
  <div className="flex items-center gap-2.5">
    {/* Auto Classify Button */}
    <button
      onClick={() => autoClassify()}
      disabled={isAutoClassifying}
      className="
        flex h-8 items-center gap-1.5
        rounded-md border border-[#E5E5E5]
        bg-transparent
        px-3
        text-xs font-medium text-[#71717A]
        hover:bg-[#F4F4F5]
        disabled:opacity-50
        transition-colors
      "
    >
      {isAutoClassifying ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Sparkles className="h-3.5 w-3.5" />
      )}
      {isAutoClassifying ? 'Classifying...' : 'Auto Classify'}
    </button>

    {/* Existing Scan System Button */}
    <button
      onClick={handleScan}
      disabled={isScanning}
      className="..."
    >
      ...
    </button>

    {/* Existing Import Button */}
    <button
      onClick={handleImport}
      className="..."
    >
      ...
    </button>
  </div>
);
```

### 预期输出
- 修改后的 `claudeMdStore.ts`
- 修改后的 `ClaudeMdPage.tsx`

---

## 执行顺序

1. **SubAgent 1** (后端) - 必须首先完成，因为前端依赖后端命令
2. **SubAgent 2** (前端类型) - 在 SubAgent 1 后执行
3. **SubAgent 3, 4, 5** - 可以并行执行，因为它们修改不同的文件

## 验证步骤

所有 SubAgent 完成后：
1. 在 worktree 目录执行 `cargo build` 验证 Rust 编译
2. 执行 `npm run build` 验证前端编译
3. 执行 `npm run tauri dev` 启动应用进行功能测试
