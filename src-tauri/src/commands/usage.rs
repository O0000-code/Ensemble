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

/// Internal structure to parse transcript entries
#[derive(Deserialize, Debug)]
struct TranscriptEntry {
    #[serde(rename = "type")]
    entry_type: Option<String>,
    timestamp: Option<String>,
    tool_name: Option<String>,
    tool_input: Option<ToolInput>,
}

/// Tool input structure for extracting skill name
#[derive(Deserialize, Debug)]
struct ToolInput {
    skill: Option<String>,
}

/// Scan Claude Code transcripts and extract usage statistics
///
/// Parses all `ses_*.jsonl` files in the transcripts directory
/// and extracts MCP tool calls and Skill invocations.
#[tauri::command]
pub async fn scan_usage_stats(claude_dir: String) -> Result<UsageStats, String> {
    let claude_path = expand_path(&claude_dir);
    let transcripts_dir = claude_path.join("transcripts");

    if !transcripts_dir.exists() {
        return Ok(UsageStats::default());
    }

    let mut stats = UsageStats::default();

    // Read all session files
    let entries = fs::read_dir(&transcripts_dir).map_err(|e| {
        format!(
            "Failed to read transcripts directory: {}",
            e
        )
    })?;

    for entry in entries.filter_map(|e| e.ok()) {
        let path = entry.path();

        // Only process ses_*.jsonl files
        if let Some(file_name) = path.file_name().and_then(|n| n.to_str()) {
            if file_name.starts_with("ses_") && file_name.ends_with(".jsonl") {
                if let Err(e) = process_transcript_file(&path, &mut stats) {
                    // Log error but continue processing other files
                    log::warn!("Failed to process transcript file {:?}: {}", path, e);
                }
            }
        }
    }

    Ok(stats)
}

/// Process a single transcript file and update statistics
fn process_transcript_file(path: &Path, stats: &mut UsageStats) -> Result<(), String> {
    let file = File::open(path).map_err(|e| format!("Failed to open file: {}", e))?;
    let reader = BufReader::new(file);

    for line in reader.lines() {
        let line = match line {
            Ok(l) => l,
            Err(_) => continue, // Skip malformed lines
        };

        // Skip empty lines
        if line.trim().is_empty() {
            continue;
        }

        // Parse JSON line
        let entry: TranscriptEntry = match serde_json::from_str(&line) {
            Ok(e) => e,
            Err(_) => continue, // Skip unparseable lines
        };

        // Only process tool_use entries
        if entry.entry_type.as_deref() != Some("tool_use") {
            continue;
        }

        let tool_name = match &entry.tool_name {
            Some(name) => name,
            None => continue,
        };

        let timestamp = entry.timestamp.clone();

        // Check for MCP tool: tool_name starts with "mcp__"
        if tool_name.starts_with("mcp__") {
            process_mcp_tool(tool_name, timestamp, stats);
        }
        // Check for Skill tool: tool_name == "Skill"
        else if tool_name == "Skill" {
            process_skill_tool(&entry, timestamp, stats);
        }
    }

    Ok(())
}

/// Process an MCP tool call and update statistics
fn process_mcp_tool(tool_name: &str, timestamp: Option<String>, stats: &mut UsageStats) {
    // MCP tool format: mcp__<server_name>__<tool_name>
    let parts: Vec<&str> = tool_name.split("__").collect();
    if parts.len() >= 2 {
        let server_name = parts[1].to_string();

        let mcp_usage = stats.mcps.entry(server_name).or_default();
        mcp_usage.total_calls += 1;

        // Update last_used if this timestamp is more recent
        if let Some(ts) = timestamp {
            update_last_used(&mut mcp_usage.last_used, ts);
        }
    }
}

/// Process a Skill tool call and update statistics
fn process_skill_tool(entry: &TranscriptEntry, timestamp: Option<String>, stats: &mut UsageStats) {
    // Extract skill name from tool_input.skill
    if let Some(ref tool_input) = entry.tool_input {
        if let Some(ref skill_name) = tool_input.skill {
            let skill_usage = stats.skills.entry(skill_name.clone()).or_default();
            skill_usage.call_count += 1;

            // Update last_used if this timestamp is more recent
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
            // Compare ISO timestamps (string comparison works for ISO format)
            if new_timestamp > *existing {
                *current = Some(new_timestamp);
            }
        }
        None => {
            *current = Some(new_timestamp);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_update_last_used_none() {
        let mut last_used: Option<String> = None;
        update_last_used(&mut last_used, "2026-01-01T10:00:00Z".to_string());
        assert_eq!(last_used, Some("2026-01-01T10:00:00Z".to_string()));
    }

    #[test]
    fn test_update_last_used_newer() {
        let mut last_used = Some("2026-01-01T10:00:00Z".to_string());
        update_last_used(&mut last_used, "2026-01-02T10:00:00Z".to_string());
        assert_eq!(last_used, Some("2026-01-02T10:00:00Z".to_string()));
    }

    #[test]
    fn test_update_last_used_older() {
        let mut last_used = Some("2026-01-02T10:00:00Z".to_string());
        update_last_used(&mut last_used, "2026-01-01T10:00:00Z".to_string());
        assert_eq!(last_used, Some("2026-01-02T10:00:00Z".to_string()));
    }

    #[test]
    fn test_process_mcp_tool() {
        let mut stats = UsageStats::default();
        process_mcp_tool("mcp__pencil__batch_design", Some("2026-01-01T10:00:00Z".to_string()), &mut stats);

        assert_eq!(stats.mcps.len(), 1);
        assert!(stats.mcps.contains_key("pencil"));
        let pencil = stats.mcps.get("pencil").unwrap();
        assert_eq!(pencil.total_calls, 1);
        assert_eq!(pencil.last_used, Some("2026-01-01T10:00:00Z".to_string()));
    }

    #[test]
    fn test_process_skill_tool() {
        let mut stats = UsageStats::default();
        let entry = TranscriptEntry {
            entry_type: Some("tool_use".to_string()),
            timestamp: Some("2026-01-01T10:00:00Z".to_string()),
            tool_name: Some("Skill".to_string()),
            tool_input: Some(ToolInput {
                skill: Some("deep-literature-search".to_string()),
            }),
        };

        process_skill_tool(&entry, Some("2026-01-01T10:00:00Z".to_string()), &mut stats);

        assert_eq!(stats.skills.len(), 1);
        assert!(stats.skills.contains_key("deep-literature-search"));
        let skill = stats.skills.get("deep-literature-search").unwrap();
        assert_eq!(skill.call_count, 1);
        assert_eq!(skill.last_used, Some("2026-01-01T10:00:00Z".to_string()));
    }
}
