#![allow(unused_imports)]
#![allow(unused_variables)]

use crate::types::{
    AppData, BackupInfo, ClaudeMcpConfig, ClaudeSettings, DetectedMcp, DetectedSkill,
    ExistingConfig, ImportItem, ImportResult, ImportedCounts, McpConfigFile, McpMetadata,
    SkillMetadata,
};
use crate::utils::path::{expand_tilde, get_data_file_path};
use chrono::Utc;
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use walkdir::WalkDir;

/// Detect existing Claude Code configuration
#[tauri::command]
pub fn detect_existing_config(claude_config_dir: String) -> Result<ExistingConfig, String> {
    let claude_dir = expand_tilde(&claude_config_dir);

    // 1. Detect Skills in ~/.claude/skills/ directory
    let skills_dir = claude_dir.join("skills");
    let mut detected_skills = Vec::new();

    if skills_dir.exists() && skills_dir.is_dir() {
        // Iterate through skills directory
        for entry in WalkDir::new(&skills_dir)
            .min_depth(1)
            .max_depth(2)
            .into_iter()
            .filter_map(|e| e.ok())
        {
            let path = entry.path();

            // Look for SKILL.md files
            if path.is_file() && path.file_name().map_or(false, |n| n == "SKILL.md") {
                if let Some(skill_dir) = path.parent() {
                    let skill_name = skill_dir
                        .file_name()
                        .map(|n| n.to_string_lossy().to_string())
                        .unwrap_or_default();

                    // Get the real path if it's a symlink
                    let real_path = if skill_dir.symlink_metadata().map_or(false, |m| m.file_type().is_symlink()) {
                        fs::read_link(skill_dir)
                            .unwrap_or_else(|_| skill_dir.to_path_buf())
                            .to_string_lossy()
                            .to_string()
                    } else {
                        skill_dir.to_string_lossy().to_string()
                    };

                    // Read and parse SKILL.md to extract description
                    let description = fs::read_to_string(path)
                        .ok()
                        .and_then(|content| parse_skill_description(&content));

                    detected_skills.push(DetectedSkill {
                        name: skill_name,
                        path: real_path,
                        description,
                    });
                }
            }
        }
    }

    // 2. Detect MCPs in ~/.claude/settings.json
    let settings_path = claude_dir.join("settings.json");
    let mut detected_mcps = Vec::new();

    if settings_path.exists() {
        if let Ok(content) = fs::read_to_string(&settings_path) {
            if let Ok(settings) = serde_json::from_str::<ClaudeSettings>(&content) {
                for (name, config) in settings.mcp_servers {
                    detected_mcps.push(DetectedMcp {
                        name,
                        command: config.command,
                        args: config.args.unwrap_or_default(),
                        env: config.env,
                    });
                }
            }
        }
    }

    let has_config = !detected_skills.is_empty() || !detected_mcps.is_empty();

    Ok(ExistingConfig {
        skills: detected_skills,
        mcps: detected_mcps,
        has_config,
    })
}

/// Parse SKILL.md content to extract description
fn parse_skill_description(content: &str) -> Option<String> {
    // Try to find description in frontmatter or first paragraph
    let lines: Vec<&str> = content.lines().collect();

    // Skip the title line (usually starts with #)
    for line in lines.iter() {
        let trimmed = line.trim();
        // Skip empty lines, headers, and frontmatter markers
        if trimmed.is_empty() || trimmed.starts_with('#') || trimmed == "---" {
            continue;
        }
        // Return first non-empty, non-header line as description
        if !trimmed.is_empty() {
            // Truncate if too long
            let desc = if trimmed.len() > 200 {
                format!("{}...", &trimmed[..200])
            } else {
                trimmed.to_string()
            };
            return Some(desc);
        }
    }
    None
}

