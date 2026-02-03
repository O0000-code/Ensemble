use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs::{self, File};
use std::io::{BufRead, BufReader};
use std::path::Path;

use crate::utils::expand_path;

/// Usage statistics for a skill
#[derive(Serialize, Default, Clone, Debug)]
pub struct SkillUsage {
    pub call_count: u32,
    pub last_used: Option<String>,
}

/// Usage statistics for an MCP server
#[derive(Serialize, Default, Clone, Debug)]
pub struct McpUsage {
    pub total_calls: u32,
    pub last_used: Option<String>,
}

/// Aggregated usage statistics
#[derive(Serialize, Default, Debug)]
pub struct UsageStats {
    pub skills: HashMap<String, SkillUsage>,
    pub mcps: HashMap<String, McpUsage>,
}

// ============================================================================
// Claude Code Transcript JSON Structures (Nested Format)
// ============================================================================

/// Root transcript entry - can be "assistant", "user", or "tool_result" type
#[derive(Deserialize, Debug)]
struct TranscriptEntry {
    #[serde(rename = "type")]
    entry_type: Option<String>,
    timestamp: Option<String>,
    message: Option<Message>,
    // Legacy flat format support
    tool_name: Option<String>,
    tool_input: Option<ToolInputLegacy>,
}

/// Message containing content array
#[derive(Deserialize, Debug)]
struct Message {
    content: Option<Vec<ContentItem>>,
}

/// Content item - can be text, tool_use, or tool_result
#[derive(Deserialize, Debug)]
struct ContentItem {
    #[serde(rename = "type")]
    item_type: Option<String>,
    name: Option<String>,  // Tool name for tool_use items
    input: Option<ToolInput>,
}

/// Tool input for Skill tool calls
#[derive(Deserialize, Debug)]
struct ToolInput {
    skill: Option<String>,
}

/// Legacy tool input structure
#[derive(Deserialize, Debug)]
struct ToolInputLegacy {
    skill: Option<String>,
}

// ============================================================================
// Main Scan Function
// ============================================================================

/// Scan Claude Code transcripts and projects to extract usage statistics
#[tauri::command]
pub async fn scan_usage_stats(claude_dir: String) -> Result<UsageStats, String> {
    let claude_path = expand_path(&claude_dir);
    let mut stats = UsageStats::default();

    // 1. Scan transcripts directory (ses_*.jsonl files)
    let transcripts_dir = claude_path.join("transcripts");
    if transcripts_dir.exists() {
        scan_directory(&transcripts_dir, &mut stats, false)?;
    }

    // 2. Scan projects directory (project-specific transcripts)
    let projects_dir = claude_path.join("projects");
    if projects_dir.exists() {
        scan_projects_directory(&projects_dir, &mut stats)?;
    }

    Ok(stats)
}

/// Recursively scan projects directory, including session subdirectories and subagents folders
fn scan_projects_directory(projects_dir: &Path, stats: &mut UsageStats) -> Result<(u32, u32), String> {
    let mut total_files = 0u32;
    let mut total_calls = 0u32;

    if let Ok(project_entries) = fs::read_dir(projects_dir) {
        for project_entry in project_entries.filter_map(|e| e.ok()) {
            let project_path = project_entry.path();
            if project_path.is_dir() {
                // Scan the project directory for .jsonl files
                let (fp, tc) = scan_directory(&project_path, stats, true)?;
                total_files += fp;
                total_calls += tc;

                // Scan session subdirectories (they have session IDs as names)
                if let Ok(session_entries) = fs::read_dir(&project_path) {
                    for session_entry in session_entries.filter_map(|e| e.ok()) {
                        let session_path = session_entry.path();
                        if session_path.is_dir() {
                            // Scan the session directory for .jsonl files
                            let (fp, tc) = scan_directory(&session_path, stats, true)?;
                            total_files += fp;
                            total_calls += tc;

                            // Scan subagents directory if it exists
                            let subagents_dir = session_path.join("subagents");
                            if subagents_dir.exists() && subagents_dir.is_dir() {
                                let (fp, tc) = scan_directory(&subagents_dir, stats, true)?;
                                total_files += fp;
                                total_calls += tc;
                            }
                        }
                    }
                }
            }
        }
    }
    Ok((total_files, total_calls))
}

/// Scan a directory for .jsonl files and process them
fn scan_directory(dir: &Path, stats: &mut UsageStats, include_all_jsonl: bool) -> Result<(u32, u32), String> {
    let mut files_processed = 0u32;
    let mut tool_calls_found = 0u32;

    let entries = fs::read_dir(dir).map_err(|e| {
        format!("Failed to read directory {:?}: {}", dir, e)
    })?;

    for entry in entries.filter_map(|e| e.ok()) {
        let path = entry.path();

        if let Some(file_name) = path.file_name().and_then(|n| n.to_str()) {
            let should_process = if include_all_jsonl {
                file_name.ends_with(".jsonl")
            } else {
                file_name.starts_with("ses_") && file_name.ends_with(".jsonl")
            };

            if should_process {
                match process_transcript_file(&path, stats) {
                    Ok(calls) => {
                        files_processed += 1;
                        tool_calls_found += calls;
                    }
                    Err(e) => {
                        log::warn!("Failed to process transcript file {:?}: {}", path, e);
                    }
                }
            }
        }
    }

    Ok((files_processed, tool_calls_found))
}

// ============================================================================
// File Processing
// ============================================================================

