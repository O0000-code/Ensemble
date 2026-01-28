use crate::types::{McpServer, ProjectConfigStatus};
use crate::utils::expand_path;
use serde_json::{json, Value};
use std::collections::HashMap;
use std::fs;

/// Write MCP configuration to project's settings.local.json
#[tauri::command]
pub fn write_mcp_config(project_path: String, mcp_servers: Vec<McpServer>) -> Result<(), String> {
    let project_dir = expand_path(&project_path);
    let claude_dir = project_dir.join(".claude");
    let settings_path = claude_dir.join("settings.local.json");

    // Ensure .claude directory exists
    fs::create_dir_all(&claude_dir).map_err(|e| e.to_string())?;

    // Load existing settings or create new
    let mut settings: Value = if settings_path.exists() {
        let content = fs::read_to_string(&settings_path).map_err(|e| e.to_string())?;
        serde_json::from_str(&content).unwrap_or(json!({}))
    } else {
        json!({})
    };

    // Build mcpServers object
    let mut mcp_config: HashMap<String, Value> = HashMap::new();
    for mcp in mcp_servers {
        let mut server_config = json!({
            "command": mcp.command,
            "args": mcp.args,
        });

        if let Some(env) = mcp.env {
            server_config["env"] = json!(env);
        }

        mcp_config.insert(mcp.name, server_config);
    }

    // Update settings
    settings["mcpServers"] = json!(mcp_config);

    // Write back
    let json = serde_json::to_string_pretty(&settings).map_err(|e| e.to_string())?;
    fs::write(&settings_path, json).map_err(|e| e.to_string())?;

    Ok(())
}

/// Sync project configuration - creates symlinks for skills and writes MCP config
#[tauri::command]
pub fn sync_project_config(
    project_path: String,
    skill_paths: Vec<String>,
    mcp_servers: Vec<McpServer>,
) -> Result<(), String> {
    let project_dir = expand_path(&project_path);
    let claude_dir = project_dir.join(".claude");
    let skills_dir = claude_dir.join("skills");

    // Ensure directories exist
    fs::create_dir_all(&skills_dir).map_err(|e| e.to_string())?;

    // Remove existing skill symlinks
    if skills_dir.exists() {
        for entry in fs::read_dir(&skills_dir).map_err(|e| e.to_string())? {
            let entry = entry.map_err(|e| e.to_string())?;
            let path = entry.path();
            if path.symlink_metadata().map(|m| m.file_type().is_symlink()).unwrap_or(false) {
                fs::remove_file(&path).map_err(|e| e.to_string())?;
            }
        }
    }

    // Create symlinks for skills
    for skill_path in skill_paths {
        let source = expand_path(&skill_path);
        if let Some(skill_name) = source.file_name() {
            let target = skills_dir.join(skill_name);
            
            #[cfg(unix)]
            std::os::unix::fs::symlink(&source, &target).map_err(|e| e.to_string())?;
            
            #[cfg(windows)]
            std::os::windows::fs::symlink_dir(&source, &target).map_err(|e| e.to_string())?;
        }
    }

    // Write MCP configuration
    write_mcp_config(project_path, mcp_servers)?;

    Ok(())
}

/// Clear project configuration
#[tauri::command]
pub fn clear_project_config(project_path: String) -> Result<(), String> {
    let project_dir = expand_path(&project_path);
    let claude_dir = project_dir.join(".claude");
    let skills_dir = claude_dir.join("skills");
    let settings_path = claude_dir.join("settings.local.json");

    // Remove skill symlinks
    if skills_dir.exists() {
        for entry in fs::read_dir(&skills_dir).map_err(|e| e.to_string())? {
            let entry = entry.map_err(|e| e.to_string())?;
            let path = entry.path();
            if path.symlink_metadata().map(|m| m.file_type().is_symlink()).unwrap_or(false) {
                fs::remove_file(&path).map_err(|e| e.to_string())?;
            }
        }
    }

    // Clear MCP settings
    if settings_path.exists() {
        let content = fs::read_to_string(&settings_path).map_err(|e| e.to_string())?;
        let mut settings: Value = serde_json::from_str(&content).unwrap_or(json!({}));
        settings["mcpServers"] = json!({});
        let json = serde_json::to_string_pretty(&settings).map_err(|e| e.to_string())?;
        fs::write(&settings_path, json).map_err(|e| e.to_string())?;
    }

    Ok(())
}

/// Get project configuration status
#[tauri::command]
pub fn get_project_config_status(project_path: String) -> Result<ProjectConfigStatus, String> {
    let project_dir = expand_path(&project_path);
    let claude_dir = project_dir.join(".claude");
    let skills_dir = claude_dir.join("skills");
    let settings_path = claude_dir.join("settings.local.json");
    let commands_path = claude_dir.join("COMMANDS.md");

    let has_claude_dir = claude_dir.exists();
    let has_settings_local = settings_path.exists();
    let has_commands_md = commands_path.exists();

    // Count skills (symlinks in skills dir)
    let skill_count = if skills_dir.exists() {
        fs::read_dir(&skills_dir)
            .map(|entries| {
                entries
                    .filter_map(|e| e.ok())
                    .filter(|e| {
                        e.path()
                            .symlink_metadata()
                            .map(|m| m.file_type().is_symlink())
                            .unwrap_or(false)
                    })
                    .count() as u32
            })
            .unwrap_or(0)
    } else {
        0
    };

    // Count MCPs from settings
    let mcp_count = if settings_path.exists() {
        fs::read_to_string(&settings_path)
            .ok()
            .and_then(|content| serde_json::from_str::<Value>(&content).ok())
            .and_then(|settings| settings["mcpServers"].as_object().map(|m| m.len() as u32))
            .unwrap_or(0)
    } else {
        0
    };

    Ok(ProjectConfigStatus {
        has_claude_dir,
        has_settings_local,
        has_commands_md,
        skill_count,
        mcp_count,
    })
}
