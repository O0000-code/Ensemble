use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Skill {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: String,
    pub tags: Vec<String>,
    pub enabled: bool,
    pub source_path: String,
    pub scope: String, // "user" | "project"
    pub invocation: Option<String>,
    pub allowed_tools: Option<Vec<String>>,
    pub instructions: String,
    pub created_at: String,
    pub last_used: Option<String>,
    pub usage_count: u32,
    pub icon: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct McpServer {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: String,
    pub tags: Vec<String>,
    pub enabled: bool,
    pub source_path: String,
    pub scope: String, // "global" | "project"
    pub command: String,
    pub args: Vec<String>,
    pub env: Option<HashMap<String, String>>,
    pub provided_tools: Vec<Tool>,
    pub created_at: String,
    pub last_used: Option<String>,
    pub usage_count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Tool {
    pub name: String,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Scene {
    pub id: String,
    pub name: String,
    pub description: String,
    pub icon: String,
    pub skill_ids: Vec<String>,
    pub mcp_ids: Vec<String>,
    pub created_at: String,
    pub last_used: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Project {
    pub id: String,
    pub name: String,
    pub path: String,
    pub scene_id: String,
    pub last_synced: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Category {
    pub id: String,
    pub name: String,
    pub color: String,
    pub count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Tag {
    pub id: String,
    pub name: String,
    pub count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AppData {
    pub categories: Vec<Category>,
    pub tags: Vec<Tag>,
    pub scenes: Vec<Scene>,
    pub projects: Vec<Project>,
    pub skill_metadata: HashMap<String, SkillMetadata>,
    pub mcp_metadata: HashMap<String, McpMetadata>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SkillMetadata {
    pub category: String,
    pub tags: Vec<String>,
    pub enabled: bool,
    pub usage_count: u32,
    pub last_used: Option<String>,
    pub icon: Option<String>,
    pub scope: String, // "global" | "project"
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct McpMetadata {
    pub category: String,
    pub tags: Vec<String>,
    pub enabled: bool,
    pub usage_count: u32,
    pub last_used: Option<String>,
    pub scope: String, // "global" | "project"
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    pub skill_source_dir: String,
    pub mcp_source_dir: String,
    pub claude_config_dir: String,
    pub anthropic_api_key: Option<String>,
    pub auto_classify_new_items: bool,
    pub terminal_app: String,
    pub claude_command: String,
    pub has_completed_import: bool,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            skill_source_dir: "~/.ensemble/skills".to_string(),
            mcp_source_dir: "~/.ensemble/mcps".to_string(),
            claude_config_dir: "~/.claude".to_string(),
            anthropic_api_key: None,
            auto_classify_new_items: false,
            terminal_app: "Terminal".to_string(),
            claude_command: "claude".to_string(),
            has_completed_import: false,
        }
    }
}

/// MCP configuration file format (JSON file in MCP source directory)
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct McpConfigFile {
    pub name: String,
    pub description: Option<String>,
    pub command: String,
    pub args: Option<Vec<String>>,
    pub env: Option<HashMap<String, String>>,
    #[serde(rename = "providedTools")]
    pub provided_tools: Option<Vec<Tool>>,
}

/// Claude settings.json MCP configuration format
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClaudeMcpConfig {
    pub command: String,
    pub args: Option<Vec<String>>,
    pub env: Option<HashMap<String, String>>,
}

/// Claude settings.json root structure
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ClaudeSettings {
    #[serde(rename = "mcpServers", default)]
    pub mcp_servers: HashMap<String, ClaudeMcpConfig>,
    #[serde(flatten)]
    pub other: HashMap<String, serde_json::Value>,
}

/// Project configuration status
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectConfigStatus {
    pub has_claude_dir: bool,
    pub has_settings_local: bool,
    pub has_commands_md: bool,
    pub skill_count: u32,
    pub mcp_count: u32,
}

// ============================================================================
// Import-related types
// ============================================================================

/// Detected existing configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExistingConfig {
    pub skills: Vec<DetectedSkill>,
    pub mcps: Vec<DetectedMcp>,
    pub has_config: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DetectedSkill {
    pub name: String,
    pub path: String,
    pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DetectedMcp {
    pub name: String,
    pub command: String,
    pub args: Vec<String>,
    pub env: Option<HashMap<String, String>>,
}

/// Import item
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportItem {
    #[serde(rename = "type")]
    pub item_type: String, // "skill" | "mcp"
    pub name: String,
    pub source_path: String,
}

/// Import result
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportResult {
    pub success: bool,
    pub imported: ImportedCounts,
    pub errors: Vec<String>,
    pub backup_path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportedCounts {
    pub skills: u32,
    pub mcps: u32,
}

/// Backup information
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BackupInfo {
    pub path: String,
    pub timestamp: String,
    pub items_count: ImportedCounts,
}