/// Backup existing configuration before import
#[tauri::command]
pub fn backup_before_import(
    ensemble_dir: String,
    claude_config_dir: String,
) -> Result<BackupInfo, String> {
    let ensemble_path = expand_tilde(&ensemble_dir);
    let claude_path = expand_tilde(&claude_config_dir);

    // 1. Create backup directory with timestamp
    let timestamp = Utc::now().format("%Y%m%d_%H%M%S").to_string();
    let backup_dir = ensemble_path.join("backups").join(&timestamp);
    fs::create_dir_all(&backup_dir).map_err(|e| format!("Failed to create backup directory: {}", e))?;

    let mut skill_count = 0u32;
    let mut mcp_count = 0u32;

    // 2. Backup settings.json
    let settings_path = claude_path.join("settings.json");
    if settings_path.exists() {
        let dest = backup_dir.join("claude-settings.json");
        fs::copy(&settings_path, &dest)
            .map_err(|e| format!("Failed to backup settings.json: {}", e))?;

        // Count MCPs in settings.json
        if let Ok(content) = fs::read_to_string(&settings_path) {
            if let Ok(settings) = serde_json::from_str::<ClaudeSettings>(&content) {
                mcp_count = settings.mcp_servers.len() as u32;
            }
        }
    }

    // 3. Backup skills directory
    let skills_dir = claude_path.join("skills");
    let backup_skills_dir = backup_dir.join("claude-skills");

    if skills_dir.exists() && skills_dir.is_dir() {
        fs::create_dir_all(&backup_skills_dir)
            .map_err(|e| format!("Failed to create skills backup directory: {}", e))?;

        // Iterate through skills directory and copy contents
        for entry in WalkDir::new(&skills_dir)
            .min_depth(1)
            .max_depth(1)
            .into_iter()
            .filter_map(|e| e.ok())
        {
            let src_path = entry.path();
            let skill_name = src_path
                .file_name()
                .map(|n| n.to_string_lossy().to_string())
                .unwrap_or_default();

            let dest_skill_dir = backup_skills_dir.join(&skill_name);

            // If source is a symlink, copy the actual content (not the symlink)
            let actual_src = if src_path.symlink_metadata().map_or(false, |m| m.file_type().is_symlink()) {
                fs::read_link(src_path).unwrap_or_else(|_| src_path.to_path_buf())
            } else {
                src_path.to_path_buf()
            };

            if actual_src.is_dir() {
                // Recursively copy the directory
                copy_dir_recursive(&actual_src, &dest_skill_dir)
                    .map_err(|e| format!("Failed to backup skill '{}': {}", skill_name, e))?;
                skill_count += 1;
            }
        }
    }

    // 4. Create backup-info.json
    let backup_info = BackupInfo {
        path: backup_dir.to_string_lossy().to_string(),
        timestamp: Utc::now().to_rfc3339(),
        items_count: ImportedCounts {
            skills: skill_count,
            mcps: mcp_count,
        },
    };

    let info_path = backup_dir.join("backup-info.json");
    let info_json =
        serde_json::to_string_pretty(&backup_info).map_err(|e| format!("Failed to serialize backup info: {}", e))?;
    fs::write(&info_path, info_json).map_err(|e| format!("Failed to write backup-info.json: {}", e))?;

    Ok(backup_info)
}

/// Recursively copy a directory
fn copy_dir_recursive(src: &Path, dst: &Path) -> std::io::Result<()> {
    if !dst.exists() {
        fs::create_dir_all(dst)?;
    }

    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let src_path = entry.path();
        let dst_path = dst.join(entry.file_name());

        if src_path.is_dir() {
            copy_dir_recursive(&src_path, &dst_path)?;
        } else {
            fs::copy(&src_path, &dst_path)?;
        }
    }

    Ok(())
}

