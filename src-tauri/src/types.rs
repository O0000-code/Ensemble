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
    pub installed_at: Option<String>,
    // Plugin source fields
    #[serde(skip_serializing_if = "Option::is_none")]
    pub install_source: Option<String>, // "local" | "plugin"
    #[serde(skip_serializing_if = "Option::is_none")]
    pub plugin_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub plugin_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub marketplace: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub plugin_enabled: Option<bool>,
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
    pub installed_at: Option<String>,
    /// URL for HTTP-type MCP servers
    #[serde(skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    /// MCP type: "stdio" or "http"
    #[serde(skip_serializing_if = "Option::is_none")]
    pub mcp_type: Option<String>,
    // Plugin source fields
    #[serde(skip_serializing_if = "Option::is_none")]
    pub install_source: Option<String>, // "local" | "plugin"
    #[serde(skip_serializing_if = "Option::is_none")]
    pub plugin_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub plugin_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub marketplace: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub plugin_enabled: Option<bool>,
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
    /// Associated CLAUDE.md file IDs (excluding isGlobal=true files)
    #[serde(default)]
    pub claude_md_ids: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TrashedScene {
    pub id: String,
    pub name: String,
    pub description: String,
    pub icon: String,
    pub skill_ids: Vec<String>,
    pub mcp_ids: Vec<String>,
    pub created_at: String,
    pub last_used: Option<String>,
    pub deleted_at: String,
    #[serde(default)]
    pub claude_md_ids: Vec<String>,
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
pub struct TrashedProject {
    pub id: String,
    pub name: String,
    pub path: String,
    pub scene_id: String,
    pub last_synced: Option<String>,
    pub deleted_at: String,
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
    #[serde(default)]
    pub trashed_scenes: Vec<TrashedScene>,
    #[serde(default)]
    pub trashed_projects: Vec<TrashedProject>,
    /// Imported plugin Skills' pluginId list
    #[serde(default)]
    pub imported_plugin_skills: Vec<String>,
    /// Imported plugin MCPs' pluginId list
    #[serde(default)]
    pub imported_plugin_mcps: Vec<String>,
    /// Managed CLAUDE.md files list
    #[serde(default)]
    pub claude_md_files: Vec<ClaudeMdFile>,
    /// Current global CLAUDE.md file ID
    #[serde(skip_serializing_if = "Option::is_none")]
    pub global_claude_md_id: Option<String>,
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
    #[serde(default = "default_warp_open_mode")]
    pub warp_open_mode: String,
    pub has_completed_import: bool,
    /// CLAUDE.md distribution target path
    #[serde(default = "default_claude_md_distribution_path")]
    pub claude_md_distribution_path: ClaudeMdDistributionPath,
}

fn default_warp_open_mode() -> String {
    "window".to_string()
}

fn default_claude_md_distribution_path() -> ClaudeMdDistributionPath {
    ClaudeMdDistributionPath::ClaudeDir
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
            warp_open_mode: "window".to_string(),
            has_completed_import: false,
            claude_md_distribution_path: ClaudeMdDistributionPath::default(),
        }
    }
}

/// MCP configuration file format (JSON file in MCP source directory)
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct McpConfigFile {
    pub name: String,
    pub description: Option<String>,
    #[serde(default)]
    pub command: String,
    pub args: Option<Vec<String>>,
    pub env: Option<HashMap<String, String>>,
    #[serde(rename = "providedTools")]
    pub provided_tools: Option<Vec<Tool>>,
    /// URL for HTTP-type MCP servers
    #[serde(skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    /// MCP type: "stdio" or "http"
    #[serde(rename = "type", skip_serializing_if = "Option::is_none")]
    pub mcp_type: Option<String>,
    // Plugin source fields
    #[serde(skip_serializing_if = "Option::is_none")]
    pub install_source: Option<String>, // "local" | "plugin"
    #[serde(skip_serializing_if = "Option::is_none")]
    pub plugin_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub plugin_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub marketplace: Option<String>,
}

