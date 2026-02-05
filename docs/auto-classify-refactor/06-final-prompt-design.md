# 最终 Prompt 设计文档

## 专家洞察整合

### 分类学专家
- 垃圾分类检测：重复字符(aaa)、键盘模式(asdf)、占位符(test)、纯数字(123)
- 复用条件：语义有效 + 领域相关 + 粒度匹配
- 新建条件：无有效分类 或 语义空白

### 标签设计专家
- 中等抽象层级：`git` ✓, `tool` ✗(太宽), `reacthooks` ✗(太窄)
- 1-2 个标签最佳
- 单个小写英文单词

### Prompt 工程专家
- 决策框架取代绝对指令
- 给 Claude 有边界的判断权
- 先评估质量，再匹配语义

### UX/信息架构专家
- Category = What（功能领域）
- Tag = How/Which（属性特性）
- 推荐 6-8 个标准分类

## 最终 Prompt 模板

```rust
fn build_classification_prompt(
    items: &[ClassifyItem],
    categories: &[String],
    tags: &[String],
    icons: &[String],
) -> String {
    let items_json = serde_json::to_string_pretty(items).unwrap_or_default();
    let categories_list = if categories.is_empty() {
        "(No existing categories)".to_string()
    } else {
        categories.join(", ")
    };
    let tags_list = if tags.is_empty() {
        "(No existing tags)".to_string()
    } else {
        tags.join(", ")
    };
    let icons_list = icons.join(", ");

    format!(r#"You are an expert classifier for Claude Code tools (Skills and MCP Servers).

## Philosophy
**Primary Goal**: ENTROPY REDUCTION - fewer, meaningful categories and tags that are consistently reused.
**Secondary Goal**: SEMANTIC ACCURACY - classifications must accurately represent the tool's function.

---

## CATEGORY DECISION FRAMEWORK

### Step 1: Evaluate Quality of Existing Categories
Before using any existing category, check if it's VALID:

**INVALID categories (never use these):**
- Repeated characters: "aaa", "111", "xxx"
- Keyboard patterns: "asdf", "qwerty"
- Placeholders: "test", "temp", "todo", "foo", "bar", "misc", "stuff"
- Pure numbers: "123", "2024"
- Single characters: "a", "x"
- Too vague: "Other", "Misc", "General" (unless nothing else fits)

**VALID categories have:**
- Meaningful name describing a functional domain
- Proper capitalization (Title Case)
- 1-3 words

### Step 2: Match or Create

| Situation | Action |
|-----------|--------|
| A VALID existing category fits well | USE IT |
| A VALID existing category is close enough | USE IT (prefer consistency) |
| Only INVALID categories exist | CREATE a new meaningful one |
| No category covers this domain | CREATE a new one |

### Standard Categories (prefer these when applicable)
- **Development**: coding tools, git, testing, debugging, code generation
- **Database**: SQL, NoSQL, data storage, queries
- **Web**: HTTP, APIs, web scraping, browsers
- **DevOps**: deployment, CI/CD, containers, infrastructure
- **AI**: machine learning, LLMs, embeddings, RAG
- **Research**: search, analysis, information gathering
- **Writing**: documentation, content, markdown
- **Design**: UI/UX, graphics, styling
- **Communication**: messaging, email, notifications
- **Productivity**: automation, workflow, organization

### Existing Categories to Evaluate
{categories_list}

---

## TAG DECISION FRAMEWORK

### Tag Quality Rules
A VALID tag is:
- Single lowercase English word (e.g., `python`, `api`, `testing`)
- Specific enough to filter (not `tool`, `code`, `utility`)
- General enough to reuse (not `reactusestate`, `gitrebase`)

**INVALID tags (never use):**
- Hyphenated: `api-testing`, `code-review`
- Multi-word: `machine learning`
- Too broad: `tool`, `code`, `utility`, `helper`
- Too narrow: `reacthooks`, `flaskrouting`
- Non-words: `xyz`, `aaa`, `test123`

### Step 1: Check Existing Tags
Look for VALID existing tags that match. Prefer reuse over creating synonyms.

### Step 2: Assign Tags

| Situation | Action |
|-----------|--------|
| VALID existing tag fits | USE IT |
| No valid tag fits, concept is reusable | CREATE new single-word tag |
| Only 1 tag captures the essence | Use just 1 tag (preferred) |

### Tag Assignment
- **Quantity**: 1-2 tags (never more than 2)
- **First tag**: Primary technology or function (git, python, sql, testing)
- **Second tag**: Only if it adds distinct value

### Existing Tags to Evaluate
{tags_list}

---

## ICON SELECTION

Choose from: {icons_list}

Select the icon that best represents the PRIMARY function.

---

## Items to Classify

{items_json}

---

## Output

Return ONLY valid JSON with classifications."#,
        categories_list = categories_list,
        tags_list = tags_list,
        icons_list = icons_list,
        items_json = items_json
    )
}
```

## JSON Schema

```rust
let schema = serde_json::json!({
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
                        "items": {
                            "type": "string",
                            "pattern": "^[a-z]+$"
                        },
                        "minItems": 1,
                        "maxItems": 2
                    },
                    "icon": { "type": "string" }
                },
                "required": ["id", "category", "tags", "icon"]
            }
        }
    },
    "required": ["classifications"]
});
```

## 设计要点

1. **决策框架**：不是"必须用已有"，而是"先评估质量，再决定用或建"
2. **垃圾检测**：明确列出无效模式，让 Claude 知道可以跳过
3. **标准分类**：提供 10 个推荐分类，引导一致性
4. **标签限制**：保持 1-2 个，单词格式
5. **灵活性**：允许创建新的，但需要理由（无有效选项时）