/// Import existing configuration (non-destructive copy)
///
/// This function copies skills to ~/.ensemble/skills/ and extracts MCP configs
/// to ~/.ensemble/mcps/. It does NOT modify the original ~/.claude directory.
#[tauri::command]
pub fn import_existing_config(
    claude_config_dir: String,
    ensemble_dir: String,
    items: Vec<ImportItem>,
) -> Result<ImportResult, String> {
    let claude_path = expand_tilde(&claude_config_dir);
    let ensemble_path = expand_tilde(&ensemble_dir);

    // Ensure destination directories exist
    let skills_dest = ensemble_path.join("skills");
    let mcps_dest = ensemble_path.join("mcps");
    fs::create_dir_all(&skills_dest)
        .map_err(|e| format!("Failed to create skills directory: {}", e))?;
    fs::create_dir_all(&mcps_dest)
        .map_err(|e| format!("Failed to create mcps directory: {}", e))?;

    let mut imported_skills = 0u32;
    let mut imported_mcps = 0u32;
    let mut errors = Vec::new();

    for item in items {
        match item.item_type.as_str() {
            "skill" => {
                // Copy Skill directory
                match copy_skill(&item, &skills_dest) {
                    Ok(_) => imported_skills += 1,
                    Err(e) => errors.push(format!("Failed to import skill '{}': {}", item.name, e)),
                }
            }
            "mcp" => {
                // Extract MCP configuration from claude settings.json
                match extract_mcp_config(&item, &claude_path, &mcps_dest) {
                    Ok(_) => imported_mcps += 1,
                    Err(e) => errors.push(format!("Failed to import MCP '{}': {}", item.name, e)),
                }
            }
            _ => {
                errors.push(format!("Unknown item type: {}", item.item_type));
            }
        }
    }

    Ok(ImportResult {
        success: errors.is_empty(),
        imported: ImportedCounts {
            skills: imported_skills,
            mcps: imported_mcps,
        },
        errors,
        backup_path: String::new(), // Backup is done separately by backup_before_import
    })
}

/// Copy a skill directory to the ensemble skills directory
///
/// If the source is a symlink, copies the actual content (not the symlink itself)
fn copy_skill(item: &ImportItem, dest_dir: &Path) -> Result<(), String> {
    let source = Path::new(&item.source_path);

    // If source is a symlink, get the real path
    let real_source = if source
        .symlink_metadata()
        .map_or(false, |m| m.file_type().is_symlink())
    {
        fs::read_link(source).map_err(|e| format!("Failed to read symlink: {}", e))?
    } else {
        source.to_path_buf()
    };

    // Check if source exists
    if !real_source.exists() {
        return Err(format!(
            "Source path does not exist: {}",
            real_source.display()
        ));
    }

    // Destination directory for this skill
    let skill_dest = dest_dir.join(&item.name);

    // If destination already exists, report error but don't fail the entire import
    if skill_dest.exists() {
        return Err(format!(
            "Skill '{}' already exists in destination",
            item.name
        ));
    }

    // Recursively copy the entire skill directory
    copy_dir_recursive(&real_source, &skill_dest)
        .map_err(|e| format!("Failed to copy skill directory: {}", e))?;

    Ok(())
}

/// Extract MCP configuration from claude settings.json and save as standalone JSON file
///
/// This reads the MCP config from ~/.claude/settings.json and creates a standalone
/// JSON file in ~/.ensemble/mcps/<name>.json
fn extract_mcp_config(
    item: &ImportItem,
    claude_path: &Path,
    dest_dir: &Path,
) -> Result<(), String> {
    // Read claude settings.json
    let settings_path = claude_path.join("settings.json");
    let content = fs::read_to_string(&settings_path)
        .map_err(|e| format!("Failed to read settings.json: {}", e))?;
    let settings: ClaudeSettings =
        serde_json::from_str(&content).map_err(|e| format!("Failed to parse settings.json: {}", e))?;

    // Find the corresponding MCP configuration
    if let Some(mcp_config) = settings.mcp_servers.get(&item.name) {
        // Check if destination already exists
        let dest_path = dest_dir.join(format!("{}.json", item.name));
        if dest_path.exists() {
            return Err(format!(
                "MCP config '{}' already exists in destination",
                item.name
            ));
        }

        // Create standalone MCP config file
        let mcp_file = McpConfigFile {
            name: item.name.clone(),
            description: Some("Imported from Claude Code".to_string()),
            command: mcp_config.command.clone(),
            args: mcp_config.args.clone(),
            env: mcp_config.env.clone(),
            provided_tools: None, // MCP provided tools are discovered at runtime
        };

        let json = serde_json::to_string_pretty(&mcp_file)
            .map_err(|e| format!("Failed to serialize MCP config: {}", e))?;
        fs::write(&dest_path, json)
            .map_err(|e| format!("Failed to write MCP config file: {}", e))?;

        Ok(())
    } else {
        Err(format!("MCP '{}' not found in settings.json", item.name))
    }
}