/// Claude settings.json / .claude.json MCP configuration format
///
/// Supports both stdio MCPs (command + args) and HTTP MCPs (url).
/// `command` defaults to "" when missing (HTTP MCPs have no command).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClaudeMcpConfig {
    #[serde(default)]
    pub command: String,
    pub args: Option<Vec<String>>,
    pub env: Option<HashMap<String, String>>,
    /// URL for HTTP-type MCP servers
    #[serde(skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    /// MCP type: "stdio" or "http"
    #[serde(rename = "type", skip_serializing_if = "Option::is_none")]
    pub mcp_type: Option<String>,
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
    pub scope: Option<String>,        // "user" or "local"
    pub project_path: Option<String>, // Project path when scope is "local"
    /// URL for HTTP-type MCP servers
    #[serde(skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    /// MCP type: "stdio" or "http"
    #[serde(skip_serializing_if = "Option::is_none")]
    pub mcp_type: Option<String>,
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

// ============================================================================
// ~/.claude.json types (correct MCP configuration location)
// ============================================================================

/// ~/.claude.json complete structure
///
/// MCP configuration is stored here, NOT in ~/.claude/settings.json
/// - User scope: top-level `mcpServers` field
/// - Local scope: `projects[path].mcpServers` field
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ClaudeJson {
    /// User-level MCP configuration (Global scope - available in all projects)
    #[serde(default)]
    pub mcp_servers: HashMap<String, ClaudeMcpConfig>,

    /// Project-level configurations (Local scope - only in specific projects)
    #[serde(default)]
    pub projects: HashMap<String, ClaudeProjectConfig>,

    /// Preserve all other fields (numStartups, theme, tipsHistory, etc.)
    #[serde(flatten)]
    pub other: HashMap<String, serde_json::Value>,
}

/// Project-level configuration within ~/.claude.json
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ClaudeProjectConfig {
    /// Local-scope MCP configuration for this project
    #[serde(default)]
    pub mcp_servers: HashMap<String, ClaudeMcpConfig>,

    /// Preserve all other project fields
    #[serde(flatten)]
    pub other: HashMap<String, serde_json::Value>,
}

// ============================================================================
// MCP Tools Fetch types (for runtime tool discovery)
// ============================================================================

/// MCP Tool detailed information (fetched from MCP Server at runtime)
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct McpToolInfo {
    pub name: String,
    pub description: Option<String>,
    pub input_schema: Option<serde_json::Value>,
}

/// Result of fetching MCP tools from a server
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FetchMcpToolsResult {
    pub success: bool,
    pub tools: Vec<McpToolInfo>,
    pub error: Option<String>,
    pub server_info: Option<McpServerRuntimeInfo>,
}

/// MCP Server runtime information (from initialize response)
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct McpServerRuntimeInfo {
    pub name: String,
    pub version: Option<String>,
}

// ============================================================================
// Plugin-related types (for plugin detection and import)
// ============================================================================

/// Installed plugin information
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InstalledPlugin {
    /// Plugin ID: "plugin-name@marketplace"
    pub id: String,
    /// Plugin name
    pub name: String,
    /// Marketplace name
    pub marketplace: String,
    /// Plugin version
    pub version: String,
    /// Whether enabled in Claude Code settings
    pub enabled: bool,
    /// Installation path
    pub install_path: String,
    /// Whether plugin contains Skills
    pub has_skills: bool,
    /// Whether plugin contains MCP configurations
    pub has_mcp: bool,
}

/// Detected plugin Skill (for import dialog)
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DetectedPluginSkill {
    /// Plugin ID: "plugin-name@marketplace"
    pub plugin_id: String,
    /// Plugin display name
    pub plugin_name: String,
    /// Marketplace name
    pub marketplace: String,
    /// Skill name (directory name)
    pub skill_name: String,
    /// Skill description from SKILL.md
    pub description: String,
    /// Path to SKILL.md directory
    pub path: String,
    /// Plugin version
    pub version: String,
    /// Whether already imported to Ensemble
    pub is_imported: bool,
}

