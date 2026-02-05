use serde::{Deserialize, Serialize};
use std::process::Command;

/// Item to be classified
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClassifyItem {
    pub id: String,
    pub name: String,
    pub description: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub instructions: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub content: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tools: Option<Vec<String>>,
}

/// Classification result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClassifyResult {
    pub id: String,
    pub suggested_category: String,
    pub suggested_tags: Vec<String>,
    pub suggested_icon: Option<String>,
}

/// Build the classification prompt with intelligent decision framework
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
- Repeated characters: "aaa", "111", "xxx", "bbb"
- Keyboard patterns: "asdf", "qwerty", "zxcv"
- Placeholders: "test", "temp", "todo", "foo", "bar", "misc", "stuff", "sample"
- Pure numbers: "123", "2024", "456"
- Single characters: "a", "x", "1"
- Meaningless: any string that doesn't describe a functional domain

**VALID categories have:**
- Meaningful name describing a functional domain
- Proper capitalization (Title Case)
- 1-3 words maximum

### Step 2: Match or Create

| Situation | Action |
|-----------|--------|
| A VALID existing category fits well | USE IT |
| A VALID existing category is close enough | USE IT (prefer consistency) |
| Only INVALID categories exist | CREATE a new meaningful one |
| No category covers this domain | CREATE a new one |

### Standard Categories (use these when applicable)
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
- Too broad: `tool`, `code`, `utility`, `helper`, `stuff`
- Too narrow: `reacthooks`, `flaskrouting`, `gitrebase`
- Non-words: `xyz`, `aaa`, `test123`, `asdf`

### Tag Assignment Rules
- **Quantity**: 1-2 tags only (prefer 1 if it captures the essence)
- **First tag**: Primary technology or function (git, python, sql, testing)
- **Second tag**: Only if it adds distinct value not covered by first
- **Reuse**: If a VALID existing tag fits, USE IT instead of creating synonym

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

Return ONLY valid JSON with classifications."#,
        categories_list = categories_list,
        tags_list = tags_list,
        icons_list = icons_list,
        items_json = items_json
    )
}

/// Auto-classify items using Claude CLI
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

    // Build JSON schema with strict tag constraints
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
        .map_err(|e| format!("Failed to execute Claude CLI: {}. Make sure Claude CLI is installed and available in PATH.", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        let stdout = String::from_utf8_lossy(&output.stdout);
        return Err(format!(
            "Claude CLI error: {}{}",
            stderr,
            if stdout.is_empty() { "".to_string() } else { format!("\nOutput: {}", stdout) }
        ));
    }

    // Parse output
    let stdout = String::from_utf8_lossy(&output.stdout);
    let response: serde_json::Value = serde_json::from_str(&stdout)
        .map_err(|e| format!("Failed to parse Claude response: {}. Response: {}", e, stdout))?;

    // Extract structured_output.classifications
    // Claude CLI returns: { "result": "", "structured_output": { "classifications": [...] }, ... }
    // We need to get structured_output.classifications
    let classifications = response
        .get("structured_output")
        .and_then(|so| so.get("classifications"))
        .and_then(|c| c.as_array())
        .ok_or_else(|| format!("Invalid response structure: missing structured_output.classifications. Response: {}", stdout))?;

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
                suggested_icon: c["icon"].as_str().map(String::from),
            })
        })
        .collect();

    Ok(results)
}

/// Validate Anthropic API key (deprecated - kept for backward compatibility)
#[allow(dead_code)]
async fn validate_api_key(api_key: String) -> Result<bool, String> {
    if api_key.is_empty() {
        return Ok(false);
    }

    // Make a minimal API call to validate the key
    let client = reqwest::Client::new();
    let response = client
        .post("https://api.anthropic.com/v1/messages")
        .header("x-api-key", &api_key)
        .header("anthropic-version", "2023-06-01")
        .header("content-type", "application/json")
        .json(&serde_json::json!({
            "model": "claude-3-haiku-20240307",
            "max_tokens": 10,
            "messages": [
                {
                    "role": "user",
                    "content": "Hi"
                }
            ]
        }))
        .send()
        .await
        .map_err(|e| format!("Failed to validate API key: {}", e))?;

    Ok(response.status().is_success())
}