/// Update Skill scope and sync to corresponding location
#[tauri::command]
pub fn update_skill_scope(
    skill_id: String,
    scope: String,
    ensemble_dir: String,
    claude_config_dir: String,
) -> Result<(), String> {
    let ensemble_path = expand_tilde(&ensemble_dir);
    let claude_path = expand_tilde(&claude_config_dir);

    // Extract skill name from skill_id (skill_id is the full path)
    let skill_path = Path::new(&skill_id);
    let skill_name = skill_path
        .file_name()
        .and_then(|n| n.to_str())
        .ok_or("Invalid skill ID")?;

    // Source path (in ensemble directory)
    let source_skill_path = ensemble_path.join("skills").join(skill_name);
    if !source_skill_path.exists() {
        return Err(format!("Skill not found: {}", skill_name));
    }

    // Target path (in claude directory)
    let claude_skills_dir = claude_path.join("skills");
    let target_skill_path = claude_skills_dir.join(skill_name);

    match scope.as_str() {
        "global" => {
            // Create symlink in ~/.claude/skills/ pointing to ~/.ensemble/skills/<name>
            fs::create_dir_all(&claude_skills_dir).map_err(|e| e.to_string())?;

            // If target exists (could be old symlink or directory), handle accordingly
            if target_skill_path.exists() || target_skill_path.symlink_metadata().is_ok() {
                if target_skill_path
                    .symlink_metadata()
                    .map(|m| m.file_type().is_symlink())
                    .unwrap_or(false)
                {
                    // It's a symlink, remove it
                    fs::remove_file(&target_skill_path).map_err(|e| e.to_string())?;
                } else if target_skill_path.is_dir() {
                    // It's a real directory, don't delete it - report warning
                    return Err(format!(
                        "Target path {} exists and is not a symlink",
                        target_skill_path.display()
                    ));
                }
            }

            // Create symlink
            #[cfg(unix)]
            std::os::unix::fs::symlink(&source_skill_path, &target_skill_path)
                .map_err(|e| e.to_string())?;

            #[cfg(windows)]
            std::os::windows::fs::symlink_dir(&source_skill_path, &target_skill_path)
                .map_err(|e| e.to_string())?;
        }
        "project" => {
            // If ~/.claude/skills/<name> is a symlink, remove it
            if target_skill_path.symlink_metadata().is_ok()
                && target_skill_path
                    .symlink_metadata()
                    .map(|m| m.file_type().is_symlink())
                    .unwrap_or(false)
            {
                fs::remove_file(&target_skill_path).map_err(|e| e.to_string())?;
            }
            // If it's not a symlink but exists, don't process (might be user manually placed)
        }
        _ => {
            return Err(format!("Invalid scope: {}", scope));
        }
    }

    // Update scope field in metadata
    update_skill_scope_in_metadata(&skill_id, &scope)?;

    Ok(())
}

/// Update skill scope in metadata file
fn update_skill_scope_in_metadata(skill_id: &str, scope: &str) -> Result<(), String> {
    let data_path = get_data_file_path();

    let mut app_data: AppData = if data_path.exists() {
        let content = fs::read_to_string(&data_path).map_err(|e| e.to_string())?;
        serde_json::from_str(&content).unwrap_or_default()
    } else {
        AppData::default()
    };

    let metadata = app_data
        .skill_metadata
        .entry(skill_id.to_string())
        .or_insert_with(SkillMetadata::default);

    metadata.scope = scope.to_string();

    let json = serde_json::to_string_pretty(&app_data).map_err(|e| e.to_string())?;
    fs::write(&data_path, json).map_err(|e| e.to_string())?;

    Ok(())
}