/// Process a single transcript file and update statistics
fn process_transcript_file(path: &Path, stats: &mut UsageStats) -> Result<u32, String> {
    let file = File::open(path).map_err(|e| format!("Failed to open file: {}", e))?;
    let reader = BufReader::new(file);
    let mut tool_calls = 0u32;

    for line in reader.lines() {
        let line = match line {
            Ok(l) => l,
            Err(_) => continue,
        };

        if line.trim().is_empty() {
            continue;
        }

        let entry: TranscriptEntry = match serde_json::from_str(&line) {
            Ok(e) => e,
            Err(_) => continue,
        };

        let timestamp = entry.timestamp.clone();

        // Try nested format first (Claude Code's actual format)
        if entry.entry_type.as_deref() == Some("assistant") {
            if let Some(ref message) = entry.message {
                if let Some(ref content) = message.content {
                    for item in content {
                        if item.item_type.as_deref() == Some("tool_use") {
                            if let Some(ref name) = item.name {
                                if process_tool_call(name, &item.input, timestamp.clone(), stats) {
                                    tool_calls += 1;
                                }
                            }
                        }
                    }
                }
            }
        }

        // Also try legacy flat format
        if entry.entry_type.as_deref() == Some("tool_use") {
            if let Some(ref tool_name) = entry.tool_name {
                let legacy_input = entry.tool_input.as_ref().map(|ti| ToolInput {
                    skill: ti.skill.clone(),
                });
                if process_tool_call(tool_name, &legacy_input, timestamp, stats) {
                    tool_calls += 1;
                }
            }
        }
    }

    Ok(tool_calls)
}

/// Process a tool call and update statistics. Returns true if it was an MCP or Skill call.
fn process_tool_call(
    tool_name: &str,
    tool_input: &Option<ToolInput>,
    timestamp: Option<String>,
    stats: &mut UsageStats,
) -> bool {
    if tool_name.starts_with("mcp__") {
        process_mcp_tool(tool_name, timestamp, stats);
        true
    } else if tool_name == "Skill" {
        process_skill_tool(tool_input, timestamp, stats);
        true
    } else {
        false
    }
}

/// Process an MCP tool call and update statistics
fn process_mcp_tool(tool_name: &str, timestamp: Option<String>, stats: &mut UsageStats) {
    let parts: Vec<&str> = tool_name.split("__").collect();
    if parts.len() >= 2 {
        let server_name = parts[1].to_string();
        let mcp_usage = stats.mcps.entry(server_name).or_default();
        mcp_usage.total_calls += 1;
        if let Some(ts) = timestamp {
            update_last_used(&mut mcp_usage.last_used, ts);
        }
    }
}

/// Process a Skill tool call and update statistics
fn process_skill_tool(tool_input: &Option<ToolInput>, timestamp: Option<String>, stats: &mut UsageStats) {
    if let Some(ref input) = tool_input {
        if let Some(ref skill_name) = input.skill {
            let skill_usage = stats.skills.entry(skill_name.clone()).or_default();
            skill_usage.call_count += 1;
            if let Some(ts) = timestamp {
                update_last_used(&mut skill_usage.last_used, ts);
            }
        }
    }
}

/// Update last_used timestamp if the new timestamp is more recent
fn update_last_used(current: &mut Option<String>, new_timestamp: String) {
    match current {
        Some(existing) => {
            if new_timestamp > *existing {
                *current = Some(new_timestamp);
            }
        }
        None => {
            *current = Some(new_timestamp);
        }
    }
}

// ============================================================================
// Tests
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_actual_transcript_format() {
        let json = r#"{"parentUuid":"2c3b4e60-51d4-4ebb-8a76-e44ec647b350","type":"assistant","timestamp":"2026-02-01T14:34:26.934Z","message":{"content":[{"type":"tool_use","id":"toolu_01MXzPJSf2j8ik6Yx8gtkd5m","name":"mcp__roam-research__roam_fetch_page_by_title","input":{"title":"MCP","format":"raw"}}]}}"#;

        let entry: TranscriptEntry = serde_json::from_str(json).expect("Failed to parse");

        assert_eq!(entry.entry_type, Some("assistant".to_string()));
        assert!(entry.message.is_some());

        let message = entry.message.unwrap();
        assert!(message.content.is_some());

        let content = message.content.unwrap();
        assert_eq!(content.len(), 1);

        let item = &content[0];
        assert_eq!(item.item_type, Some("tool_use".to_string()));
        assert_eq!(item.name, Some("mcp__roam-research__roam_fetch_page_by_title".to_string()));
    }

    #[test]
    fn test_process_mcp_tool() {
        let mut stats = UsageStats::default();
        process_mcp_tool("mcp__pencil__batch_design", Some("2026-01-01T10:00:00Z".to_string()), &mut stats);

        assert_eq!(stats.mcps.len(), 1);
        assert!(stats.mcps.contains_key("pencil"));
        let pencil = stats.mcps.get("pencil").unwrap();
        assert_eq!(pencil.total_calls, 1);
    }

    #[test]
    fn test_process_mcp_tool_with_hyphen() {
        let mut stats = UsageStats::default();
        process_mcp_tool("mcp__roam-research__query", Some("2026-01-01T10:00:00Z".to_string()), &mut stats);

        assert_eq!(stats.mcps.len(), 1);
        assert!(stats.mcps.contains_key("roam-research"));
    }
}