/// Detected plugin MCP (for import dialog)
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DetectedPluginMcp {
    /// Plugin ID: "plugin-name@marketplace"
    pub plugin_id: String,
    /// Plugin display name
    pub plugin_name: String,
    /// Marketplace name
    pub marketplace: String,
    /// MCP name (from .mcp.json)
    pub mcp_name: String,
    /// Execution command
    #[serde(default)]
    pub command: String,
    /// Command arguments
    pub args: Vec<String>,
    /// Environment variables
    pub env: Option<HashMap<String, String>>,
    /// URL for HTTP-type MCP servers
    #[serde(skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    /// MCP type: "stdio" or "http"
    #[serde(skip_serializing_if = "Option::is_none")]
    pub mcp_type: Option<String>,
    /// Path to .mcp.json file
    pub path: String,
    /// Plugin version
    pub version: String,
    /// Whether already imported to Ensemble
    pub is_imported: bool,
}

/// Plugin import item
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PluginImportItem {
    /// Plugin ID: "plugin-name@marketplace"
    pub plugin_id: String,
    /// Plugin display name
    pub plugin_name: String,
    /// Marketplace name
    pub marketplace: String,
    /// Item name (skill name or MCP name)
    pub item_name: String,
    /// Source file path
    pub source_path: String,
    /// Plugin version
    pub version: String,
}

// ============================================================================
// CLAUDE.md related types
// ============================================================================

/// CLAUDE.md file type
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum ClaudeMdType {
    Global,
    Project,
    Local,
}

impl ClaudeMdType {
    pub fn as_str(&self) -> &'static str {
        match self {
            ClaudeMdType::Global => "global",
            ClaudeMdType::Project => "project",
            ClaudeMdType::Local => "local",
        }
    }
}

/// CLAUDE.md distribution target path
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ClaudeMdDistributionPath {
    #[serde(rename = ".claude/CLAUDE.md")]
    ClaudeDir,
    #[serde(rename = "CLAUDE.md")]
    Root,
    #[serde(rename = "CLAUDE.local.md")]
    Local,
}

impl Default for ClaudeMdDistributionPath {
    fn default() -> Self {
        ClaudeMdDistributionPath::ClaudeDir
    }
}

impl ClaudeMdDistributionPath {
    pub fn as_str(&self) -> &'static str {
        match self {
            ClaudeMdDistributionPath::ClaudeDir => ".claude/CLAUDE.md",
            ClaudeMdDistributionPath::Root => "CLAUDE.md",
            ClaudeMdDistributionPath::Local => "CLAUDE.local.md",
        }
    }
}

/// Conflict resolution strategy
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum ClaudeMdConflictResolution {
    Overwrite,
    Backup,
    Skip,
}

impl Default for ClaudeMdConflictResolution {
    fn default() -> Self {
        ClaudeMdConflictResolution::Backup
    }
}

/// CLAUDE.md file info (managed file)
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClaudeMdFile {
    /// Unique identifier (UUID)
    pub id: String,

    /// Display name
    pub name: String,

    /// Description
    pub description: String,

    /// Original source path
    pub source_path: String,

    /// Original source type
    pub source_type: ClaudeMdType,

    /// File content - runtime populated from independent file
    /// Stored as empty string in data.json, actual content read from ~/.ensemble/claude-md/{id}/CLAUDE.md
    #[serde(default)]
    pub content: String,

    /// Managed file path (new field for independent file storage)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub managed_path: Option<String>,

    /// Whether set as global
    pub is_global: bool,

    /// Category ID
    #[serde(skip_serializing_if = "Option::is_none")]
    pub category_id: Option<String>,

    /// Tag ID list
    #[serde(default)]
    pub tag_ids: Vec<String>,

    /// Created time (ISO 8601)
    pub created_at: String,

    /// Updated time (ISO 8601)
    pub updated_at: String,

    /// File size in bytes
    pub size: u64,

    /// Custom icon name
    #[serde(skip_serializing_if = "Option::is_none")]
    pub icon: Option<String>,
}