/// Update MCP scope and sync to corresponding location
#[tauri::command]
pub fn update_mcp_scope(
    mcp_id: String,
    scope: String,
    ensemble_dir: String,
    claude_config_dir: String,
) -> Result<(), String> {
    let ensemble_path = expand_tilde(&ensemble_dir);
    let claude_path = expand_tilde(&claude_config_dir);

    // Extract MCP name from mcp_id (mcp_id is the full path, e.g., ~/.ensemble/mcps/postgres.json)
    let mcp_path = Path::new(&mcp_id);
    let mcp_filename = mcp_path
        .file_name()
        .and_then(|n| n.to_str())
        .ok_or("Invalid MCP ID")?;
    let mcp_name = mcp_filename.trim_end_matches(".json");

    // Read MCP configuration
    let mcp_config_path = ensemble_path.join("mcps").join(mcp_filename);
    if !mcp_config_path.exists() {
        return Err(format!("MCP config not found: {}", mcp_name));
    }

    let mcp_content = fs::read_to_string(&mcp_config_path).map_err(|e| e.to_string())?;
    let mcp_config: McpConfigFile =
        serde_json::from_str(&mcp_content).map_err(|e| e.to_string())?;

    // Read Claude settings.json
    let claude_settings_path = claude_path.join("settings.json");
    let mut claude_settings: ClaudeSettings = if claude_settings_path.exists() {
        let content = fs::read_to_string(&claude_settings_path).map_err(|e| e.to_string())?;
        serde_json::from_str(&content).unwrap_or_default()
    } else {
        ClaudeSettings::default()
    };

    match scope.as_str() {
        "global" => {
            // Add to ~/.claude/settings.json mcpServers
            let claude_mcp_config = ClaudeMcpConfig {
                command: mcp_config.command.clone(),
                args: mcp_config.args.clone(),
                env: mcp_config.env.clone(),
            };
            claude_settings
                .mcp_servers
                .insert(mcp_name.to_string(), claude_mcp_config);
        }
        "project" => {
            // Remove from ~/.claude/settings.json mcpServers
            claude_settings.mcp_servers.remove(mcp_name);
        }
        _ => {
            return Err(format!("Invalid scope: {}", scope));
        }
    }

    // Write back Claude settings.json
    // Ensure directory exists
    if let Some(parent) = claude_settings_path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let json = serde_json::to_string_pretty(&claude_settings).map_err(|e| e.to_string())?;
    fs::write(&claude_settings_path, json).map_err(|e| e.to_string())?;

    // Update scope field in metadata
    update_mcp_scope_in_metadata(&mcp_id, &scope)?;

    Ok(())
}

/// Update MCP scope in metadata file
fn update_mcp_scope_in_metadata(mcp_id: &str, scope: &str) -> Result<(), String> {
    let data_path = get_data_file_path();

    let mut app_data: AppData = if data_path.exists() {
        let content = fs::read_to_string(&data_path).map_err(|e| e.to_string())?;
        serde_json::from_str(&content).unwrap_or_default()
    } else {
        AppData::default()
    };

    let metadata = app_data
        .mcp_metadata
        .entry(mcp_id.to_string())
        .or_insert_with(McpMetadata::default);

    metadata.scope = scope.to_string();

    let json = serde_json::to_string_pretty(&app_data).map_err(|e| e.to_string())?;
    fs::write(&data_path, json).map_err(|e| e.to_string())?;

    Ok(())
}

