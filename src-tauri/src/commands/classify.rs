use serde::{Deserialize, Serialize};

/// Item to be classified
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClassifyItem {
    pub id: String,
    pub name: String,
    pub description: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub instructions: Option<String>,
}

/// Classification result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClassifyResult {
    pub id: String,
    pub suggested_category: String,
    pub suggested_tags: Vec<String>,
    pub confidence: f32,
}

/// Auto-classify items using Anthropic API
#[tauri::command]
pub async fn auto_classify(
    items: Vec<ClassifyItem>,
    api_key: String,
    existing_categories: Vec<String>,
    existing_tags: Vec<String>,
) -> Result<Vec<ClassifyResult>, String> {
    if api_key.is_empty() {
        return Err("API key is required for auto-classification".to_string());
    }

    if items.is_empty() {
        return Ok(vec![]);
    }

    // Build the prompt for classification
    let items_json = serde_json::to_string_pretty(&items)
        .map_err(|e| format!("Failed to serialize items: {}", e))?;

    let categories_list = if existing_categories.is_empty() {
        "Development, Design, Research, Productivity, Creative, Data, DevOps, Other".to_string()
    } else {
        existing_categories.join(", ")
    };

    let tags_hint = if existing_tags.is_empty() {
        "React, TypeScript, Python, AI/ML, Frontend, Backend, Database, API, CLI, Documentation".to_string()
    } else {
        existing_tags.join(", ")
    };

    let prompt = format!(
        r#"You are a classification assistant. Analyze the following items and suggest appropriate categories and tags for each.

Available categories: {}
Suggested tags (you can use these or suggest new ones): {}

Items to classify:
{}

For each item, respond with a JSON array containing objects with this exact structure:
{{
  "id": "the item's id",
  "suggested_category": "one category from the list",
  "suggested_tags": ["tag1", "tag2", "tag3"],
  "confidence": 0.9
}}

Respond ONLY with the JSON array, no additional text or explanation."#,
        categories_list, tags_hint, items_json
    );

    // Call Anthropic API
    let client = reqwest::Client::new();
    let response = client
        .post("https://api.anthropic.com/v1/messages")
        .header("x-api-key", &api_key)
        .header("anthropic-version", "2023-06-01")
        .header("content-type", "application/json")
        .json(&serde_json::json!({
            "model": "claude-3-haiku-20240307",
            "max_tokens": 4096,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        }))
        .send()
        .await
        .map_err(|e| format!("Failed to call Anthropic API: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let error_text = response.text().await.unwrap_or_default();
        return Err(format!(
            "Anthropic API error ({}): {}",
            status, error_text
        ));
    }

    let response_json: serde_json::Value = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse API response: {}", e))?;

    // Extract the text content from the response
    let content = response_json["content"]
        .as_array()
        .and_then(|arr| arr.first())
        .and_then(|c| c["text"].as_str())
        .ok_or_else(|| "Invalid API response format".to_string())?;

    // Parse the JSON array from the response
    let results: Vec<ClassifyResult> = serde_json::from_str(content)
        .map_err(|e| format!("Failed to parse classification results: {}. Response: {}", e, content))?;

    Ok(results)
}

/// Validate Anthropic API key
#[tauri::command]
pub async fn validate_api_key(api_key: String) -> Result<bool, String> {
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