/// Scan result item
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClaudeMdScanItem {
    /// File path
    pub path: String,

    /// File type
    #[serde(rename = "type")]
    pub file_type: ClaudeMdType,

    /// File size (bytes)
    pub size: u64,

    /// Last modified time (ISO 8601)
    pub modified_at: String,

    /// Whether already imported
    pub is_imported: bool,

    /// Corresponding ClaudeMdFile ID (if imported)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub imported_id: Option<String>,

    /// Content preview (first 500 chars)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub preview: Option<String>,

    /// Project name
    #[serde(skip_serializing_if = "Option::is_none")]
    pub project_name: Option<String>,
}

/// Scan result
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClaudeMdScanResult {
    /// Scanned file list
    pub items: Vec<ClaudeMdScanItem>,

    /// Number of directories scanned
    pub scanned_dirs: u32,

    /// Duration in milliseconds
    pub duration: u64,

    /// Error messages
    #[serde(default)]
    pub errors: Vec<String>,
}

/// Import options
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClaudeMdImportOptions {
    /// Source file path
    pub source_path: String,

    /// Custom name
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,

    /// Custom description
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,

    /// Category ID
    #[serde(skip_serializing_if = "Option::is_none")]
    pub category_id: Option<String>,

    /// Tag ID list
    #[serde(default)]
    pub tag_ids: Vec<String>,
}

/// Import result
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClaudeMdImportResult {
    /// Whether successful
    pub success: bool,

    /// Imported file
    #[serde(skip_serializing_if = "Option::is_none")]
    pub file: Option<ClaudeMdFile>,

    /// Error message
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

/// Distribution options
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClaudeMdDistributionOptions {
    /// ClaudeMdFile ID to distribute
    pub claude_md_id: String,

    /// Target project path
    pub project_path: String,

    /// Target file path
    pub target_path: ClaudeMdDistributionPath,

    /// Conflict resolution strategy
    #[serde(default)]
    pub conflict_resolution: ClaudeMdConflictResolution,
}

/// Distribution result
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClaudeMdDistributionResult {
    /// Whether successful
    pub success: bool,

    /// Target file full path
    pub target_path: String,

    /// Action performed
    pub action: String, // "created" | "overwritten" | "backed_up" | "skipped"

    /// Backup path
    #[serde(skip_serializing_if = "Option::is_none")]
    pub backup_path: Option<String>,

    /// Error message
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

/// Set global result
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SetGlobalResult {
    /// Whether successful
    pub success: bool,

    /// Previous global file ID
    #[serde(skip_serializing_if = "Option::is_none")]
    pub previous_global_id: Option<String>,

    /// Backup path
    #[serde(skip_serializing_if = "Option::is_none")]
    pub backup_path: Option<String>,

    /// Auto-imported file ID (when existing global was not managed)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub auto_imported_id: Option<String>,

    /// Error message
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

// ============================================================================
// Trash Recovery types
// ============================================================================

/// Trashed skill information
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TrashedSkill {
    pub id: String,
    pub name: String,
    pub path: String,
    pub deleted_at: String,
    pub description: String,
}

/// Trashed MCP information
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TrashedMcp {
    pub id: String,
    pub name: String,
    pub path: String,
    pub deleted_at: String,
    pub description: String,
}

/// Trashed CLAUDE.md file information
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TrashedClaudeMd {
    pub id: String,
    pub name: String,
    pub path: String,
    pub deleted_at: String,
}

/// Collection of all trashed items
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TrashedItems {
    pub skills: Vec<TrashedSkill>,
    pub mcps: Vec<TrashedMcp>,
    pub claude_md_files: Vec<TrashedClaudeMd>,
}