/// Install Finder Quick Action
#[tauri::command]
pub fn install_quick_action() -> Result<String, String> {
    let home = dirs::home_dir().ok_or("Cannot find home directory")?;
    let services_dir = home.join("Library/Services");

    // Ensure Services directory exists
    fs::create_dir_all(&services_dir).map_err(|e| e.to_string())?;

    let workflow_path = services_dir.join("Open with Ensemble.workflow");
    let contents_dir = workflow_path.join("Contents");

    // Remove existing workflow if present
    if workflow_path.exists() {
        fs::remove_dir_all(&workflow_path).map_err(|e| e.to_string())?;
    }

    // Create workflow directory structure
    fs::create_dir_all(&contents_dir).map_err(|e| e.to_string())?;

    // Create Info.plist with NSServices configuration (required for Finder right-click menu)
    let info_plist = r#"<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>NSServices</key>
    <array>
        <dict>
            <key>NSMenuItem</key>
            <dict>
                <key>default</key>
                <string>Open with Ensemble</string>
            </dict>
            <key>NSMessage</key>
            <string>runWorkflowAsService</string>
            <key>NSSendFileTypes</key>
            <array>
                <string>public.folder</string>
            </array>
        </dict>
    </array>
</dict>
</plist>"#;

    fs::write(contents_dir.join("Info.plist"), info_plist).map_err(|e| e.to_string())?;

    // Create document.wflow (Automator Quick Action workflow)
    // Complete workflow with proper metadata for Finder integration
    let document_wflow = r#"<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>AMApplicationBuild</key>
	<string>523</string>
	<key>AMApplicationVersion</key>
	<string>2.10</string>
	<key>AMDocumentVersion</key>
	<string>2</string>
	<key>actions</key>
	<array>
		<dict>
			<key>action</key>
			<dict>
				<key>AMAccepts</key>
				<dict>
					<key>Container</key>
					<string>List</string>
					<key>Optional</key>
					<true/>
					<key>Types</key>
					<array>
						<string>com.apple.cocoa.string</string>
					</array>
				</dict>
				<key>AMActionVersion</key>
				<string>2.0.3</string>
				<key>AMApplication</key>
				<array>
					<string>Automator</string>
				</array>
				<key>AMBundleIdentifier</key>
				<string>com.apple.RunShellScript</string>
				<key>AMCategory</key>
				<array>
					<string>AMCategoryUtilities</string>
				</array>
				<key>AMIconName</key>
				<string>RunShellScript</string>
				<key>AMName</key>
				<string>Run Shell Script</string>
				<key>AMParameterProperties</key>
				<dict>
					<key>COMMAND_STRING</key>
					<dict/>
					<key>CheckedForUserDefaultShell</key>
					<dict/>
					<key>inputMethod</key>
					<dict/>
					<key>shell</key>
					<dict/>
					<key>source</key>
					<dict/>
				</dict>
				<key>AMProvides</key>
				<dict>
					<key>Container</key>
					<string>List</string>
					<key>Types</key>
					<array>
						<string>com.apple.cocoa.string</string>
					</array>
				</dict>
				<key>ActionBundlePath</key>
				<string>/System/Library/Automator/Run Shell Script.action</string>
				<key>ActionName</key>
				<string>Run Shell Script</string>
				<key>ActionParameters</key>
				<dict>
					<key>COMMAND_STRING</key>
					<string>for f in "$@"
do
    "/Applications/Ensemble.app/Contents/MacOS/Ensemble" --launch "$f"
done</string>
					<key>CheckedForUserDefaultShell</key>
					<true/>
					<key>inputMethod</key>
					<integer>1</integer>
					<key>shell</key>
					<string>/bin/zsh</string>
					<key>source</key>
					<string></string>
				</dict>
				<key>BundleIdentifier</key>
				<string>com.apple.RunShellScript</string>
				<key>CFBundleVersion</key>
				<string>2.0.3</string>
				<key>CanShowSelectedItemsWhenRun</key>
				<false/>
				<key>CanShowWhenRun</key>
				<true/>
				<key>Category</key>
				<array>
					<string>AMCategoryUtilities</string>
				</array>
				<key>Class Name</key>
				<string>RunShellScriptAction</string>
				<key>InputUUID</key>
				<string>A6D90117-7F9E-4E1A-8B5B-2B8A5B5C5D5E</string>
				<key>Keywords</key>
				<array>
					<string>Shell</string>
					<string>Script</string>
					<string>Command</string>
					<string>Run</string>
					<string>Unix</string>
				</array>
				<key>OutputUUID</key>
				<string>B7E90228-8F9E-4E2B-9C6C-3C9B6C6D6E6F</string>
				<key>UUID</key>
				<string>C8F90339-9F9E-4F3C-AD7D-4DAC7D7E7F70</string>
				<key>UnlocalizedApplications</key>
				<array>
					<string>Automator</string>
				</array>
				<key>arguments</key>
				<dict>
					<key>0</key>
					<dict>
						<key>default value</key>
						<integer>0</integer>
						<key>name</key>
						<string>inputMethod</string>
						<key>required</key>
						<string>0</string>
						<key>type</key>
						<string>0</string>
						<key>uuid</key>
						<string>0</string>
					</dict>
					<key>1</key>
					<dict>
						<key>default value</key>
						<string></string>
						<key>name</key>
						<string>source</string>
						<key>required</key>
						<string>0</string>
						<key>type</key>
						<string>0</string>
						<key>uuid</key>
						<string>1</string>
					</dict>
					<key>2</key>
					<dict>
						<key>default value</key>
						<false/>
						<key>name</key>
						<string>CheckedForUserDefaultShell</string>
						<key>required</key>
						<string>0</string>
						<key>type</key>
						<string>0</string>
						<key>uuid</key>
						<string>2</string>
					</dict>
					<key>3</key>
					<dict>
						<key>default value</key>
						<string></string>
						<key>name</key>
						<string>COMMAND_STRING</string>
						<key>required</key>
						<string>0</string>
						<key>type</key>
						<string>0</string>
						<key>uuid</key>
						<string>3</string>
					</dict>
					<key>4</key>
					<dict>
						<key>default value</key>
						<string>/bin/zsh</string>
						<key>name</key>
						<string>shell</string>
						<key>required</key>
						<string>0</string>
						<key>type</key>
						<string>0</string>
						<key>uuid</key>
						<string>4</string>
					</dict>
				</dict>
				<key>isViewVisible</key>
				<integer>1</integer>
				<key>location</key>
				<string>451.000000:253.000000</string>
				<key>nibPath</key>
				<string>/System/Library/Automator/Run Shell Script.action/Contents/Resources/Base.lproj/main.nib</string>
			</dict>
			<key>isViewVisible</key>
			<integer>1</integer>
		</dict>
	</array>
	<key>connectors</key>
	<dict/>
	<key>workflowMetaData</key>
	<dict>
		<key>applicationBundleIDsByPath</key>
		<dict/>
		<key>applicationPaths</key>
		<array/>
		<key>inputTypeIdentifier</key>
		<string>com.apple.Automator.fileSystemObject.folder</string>
		<key>outputTypeIdentifier</key>
		<string>com.apple.Automator.nothing</string>
		<key>presentationMode</key>
		<integer>15</integer>
		<key>processesInput</key>
		<integer>0</integer>
		<key>serviceInputTypeIdentifier</key>
		<string>com.apple.Automator.fileSystemObject.folder</string>
		<key>serviceOutputTypeIdentifier</key>
		<string>com.apple.Automator.nothing</string>
		<key>serviceProcessesInput</key>
		<integer>0</integer>
		<key>systemImageName</key>
		<string>NSTouchBarFolderTemplate</string>
		<key>useAutomaticInputType</key>
		<integer>0</integer>
		<key>workflowTypeIdentifier</key>
		<string>com.apple.Automator.servicesMenu</string>
	</dict>
</dict>
</plist>"#;

    fs::write(contents_dir.join("document.wflow"), document_wflow).map_err(|e| e.to_string())?;

    // Refresh services cache
    std::process::Command::new("/System/Library/CoreServices/pbs")
        .arg("-update")
        .output()
        .ok();

    Ok(format!("Quick Action installed at: {}", workflow_path.display()))
}

/// Get launch arguments passed to the application
#[tauri::command]
pub fn get_launch_args() -> Vec<String> {
    std::env::args().collect()
}

/// Launch Claude Code for a folder
///
/// Uses native CLI methods for each terminal to avoid keystroke simulation
/// which can be affected by input method state.
#[tauri::command]
pub async fn launch_claude_for_folder(
    folder_path: String,
    terminal_app: String,
    claude_command: String,
    warp_open_mode: String,
) -> Result<(), String> {
    let folder = expand_tilde(&folder_path);

    if !folder.exists() {
        return Err(format!("Folder does not exist: {}", folder_path));
    }

    let folder_path_str = folder.display().to_string();

    match terminal_app.as_str() {
        "iTerm" => {
            // Use iTerm2's native AppleScript command execution (no keystroke)
            // Escape for AppleScript string
            let escaped_path = folder_path_str.replace('\\', "\\\\").replace('"', "\\\"");
            let escaped_cmd = claude_command.replace('\\', "\\\\").replace('"', "\\\"");
            let applescript = format!(
                r#"tell application "iTerm2"
    activate
    create window with default profile command "cd \"{}\" && {}"
end tell"#,
                escaped_path, escaped_cmd
            );

            std::process::Command::new("osascript")
                .arg("-e")
                .arg(&applescript)
                .spawn()
                .map_err(|e| format!("Failed to launch iTerm2: {}", e))?;
        }
        "Warp" => {
            use std::time::{SystemTime, UNIX_EPOCH};

            let timestamp = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .map(|d| d.as_millis())
                .unwrap_or(0);

            if warp_open_mode == "tab" {
                // New Tab mode: Use temporary script approach
                // This opens a new tab in existing Warp window and executes the command
                // No Accessibility permissions required
                let script_path = format!("/tmp/ensemble_warp_{}.sh", timestamp);
                let script_content = format!(
                    r#"#!/bin/zsh
cd "{}"
{}
# Keep shell interactive after command
exec zsh
"#,
                    folder_path_str.replace('"', "\\\""),
                    claude_command
                );

                fs::write(&script_path, &script_content)
                    .map_err(|e| format!("Failed to create temp script: {}", e))?;

                // Make script executable
                std::process::Command::new("chmod")
                    .arg("+x")
                    .arg(&script_path)
                    .output()
                    .map_err(|e| format!("Failed to make script executable: {}", e))?;

                // Open script with Warp - this opens a new tab and executes the script
                std::process::Command::new("open")
                    .arg("-a")
                    .arg("Warp")
                    .arg(&script_path)
                    .spawn()
                    .map_err(|e| format!("Failed to launch Warp: {}", e))?;

                // Clean up script after a delay
                let script_path_clone = script_path.clone();
                std::thread::spawn(move || {
                    std::thread::sleep(std::time::Duration::from_secs(5));
                    let _ = fs::remove_file(script_path_clone);
                });
            } else {
                // New Window mode: Use Launch Configuration YAML
                // This opens a new Warp window and executes the command
                let config_name = format!("ensemble-launch-{}", timestamp);

                // Get Warp launch configurations directory
                let home = dirs::home_dir().ok_or("Cannot find home directory")?;
                let warp_config_dir = home.join(".warp").join("launch_configurations");

                // Ensure directory exists
                fs::create_dir_all(&warp_config_dir)
                    .map_err(|e| format!("Failed to create Warp config directory: {}", e))?;

                let config_path = warp_config_dir.join(format!("{}.yaml", config_name));

                // Create YAML content - commands are plain strings (not exec: prefix)
                let yaml_content = format!(
                    r#"name: {}
windows:
  - tabs:
      - title: Claude Code
        layout:
          cwd: "{}"
          commands:
            - "{}"
"#,
                    config_name,
                    folder_path_str.replace('"', "\\\""),
                    claude_command.replace('"', "\\\"")
                );

                fs::write(&config_path, &yaml_content)
                    .map_err(|e| format!("Failed to create Warp launch config: {}", e))?;

                // Launch via URI scheme using config name
                std::process::Command::new("open")
                    .arg(format!("warp://launch/{}", config_name))
                    .spawn()
                    .map_err(|e| format!("Failed to launch Warp: {}", e))?;

                // Clean up config file after a delay
                let config_path_clone = config_path.clone();
                std::thread::spawn(move || {
                    std::thread::sleep(std::time::Duration::from_secs(10));
                    let _ = fs::remove_file(config_path_clone);
                });
            }
        }
        "Alacritty" => {
            // Alacritty uses CLI arguments directly (no AppleScript needed)
            // Use zsh -c with trailing zsh to keep terminal open after command
            let shell_command = format!("{}; zsh", claude_command);

            std::process::Command::new("alacritty")
                .arg("--working-directory")
                .arg(&folder_path_str)
                .arg("-e")
                .arg("zsh")
                .arg("-c")
                .arg(&shell_command)
                .spawn()
                .map_err(|e| format!("Failed to launch Alacritty: {}", e))?;
        }
        _ => {
            // Default to Terminal.app using native 'do script' command (no keystroke)
            let escaped_path = folder_path_str.replace('\\', "\\\\").replace('"', "\\\"");
            let escaped_cmd = claude_command.replace('\\', "\\\\").replace('"', "\\\"");
            let applescript = format!(
                r#"tell application "Terminal"
    activate
    do script "cd \"{}\" && {}"
end tell"#,
                escaped_path, escaped_cmd
            );

            std::process::Command::new("osascript")
                .arg("-e")
                .arg(&applescript)
                .spawn()
                .map_err(|e| format!("Failed to launch Terminal: {}", e))?;
        }
    }

    Ok(())
}

/// Open System Settings to Accessibility page
#[tauri::command]
pub fn open_accessibility_settings() -> Result<(), String> {
    std::process::Command::new("open")
        .arg("x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility")
        .spawn()
        .map_err(|e| format!("Failed to open System Settings: {}", e))?;
    Ok(())
}
